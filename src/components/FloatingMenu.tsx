import React, { useState } from 'react';
import { FaCog, FaListAlt, FaFlag, FaTimes, FaBars, FaUser } from 'react-icons/fa';

interface FloatingMenuProps {
  onOpenStatus: () => void;
  onOpenPriority: () => void;
  onOpenUser: () => void;
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({ onOpenStatus, onOpenPriority }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Ícone do menu - sempre visível */}
      <div
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: isHovered ? '#3DB8AC' : '#4ECDC4',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative',
          zIndex: 1001
        }}
        onMouseEnter={() => {
          setIsHovered(true);
          setIsOpen(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          // Não fechar imediatamente para permitir interação com o menu
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <FaTimes size={20} color="#fff" />
        ) : (
          <FaBars size={20} color="#fff" />
        )}
      </div>

      {/* Menu flutuante */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '50px',
            left: 0,
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            minWidth: '220px',
            zIndex: 1000,
            overflow: 'hidden',
            border: '1px solid #e0e0e0'
          }}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
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
              width: '32px',
              height: '32px',
              backgroundColor: '#4ECDC4',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaCog size={16} color="#fff" />
            </div>
            <div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                margin: 0
              }}>
                Configurações
              </h3>
              <p style={{
                fontSize: '12px',
                color: '#666',
                margin: '4px 0 0 0'
              }}>
                Gerencie status e prioridades
              </p>
            </div>
          </div>

          {/* Opções do menu */}
          <div style={{ padding: '8px 0' }}>
            {/* Opção STATUS */}
            <button
              onClick={() => {
                onOpenStatus();
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f9ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#E3F2FD',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaListAlt size={18} color="#1976D2" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: '2px'
                }}>
                  Status
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666'
                }}>
                  Gerencie os status das tarefas
                </div>
              </div>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#4ECDC4',
                borderRadius: '50%'
              }} />
            </button>

            {/* Separador */}
            <div style={{
              height: '1px',
              backgroundColor: '#f0f0f0',
              margin: '4px 16px'
            }} />

            {/* Opção PRIORIDADES */}
            <button
              onClick={() => {
                onOpenPriority();
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f9ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#FFF3E0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaFlag size={18} color="#F57C00" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: '2px'
                }}>
                  Prioridades
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666'
                }}>
                  Gerencie os níveis de prioridade
                </div>
              </div>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#FFB74D',
                borderRadius: '50%'
              }} />
            </button>

            {/* Separador */}
            <div style={{
              height: '1px',
              backgroundColor: '#f0f0f0',
              margin: '4px 16px'
            }} />

            {/* Opção USUÁRIOS */}
            <button
              onClick={() => {
                onOpenUser();
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f9ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#F3E5F5',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaUser size={18} color="#9D4EDD" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: '2px'
                }}>
                  Usuários
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666'
                }}>
                  Gerencie os usuários do sistema
                </div>
              </div>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#9D4EDD',
                borderRadius: '50%'
              }} />
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
            Passe o mouse sobre o ícone para abrir
          </div>
        </div>
      )}

      {/* Overlay escuro quando menu está aberto (para mobile/tablet) */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.1)',
            zIndex: 999
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default FloatingMenu;