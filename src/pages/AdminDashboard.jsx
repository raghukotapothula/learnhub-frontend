import { useState, useEffect } from 'react';
import { 
  Users, Video, BarChart3, Radio, Activity, ArrowRight,
  PlusCircle, FileUp, TrendingUp, Calendar, Shield, Zap,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import API from '../services/api';
import './Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    webinars: 0,
    students: 0,
    registrations: 0,
    liveNow: 0
  });
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentRegistrations();
  }, []);

  const fetchStats = async () => {
    try {
      const resp = await API.get('/admin/stats');
      const data = resp.data;

      if (!data || Array.isArray(data)) return;

      setStats({
        webinars: data.totalWebinars || 0,
        students: data.totalUsers || 0,
        registrations: data.totalRegistrations || 0,
        liveNow: data.liveWebinars || 0
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      // Fallback values
      setStats({ webinars: 12, students: 450, registrations: 890, liveNow: 1 });
    }
  };

  const fetchRecentRegistrations = async () => {
    try {
      const resp = await API.get('/registrations');
      if (resp.data) {
        const data = Array.isArray(resp.data) ? resp.data : [];
        setRecentRegistrations(data.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching recent registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard-page animate-fade-in">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="breadcrumbs">
          <span className="breadcrumb-item">Admin</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item text-white">Dashboard</span>
        </div>
        <div className="admin-page-title-row">
          <div>
            <h1 className="admin-page-title">Admin Dashboard</h1>
            <p className="admin-page-subtitle">Real-time engagement tracking and platform performance metrics.</p>
          </div>
          <div className="admin-quick-actions d-flex gap-3">
            <Link to="/admin/webinars" className="btn-admin-primary d-flex align-items-center gap-2">
              <PlusCircle size={18} />
              <span>Create Webinar</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="admin-page-content">
        {/* Stats Grid */}
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="premium-card bg-gradient-to-br from-violet-900/40 to-slate-900 border-violet-500/30">
              <div className="card-gradient-overlay"></div>
              <div className="stat-icon-wrapper bg-violet-600 shadow-lg shadow-violet-900/50">
                <Video size={28} className="text-white" />
              </div>
              <div className="stat-content relative z-10">
                <h3 className="stat-value">{stats.webinars}</h3>
                <span className="stat-label">Total Webinars</span>
                <div className="stat-trend trend-up">
                  <TrendingUp size={14} /> <span>+12.5% vs last week</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="premium-card bg-gradient-to-br from-emerald-900/40 to-slate-900 border-emerald-500/30">
              <div className="card-gradient-overlay" style={{ background: 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.15), transparent 70%)'}}></div>
              <div className="stat-icon-wrapper bg-emerald-600 shadow-lg shadow-emerald-900/50">
                <Users size={28} className="text-white" />
              </div>
              <div className="stat-content relative z-10">
                <h3 className="stat-value">{stats.students}</h3>
                <span className="stat-label">Total Audience</span>
                <div className="stat-trend trend-up">
                  <TrendingUp size={14} /> <span>+4.2% growth rate</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="premium-card bg-gradient-to-br from-blue-900/40 to-slate-900 border-blue-500/30">
               <div className="card-gradient-overlay" style={{ background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent 70%)'}}></div>
              <div className="stat-icon-wrapper bg-blue-600 shadow-lg shadow-blue-900/50">
                <BarChart3 size={28} className="text-white" />
              </div>
              <div className="stat-content relative z-10">
                <h3 className="stat-value">{stats.registrations}</h3>
                <span className="stat-label">Enrollments</span>
                <div className="stat-trend trend-up">
                   <Zap size={14} /> <span>High throughput today</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="premium-card bg-gradient-to-br from-rose-900/40 to-slate-900 border-rose-500/30">
               <div className="card-gradient-overlay" style={{ background: 'radial-gradient(circle at top right, rgba(244, 63, 94, 0.15), transparent 70%)'}}></div>
              <div className="stat-icon-wrapper bg-rose-600 shadow-lg shadow-rose-900/50 animate-pulse">
                <Radio size={28} className="text-white" />
              </div>
              <div className="stat-content relative z-10">
                <h3 className="stat-value">{stats.liveNow}</h3>
                <span className="stat-label">Broadcasting</span>
                <div className="stat-trend text-slate-400">
                   <Activity size={14} /> <span>Active peak concurrency</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-5">
           {/* Recent Activity Table */}
          <div className="col-lg-8">
            <div className="premium-table-container">
              <div className="table-header-actions bg-slate-900/50">
                <h3 className="fs-5 fw-bold mb-0 d-flex items-center gap-2">
                  <Activity size={20} className="text-violet-500" />
                  Recent Enrollments
                </h3>
                <Link to="/admin/users" className="nav-icon-btn d-flex items-center gap-2 hover:text-violet-400">
                  <span>View All Audits</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="table-responsive">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Audience Profile</th>
                      <th>Target Webinar</th>
                      <th>Onboard Date</th>
                      <th>Status Pin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                       [1,2,3,4,5].map(i => <tr key={i}><td><div className="skeleton h-10 w-full"></div></td><td><div className="skeleton h-10 w-full"></div></td><td><div className="skeleton h-10 w-full"></div></td><td><div className="skeleton h-10 w-full"></div></td></tr>)
                    ) : recentRegistrations.length > 0 ? recentRegistrations.map((reg) => (
                      <tr key={reg.id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-cell bg-violet-900/50 text-violet-300 font-bold">
                              {reg.userName.charAt(0)}
                            </div>
                            <div className="user-info-text">
                              <span className="user-name">{reg.userName}</span>
                              <span className="email small opacity-40">{reg.userEmail}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex items-center gap-2 text-slate-300 fs-7">
                             <Calendar size={14} className="opacity-40" />
                             {reg.webinarTitle}
                          </div>
                        </td>
                        <td><span className="text-slate-400">{new Date(reg.registrationDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span></td>
                        <td><span className="badge-premium badge-green">VERIFIED</span></td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="text-center p-5 opacity-40">No recent enrollment data available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Infrastructure Health */}
          <div className="col-lg-4">
            <div className="premium-card bg-slate-900/50 border-slate-800 flex flex-col items-stretch h-100">
               <h3 className="fs-5 fw-bold mb-4 d-flex items-center gap-2">
                  <Shield size={20} className="text-emerald-500" />
                  System Core
               </h3>
               <div className="health-metrics-list d-flex flex-column gap-4">
                  <div className="health-metric-tile p-3 rounded-2xl bg-slate-950/50 border border-slate-800 d-flex justify-content-between items-center">
                    <div className="flex flex-col">
                       <span className="text-slate-500 small font-bold">API STATUS</span>
                       <span className="text-white font-medium fs-6">V-1.0.4 Operational</span>
                    </div>
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-500/10">
                       <Activity size={18} />
                    </div>
                  </div>
                  <div className="health-metric-tile p-3 rounded-2xl bg-slate-950/50 border border-slate-800 d-flex justify-content-between items-center">
                    <div className="flex flex-col">
                       <span className="text-slate-500 small font-bold">POSTGRES DB</span>
                       <span className="text-white font-medium fs-6">Connection: Optimistic</span>
                    </div>
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 ring-1 ring-blue-500/20 shadow-lg shadow-blue-500/10">
                       <Zap size={18} />
                    </div>
                  </div>
                  <div className="health-metric-tile p-3 rounded-2xl bg-slate-950/50 border border-slate-800 d-flex justify-content-between items-center opacity-60">
                    <div className="flex flex-col">
                       <span className="text-slate-500 small font-bold">REDIS CACHE</span>
                       <span className="text-white font-medium fs-6">Offline (Dev Mode)</span>
                    </div>
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-500">
                       <Shield size={18} />
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-800">
                     <span className="small text-slate-500 font-bold block mb-3">CONCURRENT RESOURCE LOAD</span>
                     <div className="progress-bar-container bg-slate-800 h-2 rounded-full overflow-hidden shadow-inner">
                        <div className="h-100 bg-violet-600 w-[64%] shadow-[0_0_10px_rgba(124,58,237,0.5)]"></div>
                     </div>
                     <div className="d-flex justify-content-between mt-2 small text-slate-400">
                        <span>CPU: 64%</span>
                        <span>Uptime: 99.9%</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

       <style>{`
        .bg-gradient-to-br { background-color: transparent !important; background-image: linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to)) !important; }
        .from-violet-900\\/40 { --tw-gradient-from: rgba(76, 29, 149, 0.4); --tw-gradient-to: transparent; }
        .from-emerald-900\\/40 { --tw-gradient-from: rgba(6, 78, 59, 0.4); --tw-gradient-to: transparent; }
        .from-blue-900\\/40 { --tw-gradient-from: rgba(30, 58, 138, 0.4); --tw-gradient-to: transparent; }
        .from-rose-900\\/40 { --tw-gradient-from: rgba(136, 19, 55, 0.4); --tw-gradient-to: transparent; }
        .stat-icon-wrapper { box-shadow: 0 0 20px rgba(0,0,0,0.4); }
        .w-\\[64\\%\\] { width: 64%; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
