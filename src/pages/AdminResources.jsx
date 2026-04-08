import { useState, useEffect, useCallback } from 'react';
import { 
  FileUp, Trash2, Plus, Search, ExternalLink, FileText, 
  Layout, Video, AlertCircle, RefreshCw, Layers, Calendar, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import API, { webinarAPI, resourceAPI } from '../services/api';
import './Admin.css';

const AdminResources = () => {
  const [webinars, setWebinars] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedWebinarId, setSelectedWebinarId] = useState('');
  const [loadingWebinars, setLoadingWebinars] = useState(true);
  const [loadingResources, setLoadingResources] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    fileType: 'PDF',
    fileUrl: '',
    description: ''
  });

  const fetchWebinars = useCallback(async () => {
    setLoadingWebinars(true);
    setError(null);
    try {
      const resp = await API.get('/admin/webinars');
      const data = Array.isArray(resp.data) ? resp.data : [];
      const completed = data.filter(w => w.status === 'COMPLETED');
      setWebinars(completed);
    } catch (err) {
      setError('Failed to retrieve completed sessions from admin portal.');
    } finally {
      setLoadingWebinars(false);
    }
  }, []);

  useEffect(() => {
    fetchWebinars();
  }, [fetchWebinars]);

  const fetchResources = useCallback(async (id) => {
    setLoadingResources(true);
    try {
      const resp = await resourceAPI.getByWebinar(id);
      setResources(Array.isArray(resp.data) ? resp.data : []);
    } catch (err) {
      toast.error('Failed to load resources');
    } finally {
      setLoadingResources(false);
    }
  }, []);

  useEffect(() => {
    if (selectedWebinarId) {
      fetchResources(selectedWebinarId);
    } else {
      setResources([]);
    }
  }, [selectedWebinarId, fetchResources]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWebinarId) return;

    setSaving(true);
    try {
      const payload = { ...formData, webinarId: selectedWebinarId };
      await API.post('/admin/resources', payload);
      toast.success('Resource uploaded successfully');
      setFormData({ title: '', fileType: 'PDF', fileUrl: '', description: '' });
      fetchResources(selectedWebinarId);
    } catch (err) {
      toast.error('Failed to upload resource');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/resources/${id}`);
      toast.success('Resource deleted');
      fetchResources(selectedWebinarId);
    } catch (err) {
      toast.error('Failed to delete resource');
    }
  };

  const getResourceTypeIcon = (type) => {
    switch(type) {
      case 'PDF': return <FileText size={20} />;
      case 'SLIDE': return <Layout size={20} />;
      case 'VIDEO': return <Video size={20} />;
      case 'LINK': return <ExternalLink size={20} />;
      default: return <FileText size={20} />;
    }
  };

  return (
    <div className="admin-resources animate-fade-in">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="breadcrumbs">
          <span className="breadcrumb-item">Admin</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item text-white">Resources</span>
        </div>
        <div className="admin-page-title-row">
          <div>
            <h1 className="admin-page-title text-violet-100">Resource Repository</h1>
            <p className="admin-page-subtitle">Upload and categorize intellectual assets for finalized sessions.</p>
          </div>
          <button onClick={fetchWebinars} className="nav-icon-btn border border-slate-700 bg-slate-800 text-white p-3 hover:bg-slate-700">
            <RefreshCw size={20} className={loadingWebinars ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="admin-page-content">
        {error ? (
          <div className="premium-card p-5 text-center min-vh-50 flex flex-col justify-center items-center border-rose-500/20">
             <AlertCircle size={60} className="text-rose-500 mb-4 mx-auto" />
             <h3 className="fs-3 fw-bold mb-3">Sync Error</h3>
             <p className="text-slate-400 mb-5">{error}</p>
             <button onClick={fetchWebinars} className="btn-admin-primary px-5 py-3 d-flex items-center gap-2 mx-auto">
               <RefreshCw size={18} /> Retry Connection
             </button>
          </div>
        ) : (
          <div className="row g-5">
            <div className="col-lg-5">
              <div className="premium-card mb-4 bg-gradient-to-br from-slate-900 to-slate-950">
                <h3 className="card-title-admin mb-4 d-flex align-items-center gap-3 fs-5">
                  <div className="p-2 bg-violet-600 rounded-lg"><Search size={22} className="text-white" /></div>
                   Select Webinar
                </h3>
                
                <div className="premium-form-group">
                  <label className="premium-label">Select Source Webinar</label>
                  <div className="relative">
                    {loadingWebinars ? (
                      <div className="skeleton h-12 w-full rounded-xl"></div>
                    ) : (
                      <select 
                        className="premium-input d-block w-full appearance-none bg-slate-800" 
                        value={selectedWebinarId}
                        onChange={(e) => setSelectedWebinarId(e.target.value)}
                      >
                        <option value="">-- Select Completed Webinar --</option>
                        {webinars.map(w => (
                          <option key={w?.id} value={w?.id}>{w?.title} ({w?.dateTime ? new Date(w.dateTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'TBD'})</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {selectedWebinarId && (
                <div className="premium-card animate-fade-in bg-gradient-to-br from-violet-900/20 to-transparent border-violet-500/30">
                  <h3 className="card-title-admin mb-4 d-flex align-items-center gap-3 fs-5">
                    <div className="p-2 bg-emerald-600 rounded-lg"><FileUp size={22} className="text-white" /></div>
                     Upload Resource
                  </h3>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="premium-form-group">
                      <label className="premium-label">Resource Title</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Protocol Documentation"
                        className="premium-input bg-slate-800 border-slate-700" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                      />
                    </div>
                    
                    <div className="row">
                        <div className="col-md-6 mb-3">
                        <label className="premium-label">Data Type</label>
                        <select 
                            className="premium-input bg-slate-800 border-slate-700 w-full"
                            value={formData.fileType}
                            onChange={(e) => setFormData({...formData, fileType: e.target.value})}
                        >
                            <option value="PDF">PDF</option>
                            <option value="SLIDE">SLIDES</option>
                            <option value="VIDEO">VIDEO</option>
                            <option value="LINK">EXTERNAL URL</option>
                        </select>
                        </div>
                        <div className="col-md-6 mb-3">
                        <label className="premium-label">File URL</label>
                        <input 
                            type="url" 
                            required 
                            className="premium-input bg-slate-800 border-slate-700 h-100" 
                            value={formData.fileUrl}
                            onChange={(e) => setFormData({...formData, fileUrl: e.target.value})}
                        />
                        </div>
                    </div>

                    <div className="premium-form-group mt-2">
                        <label className="premium-label">Description (Optional)</label>
                        <textarea 
                            rows="3" 
                            className="premium-input bg-slate-800 border-slate-700" 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>
                    <button type="submit" disabled={saving} className="btn-admin-primary w-100 py-3 mt-2 d-flex align-items-center justify-content-center gap-2">
                        {saving ? <div className="spinner-border spinner-border-sm"></div> : <><Plus size={20} /> Upload Resource</>}
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="col-lg-7">
              <div className="premium-card min-vh-75 h-100 border-dashed border-slate-800 bg-transparent flex flex-col">
                <h3 className="card-title-admin mb-4 d-flex align-items-center gap-3 fs-5">
                  <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Layers size={22} /></div>
                   Resources
                </h3>
                
                {!selectedWebinarId ? (
                  <div className="flex-1 d-flex flex-column items-center justify-center text-center p-5 opacity-40">
                    <div className="p-5 bg-slate-900 rounded-full mb-4 border border-slate-800">
                      <Layout size={64} className="text-slate-500" />
                    </div>
                    <h4 className="text-xl font-bold">No Webinar Selected</h4>
                    <p className="max-w-sm">Select a completed session on the left to manage its resources.</p>
                  </div>
                ) : loadingResources ? (
                  <div className="p-4 d-flex flex-grow-1 flex-col justify-center items-center">
                    <div className="spinner-border text-violet-500 w-12 h-12 mb-3"></div>
                    <span className="text-slate-400">Decrypting assets...</span>
                  </div>
                ) : resources.length > 0 ? (
                  <div className="resource-list-premium d-flex flex-column gap-3 overflow-y-auto pr-2 custom-scrollbar">
                    {resources.map(res => (
                      <div key={res?.id} className="resource-tile-admin d-flex justify-content-between align-items-center p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/50 transition-all">
                        <div className="d-flex align-items-center gap-4">
                          <div className={`resource-glyph-box ${res?.fileType?.toLowerCase()}`}>
                            {getResourceTypeIcon(res?.fileType)}
                          </div>
                          <div className="d-flex flex-column">
                            <span className="fw-bold text-white fs-5">{res?.title || 'Void Asset'}</span>
                            <span className="small text-slate-500 d-flex gap-1 items-center mt-1">
                              <Calendar size={12} /> {res?.fileType} • Active
                            </span>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <a href={res?.fileUrl} target="_blank" rel="noreferrer" className="nav-icon-btn border hover:bg-violet-600/20" title="Access">
                            <ExternalLink size={18} />
                          </a>
                          <button onClick={() => handleDelete(res?.id)} className="nav-icon-btn border text-rose-500 hover:bg-rose-600 hover:text-white" title="Purge">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 d-flex flex-column items-center justify-center text-center p-5 opacity-40">
                     <AlertCircle size={40} className="mb-3" />
                     <p className="fs-5 font-bold">No Resources Yet</p>
                     <p className="small">Upload resources using the form on the left.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .min-vh-75 { min-height: 75vh; }
        .resource-glyph-box { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
        .resource-glyph-box.pdf { background: rgba(244, 63, 94, 0.1); color: #fb7185; }
        .resource-glyph-box.slide { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }
        .resource-glyph-box.video { background: rgba(139, 92, 246, 0.1); color: #a78bfa; }
        .resource-glyph-box.link { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
        .resource-tile-admin:hover { transform: scale(1.01); background: #131b2e; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .spinner-border { width: 3rem; height: 3rem; border-width: 0.3em; border-right-color: transparent !important; }
      `}</style>
    </div>
  );
};

export default AdminResources;
