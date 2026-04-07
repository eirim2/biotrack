import React, { useState } from 'react';
import Navigation from './Navigation';
import axios from 'axios';

function TeacherAnimalRequest({ user, onLogout }) {
  const [form, setForm] = useState({ common_name: '', scientific_name: '', category: 'Mammal', reason: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Mammal', 'Bird', 'Amphibian', 'Reptile', 'Fish', 'Invertebrate', 'Crustacean'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await axios.post('/api/animal-requests', {
        teacher_username: user.username,
        common_name: form.common_name.trim(),
        scientific_name: form.scientific_name.trim(),
        category: form.category,
        reason: form.reason.trim(),
      });
      setSuccess('Your animal request has been submitted for admin review!');
      setForm({ common_name: '', scientific_name: '', category: 'Mammal', reason: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit request');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <Navigation user={user} onLogout={onLogout} />
      <div className="profile-container">
        <div className="profile-header">
          <h1>🐾 Request New Animal</h1>
          <p>Suggest a new animal to be added to the BioTrack platform</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="profile-section">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Common Name *</label>
              <input type="text" value={form.common_name} onChange={e => setForm(p => ({ ...p, common_name: e.target.value }))}
                required placeholder="e.g., Red Fox" />
            </div>
            <div className="form-group">
              <label>Scientific Name *</label>
              <input type="text" value={form.scientific_name} onChange={e => setForm(p => ({ ...p, scientific_name: e.target.value }))}
                required placeholder="e.g., Vulpes vulpes" />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Reason for Addition</label>
              <textarea className="form-textarea" rows={3} value={form.reason}
                onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                placeholder="Why should this animal be added to BioTrack?" />
            </div>
            <button type="submit" className="btn-primary" style={{ maxWidth: 280 }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TeacherAnimalRequest;
