import React, { useState } from 'react';
import Navigation from './Navigation';
import axios from 'axios';

const STUDENT_QUESTIONS = [
  { key: 'quiz_helpful', label: 'How helpful are the quizzes for learning?' },
  { key: 'flashcards_helpful', label: 'How helpful are the flashcards?' },
  { key: 'animal_info_interesting', label: 'How interesting is the animal information?' },
  { key: 'app_easy_to_use', label: 'How easy is the app to use?' },
  { key: 'overall_satisfaction', label: 'Overall satisfaction with BioTrack' },
];

const TEACHER_QUESTIONS = [
  { key: 'class_management_useful', label: 'How useful are the classroom management tools?' },
  { key: 'quiz_creation_easy', label: 'How easy is it to create quizzes?' },
  { key: 'assignment_workflow', label: 'How effective is the assignment workflow?' },
  { key: 'bioquiz_engagement', label: 'How engaging is BioQuiz for students?' },
  { key: 'overall_satisfaction', label: 'Overall satisfaction with BioTrack' },
];

function FeedbackForm({ user, onLogout }) {
  const isTeacher = user?.role === 'teacher';
  const questions = isTeacher ? TEACHER_QUESTIONS : STUDENT_QUESTIONS;
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setRating = (key, val) => setResponses(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const ratingKeys = Object.keys(responses).filter(k => k !== 'free_response');
    if (ratingKeys.length < questions.length) {
      setError('Please answer all rating questions before submitting.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/feedback', { role: user.role, responses });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit feedback');
    } finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div>
        <Navigation user={user} onLogout={onLogout} />
        <div className="profile-container">
          <div className="quiz-results" style={{ marginTop: 60 }}>
            <div className="results-icon">🙏</div>
            <h2>Thank you for your feedback!</h2>
            <p className="results-message">Your anonymous response has been recorded and will help us improve BioTrack.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation user={user} onLogout={onLogout} />
      <div className="profile-container">
        <div className="profile-header">
          <h1>📝 Feedback</h1>
          <p>Help us improve BioTrack! Your responses are anonymous.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="profile-section">
          <h2>{isTeacher ? '🏫' : '🎒'} {isTeacher ? 'Teacher' : 'Student'} Feedback</h2>
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: 13, color: '#999', marginBottom: 20, fontStyle: 'italic' }}>
              Rate each question from 1 (Poor) to 5 (Excellent)
            </p>
            {questions.map(q => (
              <div key={q.key} style={{ marginBottom: 24 }}>
                <p style={{ fontWeight: 600, marginBottom: 10, color: 'var(--top-gradient)' }}>{q.label}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button"
                      className={`filter-tab ${responses[q.key] === n ? 'active' : ''}`}
                      style={{ minWidth: 48, padding: '10px 0' }}
                      onClick={() => setRating(q.key, n)}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ marginBottom: 24 }}>
              <p style={{ fontWeight: 600, marginBottom: 10, color: 'var(--top-gradient)' }}>Additional comments or suggestions (optional)</p>
              <textarea className="form-textarea" rows={4}
                value={responses.free_response || ''}
                onChange={e => setResponses(p => ({ ...p, free_response: e.target.value }))}
                placeholder="Share any other thoughts about BioTrack..." />
            </div>

            <button type="submit" className="btn-primary" style={{ maxWidth: 280 }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Anonymous Feedback'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FeedbackForm;