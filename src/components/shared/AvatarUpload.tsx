import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { FaUpload, FaTimes, FaUser } from 'react-icons/fa';
import { getAvatarUrl } from '../../utils/avatarUrl';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarChange: (file: File | null, avatarUrl: string) => void;
  userId?: string;
  disabled?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  onAvatarChange,
  userId,
  disabled = false
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when currentAvatarUrl changes
  useEffect(() => {
    if (currentAvatarUrl) {
      // Use getAvatarUrl to ensure we have the correct URL
      setPreviewUrl(getAvatarUrl(currentAvatarUrl));
    } else {
      setPreviewUrl(null);
    }
  }, [currentAvatarUrl]);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Formato de arquivo inválido. Use JPEG, PNG, GIF ou WebP.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Tamanho máximo: 5MB.');
      return;
    }

    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      onAvatarChange(file, result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onAvatarChange(null, '');
    setError(null);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      width: '100%'
    }}>
      {/* Avatar Preview */}
      <div style={{
        position: 'relative',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid var(--bg-input)',
        backgroundColor: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Avatar preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <FaUser size={48} color="var(--text-secondary)" />
        )}
        
        {/* Remove button */}
        {previewUrl && !disabled && (
          <button
            onClick={handleRemoveAvatar}
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              border: 'none',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            type="button"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Upload Button */}
      <div style={{ width: '100%' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          style={{ display: 'none' }}
          disabled={disabled}
        />
        
        <button
          onClick={handleButtonClick}
          type="button"
          disabled={disabled || isUploading}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: disabled ? 'var(--bg-input)' : 'var(--accent-color)',
            color: disabled ? 'var(--text-secondary)' : 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!disabled && !isUploading) {
              e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && !isUploading) {
              e.currentTarget.style.backgroundColor = 'var(--accent-color)';
            }
          }}
        >
          {isUploading ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <FaUpload />
              <span>{previewUrl ? 'Alterar Avatar' : 'Escolher Avatar'}</span>
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          width: '100%',
          padding: '12px',
          backgroundColor: 'var(--border-color)',
          border: '1px solid var(--danger-color)',
          borderRadius: '6px',
          color: 'var(--danger-color)',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Help Text */}
      <div style={{
        fontSize: '12px',
        color: 'var(--text-secondary)',
        textAlign: 'center',
        lineHeight: '1.4'
      }}>
        Formatos suportados: JPEG, PNG, GIF, WebP
        <br />
        Tamanho máximo: 5MB
      </div>

      {/* CSS for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AvatarUpload;