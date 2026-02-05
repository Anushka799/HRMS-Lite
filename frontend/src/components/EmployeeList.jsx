import React, { useState } from 'react';

const EmployeeList = ({ employees, selectedId, onSelect, onDelete, loading, error }) => {
  const [deletingId, setDeletingId] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async (employeeId) => {
    const confirmed = window.confirm(
      `Delete employee ${employeeId}? This will remove all attendance records.`
    );
    if (!confirmed) return;

    setDeletingId(employeeId);
    setDeleteError('');
    try {
      await onDelete(employeeId);
    } catch (err) {
      setDeleteError(err.message || 'Unable to delete employee.');
    } finally {
      setDeletingId('');
    }
  };

  if (loading) {
    return <div className="state">Loading employees...</div>;
  }

  if (error) {
    return <div className="state state-error">{error}</div>;
  }

  if (!employees.length) {
    return (
      <div className="state state-empty">
        No employees yet. Add your first employee to begin tracking attendance.
      </div>
    );
  }

  return (
    <div className="panel-block">
      <div className="panel-title">Employees</div>
      <div className="employee-list">
        {employees.map((employee) => {
          const isSelected = selectedId === employee.employeeId;
          return (
            <div
              key={employee.employeeId}
              className={`employee-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(employee.employeeId)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(employee.employeeId);
                }
              }}
            >
              <div className="employee-header">
                <div>
                  <div className="employee-name">{employee.fullName}</div>
                  <div className="employee-meta">
                    {employee.department} · {employee.employeeId}
                  </div>
                </div>
                <div className="employee-actions">
                  <button
                    className="button ghost"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(employee.employeeId);
                    }}
                  >
                    View
                  </button>
                  <button
                    className="button danger"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(employee.employeeId);
                    }}
                    disabled={deletingId === employee.employeeId}
                  >
                    {deletingId === employee.employeeId ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
              <div className="employee-email">{employee.email}</div>
              <div className="employee-stats">
                <span>
                  Present: <strong>{employee.presentCount}</strong>
                </span>
                <span>
                  Attendance entries: <strong>{employee.attendanceCount}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {deleteError ? <div className="state state-error">{deleteError}</div> : null}
    </div>
  );
};

export default EmployeeList;
