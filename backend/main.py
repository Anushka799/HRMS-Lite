from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, field_validator
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from typing import Optional, List
import os
import re
import certifi

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://mohduzair171222_db_user:NPYKhy8PoXAj6ql3@keybo.mdqvp2v.mongodb.net/hrms_lite?appName=Keybo")

app = FastAPI(title="HRMS Lite API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    allow_headers=["*"],
)

# Database connection
client = None
db = None

@app.on_event("startup")
async def startup_db():
    global client, db
    client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())
    db = client.hrms_lite
    print("Connected to MongoDB Atlas")

@app.on_event("shutdown")
async def shutdown_db():
    global client
    if client:
        client.close()

# Pydantic Models
class EmployeeCreate(BaseModel):
    employeeId: str
    fullName: str
    email: EmailStr
    department: str

    @field_validator('employeeId', 'fullName', 'department')
    @classmethod
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Field cannot be empty')
        return v.strip()

class AttendanceCreate(BaseModel):
    date: str
    status: str

    @field_validator('date')
    @classmethod
    def validate_date(cls, v):
        if not re.match(r'^\d{4}-\d{2}-\d{2}$', v):
            raise ValueError('Date must be in YYYY-MM-DD format')
        return v

    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        normalized = v.strip().capitalize()
        if normalized not in ['Present', 'Absent']:
            raise ValueError('Status must be Present or Absent')
        return normalized

# Helper
def now_iso():
    return datetime.utcnow().isoformat() + "Z"

# Routes
@app.get("/api/health")
async def health():
    return {"status": "ok", "time": now_iso()}

@app.get("/api/employees")
async def list_employees():
    employees = await db.employees.find().sort("createdAt", -1).to_list(1000)
    result = []
    for emp in employees:
        attendance = await db.attendance.find({"employeeId": emp["employeeId"]}).to_list(1000)
        present_count = sum(1 for a in attendance if a["status"] == "Present")
        result.append({
            "employeeId": emp["employeeId"],
            "fullName": emp["fullName"],
            "email": emp["email"],
            "department": emp["department"],
            "createdAt": emp["createdAt"],
            "presentCount": present_count,
            "attendanceCount": len(attendance)
        })
    return {"data": result}

@app.post("/api/employees", status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate):
    # Check duplicates
    existing = await db.employees.find_one({
        "$or": [
            {"employeeId": employee.employeeId},
            {"email": employee.email.lower()}
        ]
    })
    if existing:
        conflict_field = "employeeId" if existing["employeeId"] == employee.employeeId else "email"
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": f"Duplicate {conflict_field}", "details": {"field": conflict_field}}
        )
    
    new_employee = {
        "employeeId": employee.employeeId,
        "fullName": employee.fullName,
        "email": employee.email.lower(),
        "department": employee.department,
        "createdAt": now_iso()
    }
    await db.employees.insert_one(new_employee)
    del new_employee["_id"]
    return {"data": new_employee}

@app.delete("/api/employees/{employee_id}")
async def delete_employee(employee_id: str):
    existing = await db.employees.find_one({"employeeId": employee_id})
    if not existing:
        raise HTTPException(status_code=404, detail={"error": "Employee not found"})
    
    await db.employees.delete_one({"employeeId": employee_id})
    await db.attendance.delete_many({"employeeId": employee_id})
    
    return {"data": {
        "employeeId": existing["employeeId"],
        "fullName": existing["fullName"],
        "email": existing["email"],
        "department": existing["department"],
        "createdAt": existing["createdAt"]
    }}

@app.get("/api/employees/{employee_id}/attendance")
async def list_attendance(employee_id: str, date: Optional[str] = None):
    existing = await db.employees.find_one({"employeeId": employee_id})
    if not existing:
        raise HTTPException(status_code=404, detail={"error": "Employee not found"})
    
    query = {"employeeId": employee_id}
    if date:
        if not re.match(r'^\d{4}-\d{2}-\d{2}$', date):
            raise HTTPException(status_code=400, detail={"error": "Invalid date format (use YYYY-MM-DD)"})
        query["date"] = date
    
    records = await db.attendance.find(query).sort("date", -1).to_list(1000)
    return {"data": [{
        "id": str(r["_id"]),
        "employeeId": r["employeeId"],
        "date": r["date"],
        "status": r["status"],
        "createdAt": r["createdAt"]
    } for r in records]}

@app.post("/api/employees/{employee_id}/attendance", status_code=status.HTTP_201_CREATED)
async def mark_attendance(employee_id: str, attendance: AttendanceCreate):
    existing = await db.employees.find_one({"employeeId": employee_id})
    if not existing:
        raise HTTPException(status_code=404, detail={"error": "Employee not found"})
    
    # Check duplicate
    duplicate = await db.attendance.find_one({"employeeId": employee_id, "date": attendance.date})
    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": "Attendance already marked for this date", "details": {"field": "date"}}
        )
    
    new_attendance = {
        "employeeId": employee_id,
        "date": attendance.date,
        "status": attendance.status,
        "createdAt": now_iso()
    }
    await db.attendance.insert_one(new_attendance)
    
    return {"data": {
        "employeeId": employee_id,
        "date": attendance.date,
        "status": attendance.status
    }}

@app.get("/api/summary")
async def get_summary():
    total_employees = await db.employees.count_documents({})
    total_attendance = await db.attendance.count_documents({})
    total_present = await db.attendance.count_documents({"status": "Present"})
    total_absent = await db.attendance.count_documents({"status": "Absent"})
    
    today_date = datetime.utcnow().strftime("%Y-%m-%d")
    today_present = await db.attendance.count_documents({"date": today_date, "status": "Present"})
    today_absent = await db.attendance.count_documents({"date": today_date, "status": "Absent"})
    
    return {"data": {
        "totalEmployees": total_employees,
        "totalAttendance": total_attendance,
        "totalPresent": total_present,
        "totalAbsent": total_absent,
        "todayDate": today_date,
        "todayPresent": today_present,
        "todayAbsent": today_absent
    }}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
