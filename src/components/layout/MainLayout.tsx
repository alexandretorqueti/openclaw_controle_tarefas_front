import React, { useState, ReactNode } from 'react';
import { 
  FaTasks, 
  FaFolder, 
  FaSync, 
  FaTerminal, 
  FaExclamationTriangle, 
  FaRobot, 
  FaListAlt, 
  FaFlag, 
  FaUser, 
  FaProjectDiagram,
  FaBars,
  FaTimes,
  FaHome,
  FaSignOutAlt, FaChevronLeft, FaChevronRight,
  FaLayerGroup,
  FaCog
} from 'react-icons/fa';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainViews = [
    { id: 'projects', label: 'Projetos', icon: <FaFolder size={16} />, path: '/projects' },
    { id: 'recurrence', label: 'Recorrência', icon: <FaSync size={16} />, path: '/recurrence' },
    { id: 'logs', label: 'Logs', icon: <FaTerminal size={16} />, path: '/logs' },
    { id: 'error-logs', label: 'Logs de Erro', icon: <FaExclamationTriangle size={16} />, path: '/error-logs' },
    { id: 'agents', label: 'Agentes', icon: <FaRobot size={16} />, path: '/agents' },
  ];

  const managementViews = [
    { id: 'status', label: 'Status', icon: <FaListAlt size={16} />, path: '/status' },
    { id: 'priority', label: 'Prioridades', icon: <FaFlag size={16} />, path: '/priorities' },
    { id: 'users', label: 'Usuários', icon: <FaUser size={16} />, path: '/users' },
    { id: 'project-types', label: 'Tipos de Projeto', icon: <FaProjectDiagram size={16} />, path: '/project-types' },
    { id: 'next-task', label: 'Próximas Tarefas', icon: <FaTasks size={16} />, path: '/next-task' },
    { id: 'stages', label: 'Etapas', icon: <FaLayerGroup size={16} />, path: '/stages' },
    { id: 'profile', label: 'Meu Perfil', icon: <FaCog size={16} />, path: '/profile' },
  ];

  // Determinar se um link está ativo (inclui rotas aninhadas)
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px'
      }}>
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '6px',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            marginRight: '16px'
          }}
          aria-label="Toggle menu"
        >
          <FaBars size={20} color="var(--text-primary)" />
        </button>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'var(--accent-color)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FaHome size={16} color="white" />
          </div>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.3px',
            margin: 0
          }}>
            Sistema de Gestão
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav style={{
          display: 'flex',
          marginLeft: '40px',
          gap: '8px'
        }}>
          {mainViews.map(view => (
            <Link
              key={view.id}
              to={view.path}
              style={{
                padding: '10px 16px',
                backgroundColor: isActive(view.path) ? 'var(--accent-color)' : 'transparent',
                color: isActive(view.path) ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                textDecoration: 'none'
              }}
            >
              {view.icon}
              {view.label}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--text-primary)',
                backgroundImage: user.avatarUrl ? `url(${user.avatarUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {user.name}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {user.email}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <FaSignOutAlt size={14} />
            Sair
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar - Desktop */}
        <aside style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          width: sidebarOpen ? '280px' : '80px',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 0',
          flexShrink: 0
        }}>
          {/* Sidebar Toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '0 24px 16px',
            borderBottom: '1px solid var(--text-primary)',
            marginBottom: '16px'
          }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--border-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-input)';
              }}
              aria-label={sidebarOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
            >
              {sidebarOpen ? <FaChevronLeft size={16} color="var(--text-secondary)" /> : <FaChevronRight size={16} color="var(--text-secondary)" />}
            </button>
          </div>

          {/* Management Section */}
          <div style={{ padding: '0 16px' }}>
            <h3 style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px',
              padding: '0 8px',
              opacity: sidebarOpen ? 1 : 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}>
              Gerenciamento
            </h3>
            {managementViews.map(item => (
              <Link
                key={item.id}
                to={item.path}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: isActive(item.path) ? 'var(--bg-input)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '4px',
                  transition: 'all 0.2s',
                  color: isActive(item.path) ? 'var(--accent-color)' : 'var(--text-primary)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  {item.icon}
                </div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  opacity: sidebarOpen ? 1 : 0,
                  transition: 'opacity 0.3s',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 999
            }}
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <aside style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          bottom: 0,
          width: '280px',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          zIndex: 1000,
          overflowY: 'auto',
          display: 'none',
          flexDirection: 'column',
          padding: '24px 0'
        }}>
          <div style={{ padding: '0 16px' }}>
            <h3 style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px',
              padding: '0 8px'
            }}>
              Navegação
            </h3>
            {mainViews.map(view => (
              <Link
                key={view.id}
                to={view.path}
                onClick={() => setMobileOpen(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: isActive(view.path) ? 'var(--bg-input)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '4px',
                  transition: 'all 0.2s',
                  color: isActive(view.path) ? 'var(--accent-color)' : 'var(--text-primary)',
                  textDecoration: 'none'
                }}
              >
                {view.icon}
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                  {view.label}
                </span>
              </Link>
            ))}

            <h3 style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginTop: '24px',
              marginBottom: '12px',
              padding: '0 8px'
            }}>
              Gerenciamento
            </h3>
            {managementViews.map(item => (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: isActive(item.path) ? 'var(--bg-input)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '4px',
                  transition: 'all 0.2s',
                  color: isActive(item.path) ? 'var(--accent-color)' : 'var(--text-primary)',
                  textDecoration: 'none'
                }}
              >
                {item.icon}
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          maxWidth: '100%'
        }}>
          <Outlet /> {/* Renderiza o conteúdo da rota filha */}
        </main>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          header nav {
            display: none !important;
          }
          header button[aria-label="Toggle menu"] {
            display: flex !important;
          }
          aside:first-of-type {
            display: none !important;
          }
        }
        @media (min-width: 769px) {
          aside:last-of-type {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;