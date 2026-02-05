import React, { useEffect, useMemo, useState } from 'react';
import { createAttendance, getAttendance } from '../api';

const AttendancePanel = ({ employee, onAttendanceAdded }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [markDate, setMarkDate] = useState('');
  const [status, setStatus] = useState('Present');
  const [saving, setSaving] = useState(false);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    setMarkDate(today);
  }, [today]);

  const loadAttendance = async (dateOverride) => {
    if (!employee) return;
    setLoading(true);
    setError('');
    try {
      const response = await getAttendance(employee.employeeId, dateOverride ?? filterDate);
      setRecords(response.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load attendance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!employee) return;
    loadAttendance();
  }, [employee?.employeeId, filterDate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!employee) return;

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await createAttendance(employee.employeeId, {
        date: markDate,
        status
      });
      setSuccess('Attendance saved.');
      await loadAttendance();
      if (onAttendanceAdded) {
        await onAttendanceAdded();
      }
    } catch (err) {
      setError(err.message || 'Unable to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  if (!employee) {
    return (
      <div className="panel-block">
        <div className="panel-title">Attendance</div>
        <div className="state state-empty">
          Select an employee to view and mark attendance.
        </div>
      </div>
    );
  }

  return (
    <div className="panel-block">
      <div className="panel-title">Attendance · {employee.fullName}</div>

      <form className="attendance-form" onSubmit={handleSubmit}>
        <label>
          <span>Date</span>
          <input
            type="date"
            value={markDate}
            onChange={(event) => setMarkDate(event.target.value)}
            max={today}
          />
        </label>
        <label>
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </label>
        <button className="button primary" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Mark attendance'}
        </button>
      </form>

      <div className="attendance-filter">
        <label>
          <span>Filter by date</span>
          <input
            type="date"
            value={filterDate}
            onChange={(event) => setFilterDate(event.target.value)}
          />
        </label>
        <button
          className="button ghost"
          type="button"
          onClick={() => setFilterDate('')}
        >
          Clear filter
        </button>
      </div>

      {loading ? <div className="state">Loading attendance...</div> : null}
      {error ? <div className="state state-error">{error}</div> : null}
      {success ? <div className="state state-success">{success}</div> : null}

      {!loading && !records.length ? (
        <div className="state state-empty">No attendance recorded yet.</div>
      ) : null}

      {records.length ? (
        <div className="attendance-list">
          {records.map((record) => (
            <div className="attendance-item" key={record.id}>
              <div>
                <div className="attendance-date">{record.date}</div>
                <div className="attendance-meta">
                  Marked on {new Date(record.createdAt).toLocaleString()}
                </div>
              </div>
              <span className={`status-pill ${record.status.toLowerCase()}`}>
                {record.status}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default AttendancePanel;
