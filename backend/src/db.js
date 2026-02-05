const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mohduzair171222_db_user:NPYKhy8PoXAj6ql3@keybo.mdqvp2v.mongodb.net/hrms_lite?appName=Keybo';

// Employee Schema
const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  createdAt: { type: String, required: true }
});

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, required: true },
  createdAt: { type: String, required: true }
});

// Compound unique index for employeeId + date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Employee = mongoose.model('Employee', employeeSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

module.exports = { connectDB, Employee, Attendance };
