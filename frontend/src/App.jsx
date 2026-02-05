import React, { useEffect, useMemo, useState } from 'react';
import { createEmployee, deleteEmployee, getEmployees, getSummary } from './api';
import SummaryCards from './components/SummaryCards';
import EmployeeForm from './components/EmployeeForm';
import EmployeeList from './components/EmployeeList';
import AttendancePanel from './components/AttendancePanel';

const App = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [employeeLoading, setEmployeeLoading] = useState(true);
  const [employeeError, setEmployeeError] = useState('');

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState('');

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.employeeId === selectedId) || null,
    [employees, selectedId]
  );

  const loadEmployees = async () => {
    setEmployeeLoading(true);
    setEmployeeError('');
    try {
      const response = await getEmployees();
      const data = response.data || [];
      setEmployees(data);
      setSelectedId((prev) => {
        if (!data.length) return '';
        if (prev && data.some((employee) => employee.employeeId === prev)) return prev;
        return data[0].employeeId;
      });
    } catch (err) {
      setEmployeeError(err.message || 'Unable to load employees.');
    } finally {
      setEmployeeLoading(false);
    }
  };

  const loadSummary = async () => {
    setSummaryLoading(true);
    setSummaryError('');
    try {
      const response = await getSummary();
      setSummary(response.data || null);
    } catch (err) {
      setSummaryError(err.message || 'Unable to load summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([loadEmployees(), loadSummary()]);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleCreateEmployee = async (payload) => {
    await createEmployee(payload);
    await refreshAll();
  };

  const handleDeleteEmployee = async (employeeId) => {
    await deleteEmployee(employeeId);
    await refreshAll();
  };

  const handleAttendanceAdded = async () => {
    await refreshAll();
  };

  return (
    <div className="app">
      <header className="top-bar">
        <div>
          <div className="eyebrow">HRMS Lite</div>
          <h1>People Operations Console</h1>
          <p>
            Manage employee profiles and track daily attendance with a clean, fast HR workspace.
          </p>
        </div>
        <div className="top-actions">
          <button className="button ghost" type="button" onClick={refreshAll}>
            Refresh data
          </button>
        </div>
      </header>

      <section className="summary-section">
        <SummaryCards summary={summary} loading={summaryLoading} error={summaryError} />
      </section>

      <div className="main-grid">
        <section className="panel">
          <EmployeeForm onCreate={handleCreateEmployee} />
          <EmployeeList
            employees={employees}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDelete={handleDeleteEmployee}
            loading={employeeLoading}
            error={employeeError}
          />
        </section>

        <section className="panel">
          <AttendancePanel employee={selectedEmployee} onAttendanceAdded={handleAttendanceAdded} />
        </section>
      </div>

      <footer className="footer">
        <span>HRMS Lite · Internal operations tooling</span>
      </footer>
    </div>
  );
};

export default App;
