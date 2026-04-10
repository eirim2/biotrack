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
  const [copied, setCopied] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`/api/admin/users?admin_username=${user.username}&role=${filterRole}`);
      setUsers(res.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchUsers(); }, [filterRole]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setCreateResult(null); setLoading(true); setCopied(false);
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

  const handleCopyCredentials = () => {
    if (!createResult) return;
    const text = `Username: ${createResult.username}\nTemporary password: ${createResult.temp_password}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
                <button type="button" className="btn-back" onClick={() => { setShowCreate(false); setCreateResult(null); setError(''); setCopied(false); }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
          {createResult && (
            <div className="created-code-box" style={{ marginTop: 16 }}>
              <p className="created-code-label">Account Created</p>
              <p><strong>Username:</strong> {createResult.username}</p>
              <p>
                <strong>Temporary Password:</strong>{' '}
                <code style={{ fontSize: '1.2rem', letterSpacing: 2 }}>{createResult.temp_password}</code>
                <button onClick={handleCopyCredentials}
                  style={{ marginLeft: 10, background: 'none', border: '1px solid #ccc', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 13 }}
                  title="Copy credentials to clipboard">
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
              </p>
              <p style={{ fontSize: '0.85rem', color: '#888', marginTop: 8 }}>Share these credentials with the user. They will be prompted to set a new password on first login.</p>
            </div>
          )}
        </div>

        {/* Filter and search */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div className="filter-tabs" style={{ marginBottom: 0 }}>
            {['', 'student', 'teacher', 'admin'].map(role => (
              <button key={role} className={`filter-tab ${filterRole === role ? 'active' : ''}`}
                onClick={() => setFilterRole(role)}>
                {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'All'}
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
                <p className="tc-student-name">
                  {u.username}{u.username === user.username && <span style={{ color: '#888', fontWeight: 400 }}> (you)</span>}
                </p>
                <p className="tc-student-stats">
                  {u.role === 'student' && <>Student · {u.points} pts · {u.discoveries} discoveries · {u.badges} badges</>}
                  {u.role === 'teacher' && <>Teacher · {u.classes || 0} class{u.classes === 1 ? '' : 'es'} · {u.custom_quizzes || 0} quiz{u.custom_quizzes === 1 ? '' : 'zes'} · {u.total_students || 0} student{u.total_students === 1 ? '' : 's'}</>}
                  {u.role === 'admin' && <>Administrator</>}
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
