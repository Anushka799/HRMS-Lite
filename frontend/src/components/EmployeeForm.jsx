import React, { useState } from 'react';

const initialState = {
  employeeId: '',
  fullName: '',
  email: '',
  department: ''
};

const EmployeeForm = ({ onCreate }) => {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const trimmed = {
      employeeId: form.employeeId.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      department: form.department.trim()
    };

    const missing = Object.entries(trimmed)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      setError(`Missing required fields: ${missing.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      await onCreate(trimmed);
      setForm(initialState);
      setSuccess('Employee added successfully.');
    } catch (err) {
      setError(err.message || 'Unable to add employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel-block">
      <div className="panel-title">Add new employee</div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          <span>Employee ID</span>
          <input
            type="text"
            name="employeeId"
            placeholder="EMP-001"
            value={form.employeeId}
            onChange={handleChange}
          />
        </label>
        <label>
          <span>Full name</span>
          <input
            type="text"
            name="fullName"
            placeholder="Avery Patel"
            value={form.fullName}
            onChange={handleChange}
          />
        </label>
        <label>
          <span>Email address</span>
          <input
            type="email"
            name="email"
            placeholder="avery@company.com"
            value={form.email}
            onChange={handleChange}
          />
        </label>
        <label>
          <span>Department</span>
          <input
            type="text"
            name="department"
            placeholder="Operations"
            value={form.department}
            onChange={handleChange}
          />
        </label>
        <button className="button primary" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Add employee'}
        </button>
      </form>
      {error ? <div className="state state-error">{error}</div> : null}
      {success ? <div className="state state-success">{success}</div> : null}
    </div>
  );
};

export default EmployeeForm;
