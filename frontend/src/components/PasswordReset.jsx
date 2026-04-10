import React, { useState } from 'react';
import axios from 'axios';

function PasswordReset({ user, onPasswordReset }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 4) { setError('New password must be at least 4 characters'); return; }

    setLoading(true);
    try {
      const res = await axios.post('/api/password/force-reset', {
        username: user.username,
        new_password: newPassword,
      });
      onPasswordReset(res.data.user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="safari-logo">
          <h1><img src="/BioTrack_logo.svg" alt="BioTrack" className="auth-logo" /> BioTrack</h1>
          <p className="tagline">Password Reset Required</p>
        </div>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: 20 }}>
          Your account was created by an administrator. Please set a new password to continue.
        </p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              required placeholder="Choose a new password" />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              required placeholder="Confirm new password" />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Resetting...' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PasswordReset;
