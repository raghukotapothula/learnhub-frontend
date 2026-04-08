import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Users, FileUp, CheckCircle, 
  Clock, Play, X, AlertTriangle, Calendar, Filter, MoreVertical,
  ChevronRight, ExternalLink, Download, ArrowUpDown, RefreshCw, Video
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { webinarAPI } from '../services/api';
import './Admin.css';

const AdminWebinars = () => {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentWebinar, setCurrentWebinar] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State with split date and time
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    date: '',
    time: '',
    durationMinutes: 60,
    category: 'Development',
    maxParticipants: 100,
    status: 'UPCOMING',
    coverImageUrl: '',
    streamUrl: ''
  });

  const fetchWebinars = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await webinarAPI.getAdminWebinars();
      setWebinars(Array.isArray(resp.data) ? resp.data : []);
    } catch (err) {
      console.error('Webinar fetch error:', err);
      setError('Connection to platform failed. Verify backend infrastructure and token validity.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebinars();
  }, [fetchWebinars]);

  const handleOpenAddModal = () => {
    setCurrentWebinar(null);
    setFormData({
      title: '',
      description: '',
      instructor: '',
      date: '',
      time: '',
      durationMinutes: 60,
      category: 'Development',
      maxParticipants: 100,
      status: 'UPCOMING',
      coverImageUrl: '',
      streamUrl: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (webinar) => {
    if (!webinar) return;
    setCurrentWebinar(webinar);
    const dt = webinar.dateTime ? new Date(webinar.dateTime) : new Date();
    
    // Properly format for inputs
    const dateStr = dt.toISOString().split('T')[0];
    const timeStr = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    setFormData({
      title: webinar.title || '',
      description: webinar.description || '',
      instructor: webinar.instructor || '',
      date: dateStr,
      time: timeStr,
      durationMinutes: webinar.durationMinutes || 60,
      category: webinar.category || 'Development',
      maxParticipants: webinar.maxParticipants || 100,
      status: webinar.status || 'UPCOMING',
      coverImageUrl: webinar.coverImageUrl || '',
      streamUrl: webinar.streamUrl || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Safe combination of date and time
    let combinedDateTime;
    try {
        const dateObj = new Date(`${formData.date}T${formData.time}`);
        if (isNaN(dateObj.getTime())) throw new Error('Invalid date');
        combinedDateTime = dateObj.toISOString();
    } catch(err) {
        toast.error('Invalid date or time format');
        setSaving(false);
        return;
    }

    // Build clean payload - only send fields the backend expects
    const payload = {
      title: formData.title,
      description: formData.description,
      instructor: formData.instructor,
      dateTime: combinedDateTime,
      durationMinutes: formData.durationMinutes,
      category: formData.category,
      maxParticipants: formData.maxParticipants,
      status: formData.status,
      coverImageUrl: formData.coverImageUrl,
      streamUrl: formData.streamUrl
    };

    try {
      if (currentWebinar) {
        await webinarAPI.update(currentWebinar.id, payload);
      } else {
        await webinarAPI.create(payload);
      }
      toast.success(currentWebinar ? 'Webinar updated successfully' : 'Webinar created successfully');
      setShowModal(false);
      fetchWebinars();
    } catch (err) {
      console.error('Webinar save error:', err);
      const msg = err.response?.data?.message || 'Failed to save webinar. Please try again.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentWebinar) return;
    try {
      await webinarAPI.delete(currentWebinar.id);
      toast.success('Webinar deleted successfully');
      setShowDeleteConfirm(false);
      setCurrentWebinar(null);
      fetchWebinars();
    } catch (err) {
      console.error('Webinar delete error:', err);
      const msg = err.response?.data?.message || 'Failed to delete webinar. Please try again.';
      toast.error(msg);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'LIVE': return <span className="badge-premium badge-red animate-pulse">LIVE</span>;
      case 'UPCOMING': return <span className="badge-premium badge-blue">UPCOMING</span>;
      case 'COMPLETED': return <span className="badge-premium badge-purple">COMPLETED</span>;
      default: return <span className="badge-premium badge-purple opacity-50">SHUTDOWN</span>;
    }
  };

  const filteredWebinars = Array.isArray(webinars) ? webinars.filter(w => 
    (w.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.instructor || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="admin-webinars-page animate-fade-in">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="breadcrumbs">
          <span className="breadcrumb-item">Admin</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item text-white">Sessions Control</span>
        </div>
        <div className="admin-page-title-row">
          <div>
            <h1 className="admin-page-title">Nexus - Webinar Management</h1>
            <p className="admin-page-subtitle">Configure broad-spectrum webinar parameters and monitor status.</p>
          </div>
          <button onClick={handleOpenAddModal} className="btn-admin-primary d-flex align-items-center gap-2">
            <Plus size={20} />
            <span>Create Webinar</span>
          </button>
        </div>
      </div>

      <div className="admin-page-content">
        {error ? (
          <div className="premium-card p-5 text-center min-vh-50 flex flex-col items-center justify-center border-rose-500/30">
            <AlertTriangle size={60} className="text-rose-500 mb-4 mx-auto" />
            <h3 className="fs-3 font-bold mb-2">Network Desynchronization</h3>
            <p className="text-slate-400 mb-5 max-w-md mx-auto">{error}</p>
            <button onClick={fetchWebinars} className="btn-admin-primary px-5 py-3 d-flex items-center gap-2 mx-auto">
              <RefreshCw size={20} /> Re-establish Connection
            </button>
          </div>
        ) : (
          <div className="premium-table-container">
            <div className="table-header-actions">
              <div className="search-wrapper position-relative flex-grow-1" style={{ maxWidth: '400px' }}>
                <Search size={18} className="search-icon-table" />
                <input 
                  type="text" 
                  placeholder="Filter by title, instructor..." 
                  className="premium-input ps-5"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="d-flex gap-2">
                <button onClick={fetchWebinars} className={`nav-icon-btn border ${loading ? 'animate-spin-slow' : ''}`} title="Manual Sync">
                  <RefreshCw size={18} />
                </button>
                <button className="nav-icon-btn border d-none d-md-block"><Download size={18} /></button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Webinar</th>
                    <th>Instructor</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Audience</th>
                    <th style={{ minWidth: '100px', whiteSpace: 'nowrap' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3, 4, 5, 6].map((i) => (
                      <tr key={i}>
                        <td colSpan="6">
                          <div className="skeleton-row-box flex items-center p-3 gap-4">
                            <div className="skeleton-avatar skeleton"></div>
                            <div className="flex-1"><div className="skeleton-text skeleton w-1/2 h-4"></div></div>
                            <div className="w-24"><div className="skeleton-text skeleton w-full h-4"></div></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : filteredWebinars.length > 0 ? (
                    filteredWebinars.map((webinar) => (
                      <tr key={webinar?.id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="webinar-thumb-wrapper overflow-hidden rounded-lg bg-slate-800" style={{ width: '64px', height: '40px' }}>
                              {webinar?.coverImageUrl ? (
                                <img 
                                  src={webinar.coverImageUrl} 
                                  crossOrigin="anonymous"
                                  alt="" 
                                  className="w-100 h-100 object-fit-cover" 
                                />
                              ) : (
                                <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-slate-800 text-white fw-bold fs-5">
                                  {(webinar?.title || 'W').charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="d-flex flex-column">
                              <span className="fw-bold text-white fs-6">{webinar?.title || 'Unknown Asset'}</span>
                              <span className="small opacity-50">{webinar?.category || 'Legacy'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-slate-200">{webinar?.instructor || 'Anonymous'}</span>
                        </td>
                        <td>
                          <div>
                            <span className="fw-medium text-slate-200">
                              {webinar?.dateTime 
                                ? new Date(webinar.dateTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
                                : 'TBD'}
                            </span>
                          </div>
                        </td>
                        <td>{getStatusBadge(webinar?.status)}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Users size={14} className="text-violet-400" />
                            <span className="fw-bold">{webinar?.registeredCount || 0}</span>
                          </div>
                        </td>
                        <td style={{ minWidth: '100px', whiteSpace: 'nowrap' }}>
                          <div className="d-flex gap-2" style={{ flexWrap: 'nowrap' }}>
                            <button onClick={() => handleOpenEditModal(webinar)} className="nav-icon-btn border hover:bg-violet-500">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => { setCurrentWebinar(webinar); setShowDeleteConfirm(true); }} className="nav-icon-btn border hover:bg-rose-500 text-rose-400">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center p-5">
                        <div className="opacity-30 mb-3"><Video size={48} className="mx-auto" /></div>
                        <p className="text-slate-400">No active assets detected on your current filter.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Initialize / Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="premium-card w-full max-w-3xl animate-fade-in p-0 overflow-visible h-fit" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header-admin p-4 border-b border-slate-800 d-flex justify-content-between align-items-center bg-slate-900 rounded-t-[20px]">
              <h2 className="text-xl font-bold mb-0">{currentWebinar ? 'Edit Webinar' : 'Create Webinar'}</h2>
              <button onClick={() => setShowModal(false)} className="close-btn-admin opacity-60 hover:opacity-100"><X size={24} /></button>
            </div>
            
            <div className="modal-body-scrollable p-4 overflow-y-auto">
              <form onSubmit={handleSubmit} className="premium-form">
                <div className="row g-4">
                  <div className="col-12">
                    <label className="premium-label">Title</label>
                    <input 
                      type="text" 
                      required 
                      className="premium-input" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="premium-label">Instructor Name</label>
                    <input 
                      type="text" 
                      required 
                      className="premium-input" 
                      value={formData.instructor}
                      onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="premium-label">Category</label>
                    <select 
                      className="premium-input w-full"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      {['Development', 'Design', 'AI', 'Cloud', 'Security', 'Data', 'Web3'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  
                  {/* SPLIT DATE & TIME - requested fix */}
                  <div className="col-md-6">
                    <label className="premium-label">Date</label>
                    <input 
                      type="date" 
                      required 
                      className="premium-input" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="premium-label">Time</label>
                    <input 
                      type="time" 
                      required 
                      className="premium-input" 
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="premium-label">Max Participants</label>
                    <input 
                      type="number" 
                      required 
                      className="premium-input" 
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="premium-label">Duration (Minutes)</label>
                    <input 
                      type="number" 
                      required 
                      className="premium-input" 
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="premium-label">Status</label>
                    <select 
                      className="premium-input w-full"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="LIVE">LIVE</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="premium-label">Thumbnail URL (optional)</label>
                    <input 
                      type="url" 
                      className="premium-input" 
                      value={formData.coverImageUrl}
                      onChange={(e) => setFormData({...formData, coverImageUrl: e.target.value})}
                    />
                  </div>
                  <div className="col-12">
                    <label className="premium-label">Stream URL (Meeting Link)</label>
                    <input 
                      type="url" 
                      className="premium-input" 
                      value={formData.streamUrl}
                      onChange={(e) => setFormData({...formData, streamUrl: e.target.value})}
                    />
                  </div>
                  <div className="col-12">
                    <label className="premium-label">Description</label>
                    <textarea 
                      rows="4" 
                      required 
                      className="premium-input" 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                  </div>
                </div>
                
                <div className="modal-footer-admin p-4 border-t border-slate-800 d-flex justify-content-end gap-3 bg-slate-900 rounded-b-[20px] mt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-admin-secondary px-5 bg-transparent border-slate-700">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-admin-primary px-5 d-flex align-items-center gap-2">
                    {saving ? <div className="spinner-border spinner-border-sm" role="status"></div> : (currentWebinar ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Termination Confirmation */}
      {showDeleteConfirm && (
        <div className="admin-modal-overlay">
          <div className="premium-card max-w-md animate-fade-in text-center p-5">
            <div className="confirm-icon mb-4"><AlertTriangle size={64} className="text-rose-500 mx-auto" /></div>
            <h2 className="text-2xl font-bold mb-3">Delete Webinar</h2>
            <p className="text-slate-400 mb-5">Are you sure you want to delete <strong>{currentWebinar?.title}</strong>? This action cannot be undone.</p>
            <div className="d-flex justify-content-center gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-admin-secondary flex-1 border-slate-700 bg-transparent py-3">Cancel</button>
              <button 
                onClick={handleDelete} 
                className="btn-admin-danger flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl py-3 border-0"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .search-icon-table { position: absolute; left: 1.25rem; top: 50%; transform: translateY(-50%); color: #64748b; }
        .admin-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1.5rem; }
        .modal-body-scrollable { scrollbar-width: thin; scrollbar-color: #334155 #0f172a; max-height: calc(90vh - 140px); overflow-y: auto; }
        .btn-admin-primary { background: #7c3aed; color: white; border: none; border-radius: 12px; font-weight: 700; transition: all 0.2s; padding: 0.75rem 1.5rem; cursor: pointer; }
        .btn-admin-primary:hover { background: #6d28d9; transform: translateY(-2px); box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4); }
        .btn-admin-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .btn-admin-secondary { border-radius: 12px; font-weight: 600; padding: 0.75rem; border: 1px solid #1e293b; color: white; cursor: pointer; }
        .btn-admin-secondary:hover { background: rgba(30, 41, 59, 0.5); }
        .btn-admin-danger { border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .btn-admin-danger:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(225, 29, 72, 0.4); }
        .close-btn-admin { background: none; border: none; color: white; cursor: pointer; padding: 0.25rem; border-radius: 8px; transition: all 0.2s; }
        .close-btn-admin:hover { background: rgba(30, 41, 59, 0.5); }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .7; } }
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .min-vh-50 { min-height: 50vh; }
        .skeleton-row-box { background: rgba(30, 41, 59, 0.2); border-radius: 12px; }
        .premium-form .row { display: flex; flex-wrap: wrap; margin: -0.5rem; }
        .premium-form .col-12 { flex: 0 0 100%; max-width: 100%; padding: 0.5rem; }
        .premium-form .col-md-6 { flex: 0 0 50%; max-width: 50%; padding: 0.5rem; }
        @media (max-width: 768px) { .premium-form .col-md-6 { flex: 0 0 100%; max-width: 100%; } }
      `}</style>
    </div>
  );
};

export default AdminWebinars;
