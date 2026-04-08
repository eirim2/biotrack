import React, { useEffect, useState } from 'react';
import Navigation from './Navigation';
import axios from 'axios';

const STUDENT_QUESTIONS = {
  quiz_helpful: "How helpful are the quizzes for learning?",
  flashcards_helpful: "How helpful are the flashcards?",
  animal_info_interesting: "How interesting is the animal information?",
  app_easy_to_use: "How easy is the app to use?",
  overall_satisfaction: "Overall satisfaction with BioTrack",
};

const TEACHER_QUESTIONS = {
  class_management_useful: "How useful are the classroom management tools?",
  quiz_creation_easy: "How easy is it to create quizzes?",
  assignment_workflow: "How effective is the assignment workflow?",
  bioquiz_engagement: "How engaging is BioQuiz for students?",
  overall_satisfaction: "Overall satisfaction with BioTrack",
};

function AdminFeedback({ user, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/admin/feedback?admin_username=${user.username}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  const renderSection = (title, role, questionMap) => {
    const roleData = data?.[role] || {};
    const count = data?.[`${role}_count`] || 0;
    const comments = data?.[`${role}_comments`] || [];
    return (
      <div className="profile-section" style={{ marginBottom: 24 }}>
        <h2>{title} ({count} response{count !== 1 ? 's' : ''})</h2>
        {count === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📭</div><p>No feedback submitted yet.</p></div>
        ) : (
          <>
            <div className="tc-student-list">
              {Object.entries(questionMap).map(([key, label]) => {
                const entry = roleData[key] || { average: 0, count: 0 };
                const pct = (entry.average / 5) * 100;
                return (
                  <div key={key} className="tc-student-row">
                    <div className="tc-student-info" style={{ flex: 1 }}>
                      <p className="tc-student-name" style={{ fontSize: 14 }}>{label}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                        <div style={{ flex: 1, height: 8, background: '#e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: pct >= 80 ? '#27ae60' : pct >= 60 ? '#f39c12' : '#e74c3c', borderRadius: 4 }} />
                        </div>
                        <span style={{ fontWeight: 700, minWidth: 50, textAlign: 'right' }}>
                          {entry.average}/5
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: '#888' }}>{entry.count} responses</span>
                  </div>
                );
              })}
            </div>
            {comments.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: 15, marginBottom: 10, color: 'var(--top-gradient)' }}>💬 Comments ({comments.length})</h3>
                {comments.map((c, i) => (
                  <div key={i} style={{ background: '#f5f5f5', borderRadius: 8, padding: '10px 14px', marginBottom: 8, fontSize: 14, color: '#444' }}>
                    "{c}"
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  if (loading) return (
    <div><Navigation user={user} onLogout={onLogout} />
      <div className="dashboard"><p>Loading feedback...</p></div></div>
  );

  return (
    <div>
      <Navigation user={user} onLogout={onLogout} />
      <div className="profile-container">
        <div className="profile-header">
          <h1>📊 Feedback Summary</h1>
          <p>Anonymous aggregated feedback from all users</p>
        </div>
        {renderSection('🎒 Student Feedback', 'student', STUDENT_QUESTIONS)}
        {renderSection('🏫 Teacher Feedback', 'teacher', TEACHER_QUESTIONS)}
      </div>
    </div>
  );
}

export default AdminFeedback;