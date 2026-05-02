import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080';

export default function Dashboard({ token, user }) {
  const [appointments, setAppointments] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ date: '', time: '', insect_type: '', location: '', notes: '', status: 'Pending' });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const res = await fetch(`${API_URL}/appointments/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setAppointments(data);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    const isEditing = editingId !== null;
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${API_URL}/appointments/${editingId}` : `${API_URL}/appointments/`;

    const res = await fetch(url, {
      method,
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      setShowBooking(false);
      setEditingId(null);
      setFormData({ date: '', time: '', insect_type: '', location: '', notes: '', status: 'Pending' });
      fetchAppointments();
    }
  };

  const handleEdit = (appt) => {
    setFormData({
      date: appt.date,
      time: appt.time,
      insect_type: appt.insect_type,
      location: appt.location,
      notes: appt.notes,
      status: appt.status
    });
    setEditingId(appt.id);
    setShowBooking(true);
  };

  const handleCancelBookingForm = () => {
    setShowBooking(false);
    setEditingId(null);
    setFormData({ date: '', time: '', insect_type: '', location: '', notes: '', status: 'Pending' });
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to cancel this appointment?")) return;
    await fetch(`${API_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchAppointments();
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
            <div className="flex gap-4">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Date
                <input type="date" className="form-control" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required /></label>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Time
                <input type="time" className="form-control" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required /></label>
              </div>
            </div>
            <div className="form-group">
              <label>Pest Type
              <select className="form-control" value={formData.insect_type} onChange={e => setFormData({...formData, insect_type: e.target.value})} required>
                <option value="">Select a pest</option>
                <option value="Ants">Ants</option>
                <option value="Bed Bugs">Bed Bugs</option>
                <option value="Cockroaches">Cockroaches</option>
                <option value="Termites">Termites</option>
                <option value="Wasps/Bees">Wasps / Bees</option>
                <option value="Rodents">Rodents (Mice/Rats)</option>
                <option value="Other">Other</option>
              </select></label>
            </div>
            <div className="form-group">
              <label>Location
              <input type="text" className="form-control" placeholder="Enter service address" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required /></label>
            </div>
            <div className="form-group">
              <label>Additional Notes
              <textarea className="form-control" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} rows="2"></textarea></label>
            </div>
            {user.is_admin && editingId && (
              <div className="form-group">
                <label>Status
                <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} required>
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
              {user.is_admin && <th>User ID</th>}
              <th>Date</th>
              <th>Time</th>
              <th>Pest Type</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appt => (
              <tr key={appt.id}>
                {user.is_admin && <td>{appt.user_id}</td>}
                <td>{appt.date}</td>
                <td>{appt.time}</td>
                <td>{appt.insect_type}</td>
                <td>{appt.location}</td>
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
    </div>
  );
}
