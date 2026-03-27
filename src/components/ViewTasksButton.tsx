import React from 'react';
import { FaEye, FaList, FaSpinner, FaExclamationCircle } from 'react-icons/fa';
import './ViewTasksButton.css';

// Tipos do componente
interface ViewTasksButtonProps {
  /** Função callback quando o botão é clicado */
  onClick: () => void;
  /** Variant do botão: 'primary' (destacado) ou 'secondary' (menos chamativo) */
  variant?: 'primary' | 'secondary';
  /** Se true, mostra contador de tarefas pendentes */
  showCount?: boolean;
  /** Número total de tarefas para o contador */
  tasksCount?: number;
  /** Se true, mostra loader no lugar do botão */
  loading?: boolean;
  /** Se true, mostra estado de erro */
  error?: boolean;
  /** Label customizado do botão */
  label?: string;
  /** Desabilita o botão */
  disabled?: boolean;
  /** ClasaName extra para customização adicional */
  className?: string;
  /** ARIA label para acessibilidade */
  ariaLabel?: string;
}

/**
 * ViewTasksButton
 * 
 * Componente de botão chamativo para navegación à visualização de tarefas.
 * Projetado para substituir botões pequenos e pouco visíveis.
 * 
 * @AGENT-NOTE: Este componente foi criado seguindo o plano do Arquiteto Baltazar.
 * O objetivo é oferecer uma CTA (Call to Action) mais clara e acessível.
 * - Usa cores brand (azul) para destaque
 * - Suporta estados: loading, error, disabled
 * - Badge opcional com contador
 * - Acessível (ARIA labels, keyboard navigation)
 * - Animado com transições suaves (hover, active)
 */
const ViewTasksButton: React.FC<ViewTasksButtonProps> = ({
  onClick,
  variant = 'primary',
  showCount = false,
  tasksCount,
  loading = false,
  error = false,
  label,
  disabled = false,
  className = '',
  ariaLabel = 'Visualizar Tarefas'
}) => {
  // Label padrão
  const buttonLabel = label || '📋 Visualizar Tarefas';

  // Badge com contador
  const renderBadge = () => {
    if (!showCount || tasksCount === undefined || tasksCount === null) return null;

    return (
      <span className="view-tasks-badge" aria-label={`${tasksCount} tarefas pendentes`}>
        {tasksCount}
      </span>
    );
  };

  // Ícones por estado
  const renderIcon = () => {
    if (loading) return <FaSpinner className="loading-spinner" spin />;
    if (error) return <FaExclamationCircle size={16} />;
    return <FaEye size={18} />;
  };

  const baseClasses = 'view-tasks-button';
  const variantClasses = variant === 'primary' ? 'view-tasks-button--primary' : 'view-tasks-button--secondary';
  const stateClasses = disabled 
    ? ' view-tasks-button--disabled' 
    : error 
      ? ' view-tasks-button--error' 
      : '';
  const classNameWithState = `${baseClasses} ${variantClasses}${stateClasses}${className}`;

  return (
    <button
      type="button"
      className={classNameWithState.trim()}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-disabled={disabled}
    >
      <span className="view-tasks-button-content">
        <span className="view-tasks-button-icon-container">
          {renderIcon()}
        </span>
        <span className="view-tasks-button-text" aria-hidden="true">
          {buttonLabel}
        </span>
        {renderBadge()}
      </span>
    </button>
  );
};

export default ViewTasksButton;
