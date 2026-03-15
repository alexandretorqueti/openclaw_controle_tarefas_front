import React, { ReactNode } from 'react';
import { FaTimes } from 'react-icons/fa';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  footer?: ReactNode;
  hideFooter?: boolean;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  onSubmit,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  size = 'md',
  loading = false,
  footer,
  hideFooter = false,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px',
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: size === 'sm' ? '400px' : size === 'md' ? '600px' : size === 'lg' ? '800px' : '1200px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            backgroundColor: 'white',
            borderBottom: '1px solid var(--text-primary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#333',
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  margin: '4px 0 0',
                  lineHeight: 1.5,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-card)';
              e.currentTarget.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            aria-label="Fechar"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
          }}
        >
          {onSubmit ? (
            <form
              id="form-modal"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit(e);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              {children}
            </form>
          ) : (
            children
          )}
        </div>

        {/* Footer */}
        {!hideFooter && (
          <div
            style={{
              padding: '20px 24px',
              backgroundColor: 'var(--bg-card)',
              borderTop: '1px solid var(--text-primary)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
            }}
          >
            {footer ? (
              footer
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minWidth: '80px',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                      e.currentTarget.style.borderColor = 'var(--text-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }
                  }}
                >
                  {cancelLabel}
                </button>
                {/* @ts-ignore */}
                {onSubmit && (
                  <button
                    type="submit"
                    form='form-modal'
                    disabled={loading}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: loading ? 'var(--text-secondary)ccc' : 'var(--accent-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      minWidth: '80px',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.backgroundColor = 'var(--accent-color)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.backgroundColor = 'var(--accent-color)';
                      }
                    }}
                  >
                    {submitLabel}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormModal;