const express = require('express');
const cors = require('cors');
const { connectDB, Employee, Attendance } = require('./db');
const {
  trimString,
  normalizeStatus,
  isValidEmail,
  isValidDate
} = require('./validators');

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type']
  })
);
app.use(express.json({ limit: '1mb' }));

const nowIso = () => new Date().toISOString();

const sendValidationError = (res, message, details) =>
  res.status(400).json({ error: message, details });

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: nowIso() });
});

app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 }).lean();
    
    // Get attendance counts for each employee
    const employeesWithAttendance = await Promise.all(
      employees.map(async (emp) => {
        const attendance = await Attendance.find({ employeeId: emp.employeeId });
        const presentCount = attendance.filter(a => a.status === 'Present').length;
        return {
          employeeId: emp.employeeId,
          fullName: emp.fullName,
          email: emp.email,
          department: emp.department,
          createdAt: emp.createdAt,
          presentCount,
          attendanceCount: attendance.length
        };
      })
    );
    
    res.json({ data: employeesWithAttendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const employeeId = trimString(req.body.employeeId);
    const fullName = trimString(req.body.fullName);
    const email = trimString(req.body.email).toLowerCase();
    const department = trimString(req.body.department);

    const missing = [];
    if (!employeeId) missing.push('employeeId');
    if (!fullName) missing.push('fullName');
    if (!email) missing.push('email');
    if (!department) missing.push('department');

    if (missing.length > 0) {
      return sendValidationError(res, 'Missing required fields', { fields: missing });
    }

    if (!isValidEmail(email)) {
      return sendValidationError(res, 'Invalid email format', { field: 'email' });
    }

    const duplicate = await Employee.findOne({
      $or: [{ employeeId }, { email }]
    });
    
    if (duplicate) {
      const conflictField = duplicate.employeeId === employeeId ? 'employeeId' : 'email';
      return res.status(409).json({
        error: `Duplicate ${conflictField}`,
        details: { field: conflictField }
      });
    }

    const newEmployee = new Employee({
      employeeId,
      fullName,
      email,
      department,
      createdAt: nowIso()
    });
    
    await newEmployee.save();
    
    res.status(201).json({
      data: {
        employeeId: newEmployee.employeeId,
        fullName: newEmployee.fullName,
        email: newEmployee.email,
        department: newEmployee.department,
        createdAt: newEmployee.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/employees/:employeeId', async (req, res) => {
  try {
    const employeeId = trimString(req.params.employeeId);
    if (!employeeId) {
      return sendValidationError(res, 'Employee ID is required');
    }

    const existing = await Employee.findOne({ employeeId });
    if (!existing) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await Employee.deleteOne({ employeeId });
    await Attendance.deleteMany({ employeeId }); // Cascade delete attendance records
    
    res.json({
      data: {
        employeeId: existing.employeeId,
        fullName: existing.fullName,
        email: existing.email,
        department: existing.department,
        createdAt: existing.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/employees/:employeeId/attendance', async (req, res) => {
  try {
    const employeeId = trimString(req.params.employeeId);
    if (!employeeId) {
      return sendValidationError(res, 'Employee ID is required');
    }

    const existing = await Employee.findOne({ employeeId });
    if (!existing) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const dateFilter = trimString(req.query.date);
    if (dateFilter && !isValidDate(dateFilter)) {
      return sendValidationError(res, 'Invalid date format (use YYYY-MM-DD)', {
        field: 'date'
      });
    }

    const query = { employeeId };
    if (dateFilter) {
      query.date = dateFilter;
    }

    const records = await Attendance.find(query).sort({ date: -1 }).lean();
    
    res.json({
      data: records.map(r => ({
        id: r._id,
        employeeId: r.employeeId,
        date: r.date,
        status: r.status,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/employees/:employeeId/attendance', async (req, res) => {
  try {
    const employeeId = trimString(req.params.employeeId);
    if (!employeeId) {
      return sendValidationError(res, 'Employee ID is required');
    }

    const existing = await Employee.findOne({ employeeId });
    if (!existing) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const date = trimString(req.body.date);
    const status = normalizeStatus(req.body.status);

    const missing = [];
    if (!date) missing.push('date');
    if (!status) missing.push('status');

    if (missing.length > 0) {
      return sendValidationError(res, 'Missing required fields', { fields: missing });
    }

    if (!isValidDate(date)) {
      return sendValidationError(res, 'Invalid date format (use YYYY-MM-DD)', {
        field: 'date'
      });
    }

    if (!status) {
      return sendValidationError(res, 'Status must be Present or Absent', {
        field: 'status'
      });
    }

    const duplicate = await Attendance.findOne({ employeeId, date });
    if (duplicate) {
      return res.status(409).json({
        error: 'Attendance already marked for this date',
        details: { field: 'date' }
      });
    }

    const newAttendance = new Attendance({
      employeeId,
      date,
      status,
      createdAt: nowIso()
    });
    
    await newAttendance.save();
    res.status(201).json({ data: { employeeId, date, status } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/summary', async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalAttendance = await Attendance.countDocuments();
    const totalPresent = await Attendance.countDocuments({ status: 'Present' });
    const totalAbsent = await Attendance.countDocuments({ status: 'Absent' });
    
    const todayDate = new Date().toISOString().slice(0, 10);
    const todayPresent = await Attendance.countDocuments({ date: todayDate, status: 'Present' });
    const todayAbsent = await Attendance.countDocuments({ date: todayDate, status: 'Absent' });

    res.json({
      data: {
        totalEmployees,
        totalAttendance,
        totalPresent,
        totalAbsent,
        todayDate,
        todayPresent,
        todayAbsent
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Connect to MongoDB then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`HRMS Lite API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    // Start server anyway to show error message
    app.listen(PORT, () => {
      console.log(`HRMS Lite API running on port ${PORT} (DB connection failed)`);
    });
  });
