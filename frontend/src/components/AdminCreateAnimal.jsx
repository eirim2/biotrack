import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from './Navigation';
import axios from 'axios';

const EMPTY_QUESTION = () => ({
  question: '',
  options: ['', '', '', ''],
  answer: 0,
});

function AdminCreateAnimal({ user, onLogout }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('request_id');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [animals, setAnimals] = useState({});
  const [requestData, setRequestData] = useState(null);

  const [form, setForm] = useState({
    commonName: '', scientificName: '', category: 'Mammal',
    conservationStatus: 'Least Concern', habitat: '', region: '',
    diet: '', lifespan: '', weight: '', height: '', population: '',
    description: '', funFacts: ['', '', '', ''], imageName: '',
  });

  const [questions, setQuestions] = useState(
    Array.from({ length: 8 }, () => EMPTY_QUESTION())
  );

  useEffect(() => {
    axios.get('/api/animals').then(r => setAnimals(r.data || {}));
  }, []);

  useEffect(() => {
    if (!requestId) return;
    axios.get(`/api/admin/animal-requests?admin_username=${user.username}`)
      .then(res => {
        const req = (res.data || []).find(r => r.id === parseInt(requestId));
        if (req) {
          setRequestData(req);
          setForm(prev => ({
            ...prev,
            commonName: req.common_name || '',
            scientificName: req.scientific_name || '',
            category: req.category || 'Mammal',
          }));
        }
      })
      .catch(() => {});
  }, [requestId, user.username]);

  const nextId = () => {
    const ids = Object.keys(animals).map(Number);
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  };

  const updateField = (field, val) => setForm(p => ({ ...p, [field]: val }));
  const updateFact = (i, val) => {
    const facts = [...form.funFacts];
    facts[i] = val;
    setForm(p => ({ ...p, funFacts: facts }));
  };

  const updateQuestion = (qIndex, field, value) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[qIndex] = { ...updated[qIndex], [field]: value };
      return updated;
    });
  };

  const updateOption = (qIndex, optIndex, value) => {
    setQuestions(prev => {
      const updated = [...prev];
      const newOptions = [...updated[qIndex].options];
      newOptions[optIndex] = value;
      updated[qIndex] = { ...updated[qIndex], options: newOptions };
      return updated;
    });
  };

  const validateQuestions = () => {
    for (let i = 0; i < 8; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        return `Question ${i + 1}: Please enter the question text.`;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) {
          return `Question ${i + 1}, Option ${String.fromCharCode(65 + j)}: Please fill in all 4 options.`;
        }
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);

    const questionError = validateQuestions();
    if (questionError) {
      setError(questionError);
      setLoading(false);
      return;
    }

    const id = nextId();
    const imageName = form.imageName.trim();
    const data = {
      id, commonName: form.commonName.trim(), scientificName: form.scientificName.trim(),
      category: form.category, conservationStatus: form.conservationStatus,
      habitat: form.habitat.trim(), region: form.region.trim(), diet: form.diet.trim(),
      lifespan: form.lifespan.trim(), weight: form.weight.trim(), height: form.height.trim(),
      population: form.population.trim(), description: form.description.trim(),
      funFacts: form.funFacts.filter(f => f.trim()), imageKey: imageName,
    };

    try {
      await axios.post(`/api/admin/animals?admin_username=${user.username}`, { id, data, image_name: imageName });

      const formattedQuestions = questions.map(q => ({
        question: q.question.trim(),
        options: q.options.map(o => o.trim()),
        answer: q.answer,
      }));

      await axios.post(`/api/admin/animals/${id}/questions?admin_username=${user.username}`, {
        questions: formattedQuestions,
      });

      if (requestId) {
        try {
          await axios.post(`/api/admin/animal-requests/${requestId}/approve?admin_username=${user.username}`);
        } catch (approveErr) {
          console.error('Failed to approve request after animal creation:', approveErr);
        }
      }

      setSuccess(`Animal "${data.commonName}" created with ID ${id} and 8 quiz questions saved!${requestId ? ' Request approved.' : ''}`);
      setForm({ commonName: '', scientificName: '', category: 'Mammal', conservationStatus: 'Least Concern',
        habitat: '', region: '', diet: '', lifespan: '', weight: '', height: '', population: '',
        description: '', funFacts: ['', '', '', ''], imageName: '' });
      setQuestions(Array.from({ length: 8 }, () => EMPTY_QUESTION()));
      setRequestData(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create animal');
    } finally { setLoading(false); }
  };

  const handleCancel = () => {
    navigate('/admin/animal-requests');
  };

  const categories = ['Mammal', 'Bird', 'Amphibian', 'Reptile', 'Fish', 'Invertebrate', 'Crustacean'];
  const statuses = ['Least Concern', 'Vulnerable', 'Endangered', 'Critically Endangered'];
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div>
      <Navigation user={user} onLogout={onLogout} />
      <div className="profile-container">
        <div className="profile-header">
          <h1>➕ Create New Animal</h1>
          <p>Fill out the animal profile and quiz questions to add it to the platform</p>
        </div>

        {requestData && (
          <div className="alert-section alert-section-green" style={{ marginBottom: 20 }}>
            <div>
              <h3>📋 Creating from teacher request</h3>
              <p>
                <strong>{requestData.common_name}</strong> ({requestData.scientific_name}) — requested by {requestData.teacher_username}
                {requestData.reason && <><br/>Reason: {requestData.reason}</>}
              </p>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Animal Info */}
          <div className="profile-section" style={{ marginBottom: 24 }}>
            <h2>🐾 Animal Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Common Name *</label>
                <input type="text" value={form.commonName} onChange={e => updateField('commonName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Scientific Name *</label>
                <input type="text" value={form.scientificName} onChange={e => updateField('scientificName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select value={form.category} onChange={e => updateField('category', e.target.value)}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Conservation Status *</label>
                <select value={form.conservationStatus} onChange={e => updateField('conservationStatus', e.target.value)}>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Habitat</label><input type="text" value={form.habitat} onChange={e => updateField('habitat', e.target.value)} /></div>
              <div className="form-group"><label>Region</label><input type="text" value={form.region} onChange={e => updateField('region', e.target.value)} /></div>
              <div className="form-group"><label>Diet</label><input type="text" value={form.diet} onChange={e => updateField('diet', e.target.value)} /></div>
              <div className="form-group"><label>Lifespan</label><input type="text" value={form.lifespan} onChange={e => updateField('lifespan', e.target.value)} /></div>
              <div className="form-group"><label>Weight</label><input type="text" value={form.weight} onChange={e => updateField('weight', e.target.value)} /></div>
              <div className="form-group"><label>Height/Size</label><input type="text" value={form.height} onChange={e => updateField('height', e.target.value)} /></div>
              <div className="form-group"><label>Population</label><input type="text" value={form.population} onChange={e => updateField('population', e.target.value)} /></div>
              <div className="form-group">
                <label>Image Filename</label>
                <input type="text" value={form.imageName} onChange={e => updateField('imageName', e.target.value)}
                  placeholder="e.g. lion.jpg" />
                <p style={{ fontSize: 11, color: '#999', marginTop: 4 }}>Must exist in backend/static/animals/ (.jpg, .jpeg, .png, .webp)</p>
              </div>
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea className="form-textarea" rows={4} value={form.description} onChange={e => updateField('description', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Fun Facts (up to 4)</label>
              {form.funFacts.map((f, i) => (
                <input key={i} type="text" value={f} onChange={e => updateFact(i, e.target.value)}
                  placeholder={`Fun fact ${i + 1}`} style={{ marginBottom: 8 }} />
              ))}
            </div>
          </div>

          {/* Quiz Questions */}
          <div className="profile-section" style={{ marginBottom: 24 }}>
            <h2>📝 Quiz Questions (8 Required)</h2>
            <p style={{ color: '#666', marginBottom: 24, fontSize: '0.9rem' }}>
              Each question needs question text, 4 answer options, and a correct answer selected.
            </p>

            {questions.map((q, qIdx) => (
              <div key={qIdx} style={{
                border: '2px solid #e0e0e0',
                borderRadius: 12,
                padding: 24,
                marginBottom: 20,
                background: '#fff',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{
                    background: 'var(--select-color)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {qIdx + 1}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--top-gradient)', fontSize: '1rem' }}>
                    Question {qIdx + 1} of 8
                  </span>
                </div>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label>Question Text *</label>
                  <input
                    type="text"
                    value={q.question}
                    onChange={e => updateQuestion(qIdx, 'question', e.target.value)}
                    placeholder={`Enter question ${qIdx + 1}...`}
                    required
                  />
                </div>

                <p style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 12 }}>
                  Answer Options (select the correct one):
                </p>

                {q.options.map((opt, optIdx) => {
                  const isCorrect = q.answer === optIdx;
                  return (
                    <div key={optIdx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 10,
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: isCorrect ? '2px solid var(--select-color)' : '2px solid #e8e8e8',
                      background: isCorrect ? 'rgba(122,155,84,0.06)' : '#fafafa',
                      cursor: 'pointer',
                    }}
                    onClick={() => updateQuestion(qIdx, 'answer', optIdx)}
                    >
                      <input
                        type="radio"
                        name={`q${qIdx}-answer`}
                        checked={isCorrect}
                        onChange={() => updateQuestion(qIdx, 'answer', optIdx)}
                        style={{ accentColor: 'var(--select-color)', width: 18, height: 18, flexShrink: 0 }}
                      />
                      <span style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: isCorrect ? 'var(--select-color)' : '#888',
                        minWidth: 20,
                        flexShrink: 0,
                      }}>
                        {optionLabels[optIdx]}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          e.stopPropagation();
                          updateOption(qIdx, optIdx, e.target.value);
                        }}
                        onClick={e => e.stopPropagation()}
                        placeholder={`Option ${optionLabels[optIdx]}`}
                        required
                        style={{
                          flex: 1,
                          border: 'none',
                          background: 'transparent',
                          outline: 'none',
                          fontSize: '0.95rem',
                          padding: '6px 0',
                          fontFamily: 'inherit',
                        }}
                      />
                      {isCorrect && (
                        <span style={{ color: 'var(--select-color)', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                          ✓ Correct
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
            <button type="submit" className="btn-primary" style={{ maxWidth: 300 }} disabled={loading}>
              {loading ? 'Creating...' : 'Create Animal & Save Questions'}
            </button>
            <button type="button" className="btn-back" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminCreateAnimal;
