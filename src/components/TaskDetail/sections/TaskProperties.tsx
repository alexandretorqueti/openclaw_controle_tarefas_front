import React, { useState } from 'react';
import { FaInfoCircle, FaEdit, FaTimes } from 'react-icons/fa';
import axios from 'axios';

interface TaskPropertiesProps {
  currentTask: any;
  relations: any;
}

const TaskProperties: React.FC<TaskPropertiesProps> = ({ currentTask, relations }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    taskCode: '',
    taskName: '',
    taskDescription: '',
    taskStatus: '',
    taskPriority: '',
    project: '',
    startDate: '',
    dueDate: '',
    createdBy: '',
    updatedBy: ''
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaveStatus('saving');
      
      const payload = {
        ...formData,
        taskStatus,
        taskPriority
      };

      await axios.put(`/api/task-detail-page/${currentTask.id}`, payload);
      setSaveStatus('success');

      setTimeout(() => {
        setSaveStatus('idle');
        setIsEditing(false);
      }, 2000);

    } catch (err) {
      console.error('Erro ao atualizar propriedades:', err);
      setSaveStatus('error');
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };

  const getStatusLabel = (status: string) => {
    // Simplificação - num caso real, usar relations.statusList
    const label = {
      'PENDING': 'Pendente',
      'READY': 'Pronta',
      'RUNNING': 'Em execução',
      'COMPLETED': 'Concluída'
    }[status];
    return label || status;
  };

  const getPriorityLabel = (priority: string) => {
    const label = {
      '0': 'Sem prioridade',
      '1': 'Baixa',
      '2': 'Média',
      '3': 'Alta',
      '4': 'Crítica'
    }[priority];
    return label || priority;
  };

  return (
    <div className="task-properties">
      <div className="properties-header">
        <h3 className="section-title">
          <FaInfoCircle /> Propriedades
        </h3>
        {!isEditing && (
          <button className="edit-button" onClick={() => setIsEditing(true)}>
            <FaEdit /> Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="properties-form">
          <div className="form-row">
            <label className="form-label">
              Código
              <input
                type="text"
                name="taskCode"
                value={formData.taskCode}
                onChange={handleInputChange}
                className="form-input"
                disabled={saveStatus === 'saving'}
              />
            </label>
            <label className="form-label">
              Usuário Criador
              <input
                type="text"
                name="createdBy"
                value={formData.createdBy}
                onChange={handleInputChange}
                className="form-input"
                disabled={saveStatus === 'saving'}
              />
            </label>
          </div>

          <label className="form-label">
            Nome da Tarefa
            <input
              type="text"
              name="taskName"
              value={formData.taskName}
              onChange={handleInputChange}
              className="form-input"
              disabled={saveStatus === 'saving'}
            />
          </label>

          <label className="form-label">
            Status
            <select
              name="taskStatus"
              value={formData.taskStatus}
              onChange={handleInputChange}
              className="form-select"
              disabled={saveStatus === 'saving'}
            >
              <option value="PENDING">Pendente</option>
              <option value="READY">Pronta</option>
              <option value="RUNNING">Em Execução</option>
              <option value="COMPLETED">Concluída</option>
            </select>
          </label>

          <label className="form-label">
            Prioridade
            <select
              name="taskPriority"
              value={formData.taskPriority}
              onChange={handleInputChange}
              className="form-select"
              disabled={saveStatus === 'saving'}
            >
              <option value="0">Sem prioridade</option>
              <option value="1">Baixa</option>
              <option value="2">Média</option>
              <option value="3">Alta</option>
              <option value="4">Crítica</option>
            </select>
          </label>

          <label className="form-label">
            Projeto
            <select
              name="project"
              value={formData.project}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Selecione um projeto</option>
              {relations.projects?.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <div className="form-row">
            <label className="form-label">
              Data de Início
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="form-input"
                disabled={saveStatus === 'saving'}
              />
            </label>
            <label className="form-label">
              Data de Vencimento
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="form-input"
                disabled={saveStatus === 'saving'}
              />
            </label>
          </div>

          <label className="form-label">
            Descrição
            <textarea
              name="taskDescription"
              value={formData.taskDescription}
              onChange={handleInputChange}
              className="form-textarea"
              rows={3}
              disabled={saveStatus === 'saving'}
            />
          </label>

          <div className="form-actions">
            <button
              type="submit"
              className="save-btn"
              disabled={saveStatus !== 'idle'}
            >
              {saveStatus === 'saving' ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setIsEditing(false);
                setSaveStatus('idle');
              }}
            >
              <FaTimes /> Cancelar
            </button>
          </div>

          {saveStatus === 'error' && (
            <div className="error-message">
              Erro ao salvar. Por favor, tente novamente.
            </div>
          )}

          {saveStatus === 'success' && (
            <div className="success-message">
              Propriedades atualizadas com sucesso!
            </div>
          )}
        </form>
      ) : (
        <div className="properties-grid">
          <div className="property-item">
            <span className="property-label">Código:</span>
            <span className="property-value">{currentTask.taskCode || 'N/A'}</span>
          </div>
          <div className="property-item">
            <span className="property-label">Nome:</span>
            <span className="property-value">{currentTask.taskName || 'N/A'}</span>
          </div>
          <div className="property-item">
            <span className="property-label">Status:</span>
            <span className={`property-value status-value ${currentTask.taskStatus?.toLowerCase()}`}>
              {currentTask.taskStatus && getStatusLabel(currentTask.taskStatus)}
            </span>
          </div>
          <div className="property-item">
            <span className="property-label">Prioridade:</span>
            <span className={`property-value priority-badge ${currentTask.taskPriority?.toLowerCase()}`}>
              {currentTask.taskPriority && getPriorityLabel(currentTask.taskPriority)}
            </span>
          </div>
          <div className="property-item">
            <span className="property-label">Projeto:</span>
            <span className="property-value">
              {currentTask.project?.name || 'N/A'}
            </span>
          </div>
          <div className="property-item">
            <span className="property-label">Criado por:</span>
            <span className="property-value">
              {currentTask.user?.nickname || 'N/A'}
            </span>
          </div>
          <div className="property-item">
            <span className="property-label">Criado em:</span>
            <span className="property-value">
              {currentTask.createdAt?.split('T')[0] || 'N/A'}
            </span>
          </div>
          <div className="property-item">
            <span className="property-label">Atualizado por:</span>
            <span className="property-value">
              {currentTask.updatedUser?.nickname || 'N/A'}
            </span>
          </div>
          <div className="property-item">
            <span className="property-label">Data de Início:</span>
            <span className="property-value">
              {currentTask.startDate?.split('T')[0] || 'N/A'}
            </span>
          </div>
          <div className="property-item">
            <span className="property-label">Data de Vencimento:</span>
            <span className="property-value">
              {currentTask.dueDate?.split('T')[0] || 'N/A'}
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        .task-properties {
          background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
          border-radius: 12px;
          padding: 24px;
        }

        .properties-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #404040;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
        }

        .section-title svg {
          color: #29b6f6;
        }

        .edit-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #2196f3;
          border: none;
          border-radius: 6px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .edit-button:hover {
          background: #1976d2;
          transform: translateY(-1px);
        }

        .edit-button:active {
          transform: translateY(0);
        }

        .edit-button svg {
          font-size: 12px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }

        .form-label:not(:last-child) {
          margin-bottom: 20px;
        }

        .form-label label {
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 12px 16px;
          background: #3d3d3d;
          border: 1px solid #404040;
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #2196f3;
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
        }

        .form-input:disabled,
        .form-select:disabled {
          background: #2d2d2d;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          background: #3d3d3d;
          border: 1px solid #404040;
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          min-height: 80px;
          transition: all 0.3s ease;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #2196f3;
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
        }

        .form-textarea:disabled {
          background: #2d2d2d;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .save-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 24px;
          background: #4caf50;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .save-btn:hover:not(:disabled) {
          background: #388e3c;
          transform: translateY(-1px);
        }

        .save-btn:disabled {
          background: #66bb6a;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .cancel-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #f44336;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-btn:hover {
          background: #d32f2f;
          transform: translateY(-1px);
        }

        .cancel-btn svg {
          font-size: 12px;
        }

        .error-message {
          margin-top: 12px;
          padding: 12px;
          background: rgba(244, 67, 54, 0.1);
          border: 1px solid rgba(244, 67, 54, 0.3);
          border-radius: 6px;
          color: #f44336;
          font-size: 13px;
          text-align: center;
        }

        .success-message {
          margin-top: 12px;
          padding: 12px;
          background: rgba(76, 175, 80, 0.1);
          border: 1px solid rgba(76, 175, 80, 0.3);
          border-radius: 6px;
          color: #4caf50;
          font-size: 13px;
          text-align: center;
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .properties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .property-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 12px;
          background: #3d3d3d;
          border-radius: 8px;
        }

        .property-label {
          color: #a0a0a0;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .property-value {
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          padding: 6px 8px;
          background: #2d2d2d;
          border-radius: 4px;
          display: inline-block;
          width: 100%;
          box-sizing: border-box;
        }

        .status-value {
          text-transform: uppercase;
          background: rgba(33, 150, 243, 0.15);
          color: #2196f3;
        }

        .priority-badge {
          text-transform: uppercase;
          font-size: 12px;
          padding: 4px 8px;
        }

        .priority-badge.critical,
        .priority-badge.priority4 {
          background: rgba(244, 67, 54, 0.2);
          color: #f44336;
        }

        .priority-badge.high,
        .priority-badge.priority3 {
          background: rgba(255, 152, 0, 0.2);
          color: #ff9800;
        }

        .priority-badge.medium,
        .priority-badge.priority2 {
          background: rgba(255, 193, 7, 0.2);
          color: #ffc107;
        }

        .priority-badge.low,
        .priority-badge.priority1 {
          background: rgba(76, 175, 80, 0.2);
          color: #4caf50;
        }

        .priority-badge.none,
        .priority-badge.priority0 {
          background: rgba(158, 158, 158, 0.2);
          color: #9e9e9e;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .properties-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .task-properties {
            padding: 16px;
          }

          .form-row {
            gap: 12px;
          }

          .form-actions {
            flex-direction: column;
          }

          .save-btn,
          .cancel-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskProperties;