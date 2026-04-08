import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import '../pages/Admin.css';

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Auto-close sidebar on mobile after navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="loading-screen bg-slate-950 flex flex-col items-center justify-center min-h-screen">
        <div className="spinner border-4 border-slate-800 border-t-violet-500 rounded-full w-12 h-12 mb-4 animate-spin"></div>
        <span className="text-slate-400 font-medium">Verifying Credentials...</span>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/admin-login" replace />;
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="admin-layout-container">
      {/* Sidebar - Position: Fixed */}
      <div className={`admin-sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
        <AdminSidebar />
      </div>

      {/* Main Content Viewport */}
      <div className="admin-main-wrapper flex-1 ml-[var(--admin-sidebar-width)] overflow-x-hidden min-h-screen">
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-50">
          <AdminNavbar toggleSidebar={toggleSidebar} />
        </div>

        {/* Page Content Rendering */}
        <main className="admin-page-content-wrapper p-4 p-md-5">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="admin-sidebar-overlay bg-black bg-opacity-60 backdrop-blur-sm fixed inset-0 z-40 d-lg-none"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <style>{`
        .admin-sidebar-wrapper {
          width: var(--admin-sidebar-width);
          transition: transform 0.3s ease-in-out;
          z-index: 100;
        }

        @media (max-width: 1024px) {
          .admin-sidebar-wrapper {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
          }
          .admin-sidebar-wrapper.open {
            transform: translateX(0);
          }
          .admin-main-wrapper {
             margin-left: 0 !important;
          }
        }

        /* Skeleton-like Loading State */
        .loading-screen {
          background: #020617;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }

        /* Animation utilities */
        .animate-fade-in {
          animation: adminFadeIn 0.5s ease-out forwards;
        }

        @keyframes adminFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
