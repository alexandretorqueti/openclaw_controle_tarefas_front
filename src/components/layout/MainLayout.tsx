import React, { useState, ReactNode } from 'react';
import { 
  FaTasks, 
  FaFolder, 
  FaSync, 
  FaTerminal, 
  FaExclamationTriangle, 
  FaRobot, 
  FaCog, 
  FaListAlt, 
  FaFlag, 
  FaUser, 
  FaProjectDiagram,
  FaBars,
  FaTimes,
  FaHome,
  FaSignOutAlt, FaChevronLeft, FaChevronRight,
  FaLayerGroup
} from 'react-icons/fa';

interface MainLayoutProps {
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  onOpenStatus: () => void;
  onOpenPriority: () => void;
  onOpenUser: () => void;
  onOpenProjectType: () => void;
  onOpenNextTask: () => void;
  onOpenAgents: () => void;
  onOpenErrorLogs: () => void;
  onLogout: () => void;
  user?: { name: string; email: string; avatarUrl?: string };
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  currentView,
  onViewChange,
  onOpenStatus,
  onOpenPriority,
  onOpenUser,
  onOpenProjectType,
  onOpenNextTask,
  onOpenAgents,
  onOpenErrorLogs,
  onLogout,
  user
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainViews = [
    { id: 'projects', label: 'Projetos', icon: <FaFolder size={16} /> },
    { id: 'tasks', label: 'Tarefas', icon: <FaTasks size={16} /> },
    { id: 'recurrence', label: 'Recorrência', icon: <FaSync size={16} /> },
    { id: 'logs', label: 'Logs', icon: <FaTerminal size={16} /> },
    { id: 'error-logs', label: 'Logs de Erro', icon: <FaExclamationTriangle size={16} /> },
    { id: 'agents', label: 'Agentes', icon: <FaRobot size={16} /> },
  ];

  const managementViews = [
    { id: 'status', label: 'Status', icon: <FaListAlt size={16} />, action: onOpenStatus },
    { id: 'priority', label: 'Prioridades', icon: <FaFlag size={16} />, action: onOpenPriority },
    { id: 'users', label: 'Usuários', icon: <FaUser size={16} />, action: onOpenUser },
    { id: 'project-types', label: 'Tipos de Projeto', icon: <FaProjectDiagram size={16} />, action: onOpenProjectType },
    { id: 'next-task', label: 'Próximas Tarefas', icon: <FaTasks size={16} />, action: onOpenNextTask },
    { id: 'stages', label: 'Etapas', icon: <FaLayerGroup size={16} />, action: () => onViewChange('stages') },
  ];

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
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              style={{
                padding: '10px 16px',
                backgroundColor: currentView === view.id ? 'var(--accent-color)' : 'transparent',
                color: currentView === view.id ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                fontWeight: 500,
                whiteSpace: 'nowrap'
              }}
            >
              {view.icon}
              {view.label}
            </button>
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
            onClick={onLogout}
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
              <button
                key={item.id}
                onClick={item.action}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '4px',
                  transition: 'all 0.2s',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
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
              </button>
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
              <button
                key={view.id}
                onClick={() => {
                  onViewChange(view.id);
                  setMobileOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: currentView === view.id ? 'var(--bg-input)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '4px',
                  transition: 'all 0.2s',
                  color: currentView === view.id ? 'var(--accent-color)' : 'var(--text-primary)',
                  textDecoration: 'none'
                }}
              >
                {view.icon}
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                  {view.label}
                </span>
              </button>
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
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  setMobileOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '4px',
                  transition: 'all 0.2s',
                  color: 'var(--text-primary)',
                  textDecoration: 'none'
                }}
              >
                {item.icon}
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                  {item.label}
                </span>
              </button>
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
          {children}
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