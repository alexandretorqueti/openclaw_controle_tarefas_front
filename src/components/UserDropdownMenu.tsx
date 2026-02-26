import React, { useState, useRef, useEffect } from 'react';
import { FaUser, FaEdit, FaSignOutAlt, FaCog, FaTimes, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

interface UserDropdownMenuProps {
  onLogout: () => void;
  onEditProfile: () => void;
}

const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({ onLogout, onEditProfile }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Botão do usuário */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 12px',
          backgroundColor: isOpen ? '#f8f9fa' : 'transparent',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          border: isOpen ? '1px solid #e0e0e0' : '1px solid transparent',
          minWidth: '200px'
        }}
        onClick={toggleDropdown}
        onMouseEnter={() => !isOpen && (document.body.style.cursor = 'pointer')}
        onMouseLeave={() => document.body.style.cursor = 'default'}
      >
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: '#e3f2fd',
          flexShrink: 0
        }}>
          <img
            src={user?.avatarUrl || 'https://i.pravatar.cc/150?img=1'}
            alt={user?.name || 'Usuário'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          flex: 1,
          minWidth: 0
        }}>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: 500, 
            color: '#333',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {user?.name || 'Usuário'}
          </span>
          <span style={{ 
            fontSize: '12px', 
            color: '#666',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {user?.role || 'Usuário'}
          </span>
        </div>
        
        <FaChevronDown 
          size={12} 
          color="#666" 
          style={{ 
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }} 
        />
      </div>

      {/* Menu suspenso */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          minWidth: '220px',
          zIndex: 1000,
          overflow: 'hidden',
          border: '1px solid #e0e0e0',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Cabeçalho do menu */}
          <div style={{
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#e3f2fd',
              flexShrink: 0
            }}>
              <img
                src={user?.avatarUrl || 'https://i.pravatar.cc/150?img=1'}
                alt={user?.name || 'Usuário'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.name || 'Usuário'}
              </h3>
              <p style={{
                fontSize: '12px',
                color: '#666',
                margin: '4px 0 0 0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.email || 'Sem email'}
              </p>
            </div>
          </div>

          {/* Itens do menu */}
          <div style={{ padding: '8px 0' }}>
            <button
              onClick={() => {
                onEditProfile();
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#333',
                textAlign: 'left',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{
                width: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <FaEdit size={14} color="#4ECDC4" />
              </div>
              <span>Alterar cadastro</span>
            </button>

            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#FF6B6B',
                textAlign: 'left',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{
                width: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <FaSignOutAlt size={14} color="#FF6B6B" />
              </div>
              <span>Sair</span>
            </button>
          </div>

          {/* Rodapé do menu */}
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #e0e0e0',
            fontSize: '11px',
            color: '#999',
            textAlign: 'center'
          }}>
            Sistema de Gestão v1.0
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default UserDropdownMenu;