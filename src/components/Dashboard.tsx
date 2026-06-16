import { useState, useEffect } from 'react';
import { User, Appointment, Insect } from '../types';

const API_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL;

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [insects, setInsects] = useState<Insect[]>([]);
  const [showBooking, setShowBooking] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    date: '', time: '', insect_id: 0,
    door_number: '', road_name: '', postcode: '',
    notes: '', status: 'Pending'
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [adminFormData, setAdminFormData] = useState({ username: '', password: '' });
  const [adminMsg, setAdminMsg] = useState('');

  const handlePostcodeChange = (val: string) => {
    setFormData(prev => ({ ...prev, postcode: val }));
  };

  const fetchInsects = async () => {
    const res = await fetch(`${API_URL}/insects/`);
    if (res.ok) {
      const data = await res.json();
      setInsects(data);
    }
  };

  const fetchAppointments = async () => {
    const res = await fetch(`${API_URL}/appointments/`, {
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      setAppointments(data);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchAppointments();
      await fetchInsects();
    };
    init();
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Frontend Validation
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setErrorMsg("Error: Appointment date cannot be in the past.");
      return;
    }
    if (formData.road_name.length < 3) {
      setErrorMsg("Error: Road name must be at least 3 characters.");
      return;
    }
    if (!formData.door_number.trim()) {
      setErrorMsg("Error: Door number is required.");
      return;
    }
    // Structural "Shape" Validation (Official UK Format - No Spaces)
    const cleanedPostcode = formData.postcode.replace(/\s+/g, '').toUpperCase();
    const ukPostcodeRegex = /^(([A-Z]{1,2}[0-9][A-Z0-9]?)([0-9][A-Z]{2}))|(GIR0AA)$/i;
    if (!ukPostcodeRegex.test(cleanedPostcode)) {
      setErrorMsg("Error: Invalid UK Postcode structure. Please use a valid UK postcode (e.g. SW1A1AA).");
      return;
    }

    const isEditing = editingId !== null;
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${API_URL}/appointments/${editingId}` : `${API_URL}/appointments/`;

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ ...formData, postcode: cleanedPostcode })
    });
    if (res.ok) {
      setSuccessMsg('Booking Confirmed!');
      setTimeout(() => {
        setShowBooking(false);
        setEditingId(null);
        setSuccessMsg('');
        setFormData({
          date: '', time: '', insect_id: 0,
          door_number: '', road_name: '', postcode: '',
          notes: '', status: 'Pending'
        });
        fetchAppointments();
      }, 1500);
    } else {
      const data = await res.json();
      setErrorMsg(`Error: ${data.detail || 'Failed to save appointment'}`);
    }
  };

  const handleEdit = (appt: Appointment) => {
    setFormData({
      date: appt.date,
      time: appt.time,
      insect_id: appt.insect_id,
      door_number: appt.door_number,
      road_name: appt.road_name,
      postcode: appt.postcode,
      notes: appt.notes || '',
      status: appt.status
    });
    setEditingId(appt.id);
    setShowBooking(true);
  };

  const handleCancelBookingForm = () => {
    setShowBooking(false);
    setEditingId(null);
    setFormData({
      date: '', time: '', insect_id: 0,
      door_number: '', road_name: '', postcode: '',
      notes: '', status: 'Pending'
    });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    await fetch(`${API_URL}/appointments/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    fetchAppointments();
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminMsg('');
    const res = await fetch(`${API_URL}/auth/create-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(adminFormData)
    });
    const data = await res.json();
    if (res.ok) {
      setAdminMsg('Admin account created successfully!');
      setAdminFormData({ username: '', password: '' });
    } else {
      setAdminMsg(`Error: ${data.detail}`);
    }
  };

  return (
    <div className="glass-panel" style={{ marginTop: '2rem' }}>
      <div className="flex justify-between align-center mb-4">
        <h2>{user.is_admin ? 'All Appointments (Admin)' : 'My Appointments'}</h2>
        {!user.is_admin && (
          <button className="btn" onClick={() => showBooking ? handleCancelBookingForm() : setShowBooking(true)}>
            {showBooking ? 'Cancel' : 'Book Exterminator'}
          </button>
        )}
      </div>

      {showBooking && (
        <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3>{editingId ? 'Edit Appointment' : 'New Extermination Appointment'}</h3>
          <form onSubmit={handleBook} style={{ marginTop: '1rem' }}>
            {errorMsg && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>{errorMsg}</div>}
            {successMsg && <div className="badge badge-success" style={{ marginBottom: '1.5rem', padding: '10px', display: 'block', textAlign: 'center' }}>{successMsg}</div>}
            <div className="flex gap-4">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Date
                  <input type="date" className="form-control" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} disabled={user.is_admin} required /></label>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Time
                  <input type="time" className="form-control" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} disabled={user.is_admin} required /></label>
              </div>
            </div>
            <div className="form-group">
              <label>Pest Type
                <select className="form-control" value={formData.insect_id} onChange={e => setFormData({ ...formData, insect_id: parseInt(e.target.value) })} disabled={user.is_admin} required>
                  <option value="">Select a pest</option>
                  {insects.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select></label>
            </div>
            <div className="flex gap-4">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Door / House #
                  <input type="text" id="door_number" className="form-control" placeholder="10A" value={formData.door_number} onChange={e => setFormData({ ...formData, door_number: e.target.value })} disabled={user.is_admin} required /></label>
              </div>
              <div className="form-group" style={{ flex: 3 }}>
                <label>Road Name
                  <input type="text" id="road_name" className="form-control" placeholder="High Street" value={formData.road_name} onChange={e => setFormData({ ...formData, road_name: e.target.value })} disabled={user.is_admin} required /></label>
              </div>
            </div>

            <div className="form-group">
              <label>Postcode
                <input type="text" id="postcode" className="form-control" placeholder="SW1A 1AA" value={formData.postcode} onChange={e => handlePostcodeChange(e.target.value)} disabled={user.is_admin} required /></label>
            </div>
            <div className="form-group">
              <label>Additional Notes
                <textarea className="form-control" value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={2} disabled={user.is_admin}></textarea></label>
            </div>
            {user.is_admin && editingId && (
              <div className="form-group">
                <label>Status
                  <select className="form-control" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} required>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select></label>
              </div>
            )}
            <button type="submit" className="btn">{editingId ? 'Update Appointment' : 'Confirm Booking'}</button>
          </form>
        </div>
      )}

      {appointments.length === 0 ? (
        <p style={{ color: 'var(--text-light)' }}>No appointments found.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              {user.is_admin && <th>Customer</th>}
              <th>Date / Time</th>
              <th>Pest Details</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appt => (
              <tr key={appt.id}>
                {user.is_admin && <td style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{appt.creator_username}</td>}
                <td>
                  <div style={{ fontWeight: 'bold' }}>{appt.date}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{appt.time}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 'bold' }}>{appt.insect?.name || 'N/A'}</div>
                  {appt.insect && (
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: appt.insect.danger_level > 3 ? '#ffebee' : '#f1f8e9',
                      color: appt.insect.danger_level > 3 ? '#c62828' : '#2e7d32',
                      border: `1px solid ${appt.insect.danger_level > 3 ? '#ef9a9a' : '#a5d6a7'}`
                    }}>
                      Danger: {appt.insect.danger_level}/5
                    </span>
                  )}
                </td>
                <td>
                  <div style={{ fontWeight: 'bold' }}>{appt.door_number} {appt.road_name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{appt.postcode}</div>
                </td>
                <td>
                  <span className={`badge ${appt.status === 'Pending' ? 'badge-warning' : appt.status === 'Cancelled' ? 'badge-danger' : 'badge-success'}`}>
                    {appt.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-primary mr-2" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', marginRight: '0.5rem' }} onClick={() => handleEdit(appt)}>
                    Edit
                  </button>
                  <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleDelete(appt.id)}>
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {user.is_admin && (
        <div className="glass-panel" style={{ marginTop: '3rem', border: '1px dashed var(--primary-color)' }}>
          <h3>Staff Management</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1rem' }}>Create new administrative accounts for Rentokil staff.</p>
          {adminMsg && <div style={{ marginBottom: '1rem', color: adminMsg.startsWith('Error') ? 'var(--danger-color)' : 'var(--primary-color)' }}>{adminMsg}</div>}
          <form onSubmit={handleCreateAdmin} className="flex gap-4 align-end">
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Username
                <input type="text" className="form-control" value={adminFormData.username} onChange={e => setAdminFormData({ ...adminFormData, username: e.target.value })} required /></label>
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Password
                <input type="password" className="form-control" value={adminFormData.password} onChange={e => setAdminFormData({ ...adminFormData, password: e.target.value })} required /></label>
            </div>
            <button type="submit" className="btn" style={{ height: '42px' }}>Create Admin</button>
          </form>
        </div>
      )}
    </div>
  );
}
