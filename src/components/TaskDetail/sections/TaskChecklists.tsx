import React, { useState } from 'react';
import { FaCheck, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

interface TaskChecklistsProps {
  initialItems?: ChecklistItem[];
  onSave: (items: ChecklistItem[]) => Promise<void>;
  isLoading: boolean;
}

const TaskChecklists: React.FC<TaskChecklistsProps> = ({
  initialItems = [],
  onSave,
  isLoading
}) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialItems);
  const [newItem, setNewItem] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const addItem = () => {
    if (!newItem.trim()) return;

    const newItemObj: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: newItem.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    setChecklist(prev => [...prev, newItemObj]);
    setNewItem('');
  };

  const toggleItem = (itemId: string) => {
    const now = new Date().toISOString();
    setChecklist(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              completed: !item.completed,
              completedAt: !item.completed ? now : item.completedAt
            }
          : item
      )
    );
  };

  const deleteItem = (itemId: string) => {
    setChecklist(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveStatus('idle');
      await onSave(checklist);
      setSaveStatus('success');

      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Erro ao salvar checklists:', err);
      setSaveStatus('error');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;

  return (
    <div className="task-checklists">
      <div className="checklists-header">
        <h3 className="section-title">
          <FaCheck /> Checklists
        </h3>
        <div className="checklists-count">
          {completedCount}/{totalCount} completados
        </div>
      </div>

      <div className="checklist-input-section">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Adicionar item à checklist..."
          className="checklist-input"
          disabled={isSaving || isLoading}
        />
        <button
          className="add-item-btn"
          onClick={addItem}
          disabled={isSaving || isLoading || !newItem.trim()}
        >
          <FaPlus /> Adicionar
        </button>
      </div>

      {checklist.length === 0 ? (
        <div className="no-checklists">
          <FaCheck className="empty-icon" />
          <p>Nenhuma checklist criada ainda.</p>
          <small>Adicione itens acima para criar uma lista de verificação</small>
        </div>
      ) : (
        <div className="checklist-items">
          {checklist.map((item, index) => (
            <div
              key={item.id}
              className={`checklist-item ${item.completed ? 'completed' : ''}`}
            >
              <div className="item-content">
                <label className="item-checkbox">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleItem(item.id)}
                    disabled={isSaving || isLoading}
                  />
                  <div className="custom-checkbox">
                    <FaCheck />
                  </div>
                </label>
                <span className={`item-text ${item.completed ? 'completed-text' : ''}`}>
                  {item.text}
                </span>
                <span className="item-time">
                  {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <button
                className="delete-item-btn"
                onClick={() => deleteItem(item.id)}
                disabled={isSaving || isLoading}
                title="Excluir item"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="checklist-actions">
        <button
          className="save-status-btn"
          onClick={handleSave}
          disabled={isSaving || isLoading || checklist.length === 0}
        >
          {isSaving || isLoading ? 'Salvando...' : 'Salvar Checklists'}
        </button>

        {checklist.length > 0 && (
          <div className={`status-message ${saveStatus}`}>
            {saveStatus === 'success' && '✓ Checklists salvas com sucesso!'}
            {saveStatus === 'error' && '✗ Erro ao salvar checklists'}
          </div>
        )}
      </div>

      <style jsx>{`
        .task-checklists {
          background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
          border-radius: 12px;
          padding: 24px;
        }

        .checklists-header {
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

        .checklists-count {
          background: #404040;
          padding: 4px 12px;
          border-radius: 12px;
          color: #a0a0a0;
          font-size: 12px;
          font-weight: 500;
        }

        .checklist-input-section {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .checklist-input {
          flex: 1;
          padding: 12px 16px;
          background: #3d3d3d;
          border: 1px solid #404040;
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .checklist-input:focus {
          outline: none;
          border-color: #2196f3;
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
        }

        .checklist-input:disabled {
          background: #2d2d2d;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .add-item-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #2196f3;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-item-btn:hover:not(:disabled) {
          background: #1976d2;
          transform: translateY(-1px);
        }

        .add-item-btn:disabled {
          background: #66bb6a;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .add-item-btn svg {
          font-size: 14px;
        }

        .no-checklists {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
          color: #a0a0a0;
        }

        .empty-icon {
          font-size: 48px;
          color: #404040;
          margin-bottom: 16px;
        }

        .no-checklists p {
          font-size: 16px;
          margin: 0 0 8px 0;
          color: #ffffff;
        }

        .no-checklists small {
          font-size: 13px;
          color: #a0a0a0;
        }

        .checklist-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .checklist-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #3d3d3d;
          border-radius: 8px;
          border: 1px solid #404040;
          transition: all 0.3s ease;
        }

        .checklist-item:hover {
          background: #424242;
          border-color: #29b6f6;
          transform: translateX(4px);
        }

        .checklist-item.completed {
          background: rgba(76, 175, 80, 0.1);
          border-color: rgba(76, 175, 80, 0.3);
        }

        .item-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .item-checkbox {
          position: relative;
          display: inline-flex;
          align-items: center;
          cursor: pointer;
        }

        .item-checkbox input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
        }

        .custom-checkbox {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #2d2d2d;
          border: 2px solid #404040;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .item-checkbox input:checked ~ .custom-checkbox {
          background: #4caf50;
          border-color: #4caf50;
          color: #ffffff;
        }

        .item-checkbox input:focus ~ .custom-checkbox {
          box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
        }

        .custom-checkbox svg {
          font-size: 12px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .item-checkbox input:checked ~ .custom-checkbox svg {
          opacity: 1;
        }

        .item-text {
          color: #ffffff;
          font-size: 14px;
          flex: 1;
          min-width: 0;
          transition: all 0.3s ease;
        }

        .item-text.completed-text {
          text-decoration: line-through;
          color: #888;
        }

        .item-time {
          color: #a0a0a0;
          font-size: 12px;
          white-space: nowrap;
        }

        .delete-item-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          background: rgba(244, 67, 54, 0.1);
          border: 1px solid rgba(244, 67, 54, 0.3);
          border-radius: 6px;
          color: #f44336;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .delete-item-btn:hover {
          background: rgba(244, 67, 54, 0.2);
          border-color: #f44336;
          color: #ff5252;
        }

        .delete-item-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .delete-item-btn svg {
          font-size: 12px;
        }

        .checklist-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 20px;
          border-top: 1px solid #404040;
        }

        .save-status-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 24px;
          background: #2196f3;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .save-status-btn:hover:not(:disabled) {
          background: #1976d2;
          transform: translateY(-1px);
        }

        .save-status-btn:disabled {
          background: #66bb6a;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .save-status-btn svg {
          font-size: 14px;
        }

        .status-message {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .status-message.success {
          background: rgba(76, 175, 80, 0.1);
          color: #4caf50;
          opacity: 1;
          animation: fadeIn 0.3s ease-in-out;
        }

        .status-message.error {
          background: rgba(244, 67, 54, 0.1);
          color: #f44336;
          opacity: 1;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .checklist-input-section {
            flex-direction: column;
          }

          .checklist-actions {
            flex-direction: column;
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .task-checklists {
            padding: 16px;
          }

          .checklist-item {
            padding: 12px;
          }

          .item-time {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskChecklists;