import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Video, 
  FileText, 
  Users, 
  ShieldCheck,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const { logout } = useAuth();

  const menuItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { title: 'Webinars', icon: <Video size={20} />, path: '/admin/webinars' },
    { title: 'Resources', icon: <FileText size={20} />, path: '/admin/resources' },
    { title: 'Users', icon: <Users size={20} />, path: '/admin/users' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <ShieldCheck size={28} color="#a78bfa" strokeWidth={2.5} />
        </div>
        <span className="sidebar-logo-text">LearnHub</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            end={item.path === '/admin'}
            className={({isActive}) => isActive ? 'sidebar-link active' : 'sidebar-link'}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-title">{item.title}</span>
            <ChevronRight className="sidebar-chevron ms-auto" size={14} />
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="sidebar-link w-100 border-0 bg-transparent text-start">
          <span className="sidebar-link-icon text-rose-500"><LogOut size={20} /></span>
          <span className="sidebar-link-title">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
