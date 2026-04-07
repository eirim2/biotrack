import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';
import axios from 'axios';

function AdminDashboard({ user, onLogout }) {
  const [stats, setStats] = useState({ students: 0, teachers: 0, admins: 0, animals: 0, pendingRequests: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, animalsRes, requestsRes] = await Promise.all([
          axios.get(`/api/admin/users?admin_username=${user.username}`),
          axios.get('/api/animals'),
          axios.get(`/api/admin/animal-requests?admin_username=${user.username}`),
        ]);
        const users = usersRes.data || [];
        setStats({
          students: users.filter(u => u.role === 'student').length,
          teachers: users.filter(u => u.role === 'teacher').length,
          admins: users.filter(u => u.role === 'admin').length,
          animals: Object.keys(animalsRes.data || {}).length,
          pendingRequests: (requestsRes.data || []).filter(r => r.status === 'pending').length,
        });
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, [user.username]);

  return (
    <div>
      <Navigation user={user} onLogout={onLogout} />
      <div className="dashboard">
        <div className="welcome-section">
          <h1>Welcome, {user.username}! 🛡️</h1>
          <p>Administrator Dashboard — manage users, animals, and feedback</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon">🎒</div><div className="stat-value">{stats.students}</div><div className="stat-label">Students</div></div>
          <div className="stat-card"><div className="stat-icon">🏫</div><div className="stat-value">{stats.teachers}</div><div className="stat-label">Teachers</div></div>
          <div className="stat-card"><div className="stat-icon">🛡️</div><div className="stat-value">{stats.admins}</div><div className="stat-label">Admins</div></div>
          <div className="stat-card"><div className="stat-icon">🐾</div><div className="stat-value">{stats.animals}</div><div className="stat-label">Animals</div></div>
        </div>

        {stats.pendingRequests > 0 && (
          <div className="alert-section alert-section-green">
            <div>
              <h3>🐾 Pending Animal Requests</h3>
              <p>{stats.pendingRequests} request{stats.pendingRequests !== 1 ? 's' : ''} awaiting review.</p>
            </div>
            <Link to="/admin/animal-requests"><button className="btn-alert btn-alert-green">Review →</button></Link>
          </div>
        )}

        <div className="action-cards">
          <Link to="/admin/users" className="text-decoration-none">
            <div className="action-card">
              <div className="action-card-header action-card-header-green">👥 User Management</div>
              <div className="action-card-body">
                <p>View, filter, create, and remove user accounts.</p>
                <button className="btn-action">Manage Users</button>
              </div>
            </div>
          </Link>
          <Link to="/admin/animal-requests" className="text-decoration-none">
            <div className="action-card">
              <div className="action-card-header action-card-header-orange">🐾 Animal Requests</div>
              <div className="action-card-body">
                <p>Review teacher requests and add new animals to the platform.</p>
                <button className="btn-action">View Requests</button>
              </div>
            </div>
          </Link>
          <Link to="/admin/feedback" className="text-decoration-none">
            <div className="action-card">
              <div className="action-card-header action-card-header-brown">📊 Feedback Summary</div>
              <div className="action-card-body">
                <p>View aggregated anonymous feedback from students and teachers.</p>
                <button className="btn-action">View Feedback</button>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
