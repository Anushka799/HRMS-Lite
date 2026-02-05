import React from 'react';

const SummaryCard = ({ label, value, helper }) => (
  <div className="summary-card">
    <div className="summary-label">{label}</div>
    <div className="summary-value">{value}</div>
    {helper ? <div className="summary-helper">{helper}</div> : null}
  </div>
);

const SummaryCards = ({ summary, loading, error }) => {
  if (loading) {
    return (
      <div className="summary-grid">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div className="summary-card skeleton" key={`skeleton-${idx}`}>
            <div className="summary-label">&nbsp;</div>
            <div className="summary-value">&nbsp;</div>
            <div className="summary-helper">&nbsp;</div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="state state-error">{error}</div>;
  }

  if (!summary) {
    return <div className="state state-empty">No summary data yet.</div>;
  }

  return (
    <div className="summary-grid">
      <SummaryCard label="Total employees" value={summary.totalEmployees} />
      <SummaryCard label="Attendance entries" value={summary.totalAttendance} />
      <SummaryCard label="Present records" value={summary.totalPresent} />
      <SummaryCard label="Absent records" value={summary.totalAbsent} />
      <SummaryCard
        label="Present today"
        value={summary.todayPresent}
        helper={`as of ${summary.todayDate}`}
      />
      <SummaryCard
        label="Absent today"
        value={summary.todayAbsent}
        helper={`as of ${summary.todayDate}`}
      />
    </div>
  );
};

export default SummaryCards;
