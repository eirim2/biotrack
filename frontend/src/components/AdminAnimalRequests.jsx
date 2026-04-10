import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import axios from 'axios';

function AdminAnimalRequests({ user, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [confirmApprove, setConfirmApprove] = useState(null);
  const [confirmDeny, setConfirmDeny] = useState(null);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`/api/admin/animal-requests?admin_username=${user.username}`);
      setRequests(res.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id) => {
    try {
      await axios.post(`/api/admin/animal-requests/${id}/approve?admin_username=${user.username}`);
      setConfirmApprove(null);
      fetchRequests();
      navigate(`/admin/create-animal?request_id=${id}`);
    } catch (err) { setError(err.response?.data?.detail || 'Failed to approve'); }
  };

  const handleDeny = async (id) => {
    try {
      await axios.post(`/api/admin/animal-requests/${id}/deny?admin_username=${user.username}`);
      setConfirmDeny(null);
      fetchRequests();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to deny'); }
  };

  const pending = requests.filter(r => r.status === 'pending');
  const resolved = requests.filter(r => r.status !== 'pending');

  return (
    <div>
      <Navigation user={user} onLogout={onLogout} />
      <div className="explorer-container">
        <div className="explorer-header">
          <h1>🐾 Animal Requests</h1>
          <p>Review teacher requests for new animals</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button className="btn-action" style={{ maxWidth: 260, marginBottom: 24 }}
          onClick={() => navigate('/admin/create-animal')}>
          ➕ Create Animal Directly
        </button>

        <div className="profile-section" style={{ marginBottom: 24 }}>
          <h2>📋 Pending Requests ({pending.length})</h2>
          {pending.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">✅</div><p>No pending requests</p></div>
          ) : (
            <div className="tc-student-list">
              {pending.map(r => (
                <div key={r.id} className="tc-student-row">
                  <div className="tc-student-info">
                    <p className="tc-student-name">{r.common_name} ({r.scientific_name})</p>
                    <p className="tc-student-stats">
                      {r.category} · Requested by {r.teacher_username}
                      {r.reason && <> · {r.reason}</>}
                    </p>
                  </div>
                  {confirmApprove === r.id ? (
                    <div className="tc-confirm-btns">
                      <button className="btn-action" style={{ padding: '6px 16px', fontSize: 13 }}
                        onClick={() => handleApprove(r.id)}>Confirm Approve</button>
                      <button className="tc-cancel-btn" onClick={() => setConfirmApprove(null)}>Cancel</button>
                    </div>
                  ) : confirmDeny === r.id ? (
                    <div className="tc-confirm-btns">
                      <button className="tc-remove-confirm-btn" onClick={() => handleDeny(r.id)}>Confirm Deny</button>
                      <button className="tc-cancel-btn" onClick={() => setConfirmDeny(null)}>Cancel</button>
                    </div>
                  ) : (
                    <div className="tc-confirm-btns">
                      <button className="btn-action" style={{ padding: '6px 16px', fontSize: 13 }}
                        onClick={() => { setConfirmApprove(r.id); setConfirmDeny(null); }}>✓ Approve</button>
                      <button className="tc-remove-confirm-btn"
                        onClick={() => { setConfirmDeny(r.id); setConfirmApprove(null); }}>✕ Deny</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {resolved.length > 0 && (
          <div className="profile-section">
            <h2>📜 Past Requests ({resolved.length})</h2>
            <div className="tc-student-list">
              {resolved.map(r => (
                <div key={r.id} className="tc-student-row" style={{ opacity: 0.6 }}>
                  <div className="tc-student-info">
                    <p className="tc-student-name">{r.common_name}</p>
                    <p className="tc-student-stats">{r.category} · {r.teacher_username} · {r.status}</p>
                  </div>
                  <span style={{ fontWeight: 700, color: r.status === 'approved' ? '#27ae60' : '#e74c3c' }}>
                    {r.status === 'approved' ? '✓ Approved' : '✕ Denied'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAnimalRequests;
