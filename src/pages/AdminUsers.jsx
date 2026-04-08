import { useState, useEffect, useCallback } from 'react';
import { 
  Users, Search, Download, Mail, Calendar, Filter, 
  CheckCircle, Clock, ArrowRight, UserCheck, Shield, ChevronDown, RefreshCw, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { webinarAPI, registrationAPI } from '../services/api';
import './Admin.css';

const AdminUsers = () => {
  const [webinars, setWebinars] = useState([]);
  const [selectedWebinarId, setSelectedWebinarId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingWebinars, setLoadingWebinars] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchWebinars = useCallback(async () => {
    setLoadingWebinars(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://wicky-sprojectfsad-backend.onrender.com';
      const urlPrefix = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

      const resp = await fetch(`${urlPrefix}/admin/webinars`, { headers });
      if (!resp.ok) throw new Error('Failed to fetch');
      const data = await resp.json();
      setWebinars(data);
    } catch (err) {
      setError('Failed to retrieve participant metrics index from platform.');
    } finally {
      setLoadingWebinars(false);
    }
  }, []);

  useEffect(() => {
    fetchWebinars();
  }, [fetchWebinars]);

  const fetchRegistrations = useCallback(async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://wicky-sprojectfsad-backend.onrender.com';
      const urlPrefix = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

      const resp = await fetch(`${urlPrefix}/registrations/webinar/${id}`, { headers });
      if (!resp.ok) throw new Error('Failed to fetch metrics');
      const data = await resp.json();
      setRegistrations(data);
    } catch (err) {
      toast.error('Metrics retrieval failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedWebinarId) {
      fetchRegistrations(selectedWebinarId);
    } else {
      setRegistrations([]);
    }
  }, [selectedWebinarId, fetchRegistrations]);

  const exportCSV = () => {
    if (registrations.length === 0) return;
    
    const selectedWebinar = webinars.find(w => w?.id?.toString() === selectedWebinarId.toString());
    const header = "Name,Email,Registered On,Status\n";
    const rows = (Array.isArray(registrations) ? registrations : []).map(reg => 
      `${reg?.userName || 'Anon'},${reg?.userEmail || 'N/A'},${reg?.registrationDate ? new Date(reg.registrationDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'TBD'},Confirmed`
    ).join("\n");
    
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Audit_Report_${(selectedWebinar?.title || 'Unknown').replace(/ /g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Attendee report exported');
  };

  const filteredRegistrations = (Array.isArray(registrations) ? registrations : []).filter(reg => 
    (reg?.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (reg?.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-users animate-fade-in">
       {/* Page Header */}
       <div className="admin-page-header">
        <div className="breadcrumbs">
          <span className="breadcrumb-item">Admin</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item text-white">Audience Hub</span>
        </div>
        <div className="admin-page-title-row">
          <div>
            <h1 className="admin-page-title text-violet-100">Participant Intelligence</h1>
            <p className="admin-page-subtitle">Track enrollments, demographic clusters, and session participation.</p>
          </div>
          {selectedWebinarId && registrations.length > 0 && (
            <button onClick={exportCSV} className="btn-admin-primary d-flex align-items-center gap-2">
              <Download size={18} />
              <span>Full Audit Export</span>
            </button>
          )}
        </div>
      </div>

      <div className="admin-page-content">
        {error ? (
          <div className="premium-card p-5 text-center min-vh-50 flex flex-col justify-center items-center border-rose-500/20">
             <AlertTriangle size={60} className="text-rose-500 mb-4 mx-auto" />
             <h3 className="fs-3 fw-bold mb-3">Sync Error</h3>
             <p className="text-slate-400 mb-5">{error}</p>
             <button onClick={fetchWebinars} className="btn-admin-primary px-5 py-3 d-flex items-center gap-2 mx-auto">
               <RefreshCw size={18} /> Retry Connection
             </button>
          </div>
        ) : (
          <>
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="premium-card p-3 h-100 flex items-center bg-slate-900 border-slate-800">
                  <div className="search-wrapper flex-grow-1 position-relative">
                      <Filter size={20} className="search-icon-table" />
                      <select 
                        className="premium-input ps-5 appearance-none bg-transparent w-full" 
                        value={selectedWebinarId}
                        onChange={(e) => setSelectedWebinarId(e.target.value)}
                        disabled={loadingWebinars}
                      >
                        <option value="">-- Select Webinar --</option>
                        {webinars.map(w => (
                          <option key={w?.id} value={w?.id}>{w?.title} ({w?.dateTime ? new Date(w.dateTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'TBD'})</option>
                        ))}
                      </select>
                      {loadingWebinars ? (
                         <div className="position-absolute end-4 top-50 translate-middle-y">
                            <div className="spinner-border text-violet-500 w-4 h-4"></div>
                         </div>
                      ) : (
                        <ChevronDown className="position-absolute end-4 top-50 translate-middle-y opacity-30" size={18} />
                      )}
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="premium-card p-3 h-100 flex items-center bg-slate-900 border-slate-800">
                  <div className="search-wrapper flex-grow-1 position-relative">
                    <Search size={20} className="search-icon-table" />
                    <input 
                      type="text" 
                      placeholder="Search by name or email..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="premium-input ps-5 w-full"
                      disabled={!selectedWebinarId || loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="premium-table-container min-vh-50">
              {loading ? (
                <div className="p-4 d-flex flex-grow-1 flex-col justify-center items-center py-24">
                   <div className="spinner-border text-violet-500 w-12 h-12 mb-3"></div>
                   <span className="text-slate-400">Aggregating participation data...</span>
                </div>
              ) : !selectedWebinarId ? (
                <div className="text-center p-5 opacity-40 d-flex flex-column align-items-center justify-center py-24">
                  <div className="p-5 bg-violet-900/10 rounded-full mb-4 ring-1 ring-violet-500/20">
                    <UserCheck size={64} className="text-violet-500" />
                  </div>
                   <h3 className="fs-3 fw-bold text-slate-300">No Webinar Selected</h3>
                   <p className="text-slate-500 max-w-sm">Please select a webinar to view registered students and participation details.</p>
                </div>
              ) : filteredRegistrations.length > 0 ? (
                <div className="table-responsive">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Email</th>
                        <th>Registered On</th>
                        <th>Status</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.map((reg) => (
                        <tr key={reg?.id}>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <div className="admin-avatar-lg bg-gradient-to-br from-violet-600 to-indigo-700">
                                {reg?.userName?.charAt(0) || 'A'}
                              </div>
                              <div className="d-flex flex-column">
                                <span className="fw-bold text-white fs-6">{reg?.userName || 'Anon'}</span>
                                <span className="small opacity-50">ID: {reg?.id?.toString().slice(-4) || '----'}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2 text-slate-300">
                              <Mail size={16} className="text-violet-400 opacity-60" />
                              <span>{reg?.userEmail || 'N/A'}</span>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2 text-slate-300">
                              <Calendar size={16} className="text-emerald-400 opacity-60" />
                              <span>{reg?.registrationDate ? new Date(reg.registrationDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'TBD'}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge-premium badge-green">ACTIVE</span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-1 text-slate-400 small">
                               <Shield size={14} /> Student Node
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-5 opacity-40 py-24">
                   <Users size={48} className="mx-auto mb-3" />
                   <p className="fs-4 fw-bold">No Registrations Found</p>
                   <p className="small">No students matched your current search criteria.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        .admin-avatar-lg {
          width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
          color: white; border-radius: 12px; font-weight: 800; font-size: 1.1rem; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        .min-vh-50 { min-height: 50vh; }
        .spinner-border { border-width: 0.25em; border-right-color: transparent !important; }
      `}</style>
    </div>
  );
};

export default AdminUsers;
