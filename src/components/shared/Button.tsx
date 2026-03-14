import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    borderRadius: '8px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    width: fullWidth ? '100%' : 'auto',
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--accent-color)',
      color: '#fff',
      border: 'none',
      hoverBackgroundColor: 'var(--accent-hover)',
      activeBackgroundColor: 'var(--accent-color)',
    },
    secondary: {
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      border: 'none',
      hoverBackgroundColor: 'var(--bg-input)',
      activeBackgroundColor: 'var(--border-color)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--accent-color)',
      border: '1px solid var(--accent-color)',
      hoverBackgroundColor: 'rgba(74, 144, 226, 0.1)',
      activeBackgroundColor: 'rgba(74, 144, 226, 0.2)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent',
      hoverBackgroundColor: 'var(--bg-input)',
      activeBackgroundColor: 'var(--border-color)',
    },
    danger: {
      backgroundColor: 'var(--danger-color)',
      color: '#fff',
      border: 'none',
      hoverBackgroundColor: '#e03e2e',
      activeBackgroundColor: '#c92c1c',
    },
  };

  const sizeStyles = {
    sm: {
      padding: '8px 16px',
      fontSize: '13px',
      height: '32px',
    },
    md: {
      padding: '12px 24px',
      fontSize: '14px',
      height: '40px',
    },
    lg: {
      padding: '16px 32px',
      fontSize: '16px',
      height: '48px',
    },
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{
        ...baseStyles,
        ...currentSize,
        backgroundColor: currentVariant.backgroundColor,
        color: currentVariant.color,
        border: currentVariant.border,
        opacity: disabled || loading ? 0.6 : 1,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = currentVariant.hoverBackgroundColor;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = currentVariant.backgroundColor;
        }
      }}
      onMouseDown={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = currentVariant.activeBackgroundColor;
        }
      }}
      onMouseUp={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = currentVariant.hoverBackgroundColor;
        }
      }}
    >
      {loading ? (
        <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
      ) : (
        icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
      )}
      {children}
    </button>
  );
};

export default Button;