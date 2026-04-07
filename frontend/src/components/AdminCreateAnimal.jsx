import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from './Navigation';
import axios from 'axios';

function AdminCreateAnimal({ user, onLogout }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [animals, setAnimals] = useState({});

  const [form, setForm] = useState({
    commonName: '', scientificName: '', category: 'Mammal',
    conservationStatus: 'Least Concern', habitat: '', region: '',
    diet: '', lifespan: '', weight: '', height: '', population: '',
    description: '', funFacts: ['', '', '', ''],
  });

  useEffect(() => {
    axios.get('/api/animals').then(r => setAnimals(r.data || {}));
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const id = nextId();
    const data = {
      id, commonName: form.commonName.trim(), scientificName: form.scientificName.trim(),
      category: form.category, conservationStatus: form.conservationStatus,
      habitat: form.habitat.trim(), region: form.region.trim(), diet: form.diet.trim(),
      lifespan: form.lifespan.trim(), weight: form.weight.trim(), height: form.height.trim(),
      population: form.population.trim(), description: form.description.trim(),
      funFacts: form.funFacts.filter(f => f.trim()), imageKey: '',
    };
    try {
      await axios.post(`/api/admin/animals?admin_username=${user.username}`, { id, data });
      setSuccess(`Animal "${data.commonName}" created with ID ${id}`);
      setForm({ commonName: '', scientificName: '', category: 'Mammal', conservationStatus: 'Least Concern',
        habitat: '', region: '', diet: '', lifespan: '', weight: '', height: '', population: '',
        description: '', funFacts: ['', '', '', ''] });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create animal');
    } finally { setLoading(false); }
  };

  const categories = ['Mammal', 'Bird', 'Amphibian', 'Reptile', 'Fish', 'Invertebrate', 'Crustacean'];
  const statuses = ['Least Concern', 'Vulnerable', 'Endangered', 'Critically Endangered'];

  return (
    <div>
      <Navigation user={user} onLogout={onLogout} />
      <div className="profile-container">
        <div className="profile-header">
          <h1>➕ Create New Animal</h1>
          <p>Fill out the animal profile to add it to the platform</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="profile-section">
          <form onSubmit={handleSubmit}>
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
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn-primary" style={{ maxWidth: 240 }} disabled={loading}>
                {loading ? 'Creating...' : 'Create Animal'}
              </button>
              <button type="button" className="btn-back" onClick={() => navigate('/admin/animal-requests')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminCreateAnimal;
