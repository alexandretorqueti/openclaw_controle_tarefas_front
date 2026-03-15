import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  variant?: 'default' | 'outline' | 'filled';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon,
  actions,
  variant = 'default',
  hover = false,
  padding = 'md',
  className = '',
}) => {
  const paddingClasses = {
    none: '0',
    sm: '16px',
    md: '24px',
    lg: '32px',
  };

  const variantStyles = {
    default: {
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    },
    outline: {
      backgroundColor: 'transparent',
      border: '1px solid var(--border-color)',
      boxShadow: 'none',
    },
    filled: {
      backgroundColor: 'var(--bg-input)',
      border: '1px solid var(--border-color)',
      boxShadow: 'none',
    },
  };

  return (
    <div
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        transition: hover ? 'all 0.3s ease' : 'none',
        ...variantStyles[variant],
      }}
      className={className}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow;
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {(title || icon || actions) && (
        <div
          style={{
            padding: `${paddingClasses[padding]} ${paddingClasses[padding]} 0 ${paddingClasses[padding]}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {icon && (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-input)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-color)',
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {title}
                </h3>
              )}
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
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div
        style={{
          padding: paddingClasses[padding],
          paddingTop: title || icon || actions ? '16px' : paddingClasses[padding],
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Card;