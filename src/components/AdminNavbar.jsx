import { Search, Bell, Menu, User, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminNavbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  return (
    <header className="admin-top-nav">
      <div className="nav-left d-flex align-items-center gap-3">
        <button onClick={toggleSidebar} className="nav-icon-btn d-lg-none">
          <Menu size={24} />
        </button>
        <div className="nav-search d-none d-md-block">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search resources, users..." 
            className="search-input" 
          />
        </div>
      </div>

      <div className="nav-right nav-actions">
        {/* Notification Bell */}
        <button className="nav-icon-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        {/* Global Settings */}
        <button className="nav-icon-btn d-none d-sm-flex" onClick={() => navigate('/admin/settings')}>
          <Settings size={20} />
        </button>

        <div className="nav-divider border-l border-slate-800 h-8 mx-2 opacity-50"></div>

        {/* Admin Profile Dropdown - Simple for now */}
        <div className="profile-wrapper position-relative">
          <button className="admin-profile-btn d-flex align-items-center gap-2">
            <div className="admin-avatar-sm">
              {user?.name?.charAt(0) || <User size={16} />}
            </div>
            <div className="admin-info d-none d-lg-block text-start">
              <span className="user-name d-block fw-bold fs-6">{user?.name}</span>
              <span className="user-role d-block small opacity-60">Administrator</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
