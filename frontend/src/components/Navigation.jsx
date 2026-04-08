import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

function Navigation({ user, onLogout }) {
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  const isActive = (path) => location.pathname.startsWith(path) ? 'active' : '';

  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';
  const classesPath = isTeacher ? '/teacher/classes' : '/classes';

  useEffect(() => {
    if (!isStudent || !user?.username) return;
    const fetchCount = () => {
      axios.get(`/api/students/${user.username}/assignments`)
        .then(res => {
          const pending = (res.data || []).filter(a => !a.completed).length;
          setPendingCount(pending);
        })
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user?.username, isStudent, location.pathname]);

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        <img src="/BioTrack_logo.svg" alt="BioTrack" className="nav-logo" /> BioTrack
      </Link>

      <div className="navbar-menu">
        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
          🏠 Home
        </Link>

        {/* Admin nav */}
        {isAdmin && (
          <>
            <Link to="/admin/users" className={`nav-link ${isActive('/admin/users')}`}>
              👥 Users
            </Link>
            <Link to="/admin/animal-requests" className={`nav-link ${isActive('/admin/animal-requests')}`}>
              🐾 Requests
            </Link>
            <Link to="/admin/feedback" className={`nav-link ${isActive('/admin/feedback')}`}>
              📊 Feedback
            </Link>
          </>
        )}

        {/* Teacher nav */}
        {isTeacher && (
          <>
            <Link to={classesPath} className={`nav-link ${isActive(classesPath)}`}>
              🏫 Classes
            </Link>
            <Link to="/teacher/custom-quizzes" className={`nav-link ${isActive('/teacher/custom-quizzes')}`}>
              🧩 Custom Quizzes
            </Link>
            <Link to="/feedback" className={`nav-link ${isActive('/feedback')}`}>
              📝 Feedback
            </Link>
          </>
        )}

        {/* Student nav */}
        {isStudent && (
          <>
            <Link to={classesPath} className={`nav-link ${isActive(classesPath)}`}>
              🏫 Classes
            </Link>
            <Link to="/explore" className={`nav-link ${isActive('/explore')}`}>
              🔍 Explore
            </Link>
            <Link to="/flashcards" className={`nav-link ${isActive('/flashcards')}`}>
              📚 Study
            </Link>
            <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
              👤 Profile
            </Link>
            {/* Inbox — icon only */}
            <Link to="/inbox" className={`nav-link nav-icon-link nav-link-badge-wrap ${isActive('/inbox')}`} title="Inbox">
              📬
              {pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
            </Link>
            {/* Feedback */}
            <Link to="/feedback" className={`nav-link nav-icon-link ${isActive('/feedback')}`} title="Feedback">
              📝
            </Link>
          </>
        )}

        {/* Settings — icon only */}
        <Link to="/settings" className={`nav-link nav-icon-link ${isActive('/settings')}`} title="Settings">
            ⚙️
          </Link>

        <button onClick={onLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navigation;