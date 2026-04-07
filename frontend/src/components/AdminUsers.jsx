import React, { useEffect, useState } from 'react';
import Navigation from './Navigation';
import axios from 'axios';

function AdminUsers({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('teacher');
  const [createResult, setCreateResult] = useState(null);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`/api/admin/users?admin_username=${user.username}&role=${filterRole}`);
      setUsers(res.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchUsers(); }, [filterRole]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setCreateResult(null); setLoading(true);
    try {
      const res = await axios.post(`/api/admin/create-account?admin_username=${user.username}`, {
        username: newUsername.trim(), role: newRole,
      });
      setCreateResult(res.data);
      setNewUsername('');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create account');
    } finally { setLoading(false); }
  };

  const handleDelete = async (username) => {
    try {
      await axios.delete(`/api/admin/users/${username}?admin_username=${user.username}`);
      setConfirmDelete(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Navigation user={user} onLogout={onLogout} />
      <div className="explorer-container">
        <div className="explorer-header">
          <h1>👥 User Management</h1>
          <p>View, create, and manage accounts</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Create account section */}
        <div className="profile-section" style={{ marginBottom: 24 }}>
          <h2>➕ Create Account</h2>
          {!showCreate ? (
            <button className="btn-action" style={{ maxWidth: 240 }} onClick={() => setShowCreate(true)}>
              Create Teacher or Admin Account
            </button>
          ) : (
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)}
                  placeholder="Enter username" required autoComplete="off" />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value)}>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-primary" style={{ maxWidth: 200 }} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
                <button type="button" className="btn-back" onClick={() => { setShowCreate(false); setCreateResult(null); setError(''); }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
          {createResult && (
            <div className="created-code-box" style={{ marginTop: 16 }}>
              <p className="created-code-label">Account Created</p>
              <p><strong>Username:</strong> {createResult.username}</p>
              <p><strong>Temporary Password:</strong> <code style={{ fontSize: '1.2rem', letterSpacing: 2 }}>{createResult.temp_password}</code></p>
              <p style={{ fontSize: '0.85rem', color: '#888', marginTop: 8 }}>Share this password with the user. They will be prompted to reset it on first login.</p>
            </div>
          )}
        </div>

        {/* Filter and search */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div className="filter-tabs" style={{ marginBottom: 0 }}>
            {['', 'student', 'teacher', 'admin'].map(role => (
              <button key={role} className={`filter-tab ${filterRole === role ? 'active' : ''}`}
                onClick={() => setFilterRole(role)}>
                {role || 'All'}
              </button>
            ))}
          </div>
          <input type="text" className="tc-student-search" placeholder="🔍 Search users..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ maxWidth: 300 }} />
        </div>

        {/* User list */}
        <div className="tc-student-list">
          {filtered.map(u => (
            <div key={u.username} className={`tc-student-row ${confirmDelete === u.username ? 'confirming' : ''}`}>
              <div style={{ minWidth: 36, textAlign: 'center', fontSize: '1.2rem' }}>
                {u.role === 'admin' ? '🛡️' : u.role === 'teacher' ? '🏫' : '🎒'}
              </div>
              <div className="tc-student-info">
                <p className="tc-student-name">{u.username}</p>
                <p className="tc-student-stats">
                  {u.role} · {u.points} pts · {u.discoveries} discoveries · {u.badges} badges
                </p>
              </div>
              {confirmDelete === u.username ? (
                <div className="tc-confirm-btns">
                  <button className="tc-remove-confirm-btn" onClick={() => handleDelete(u.username)}>Remove</button>
                  <button className="tc-cancel-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
                </div>
              ) : (
                u.username !== user.username && (
                  <button className="tc-remove-btn" onClick={() => setConfirmDelete(u.username)} title="Remove user">✕</button>
                )
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state"><div className="empty-state-icon">👤</div><h3>No users found</h3></div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;
