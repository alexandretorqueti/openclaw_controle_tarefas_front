import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Status } from '../types';
import './StatusManager.css';

const StatusManager: React.FC = () => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state for new status
  const [newStatus, setNewStatus] = useState({
    name: '',
    colorCode: '#3B82F6',
    order: 0,
    isFinalState: false,
    visibleToAi: true
  });

  // Color options for quick selection
  const colorOptions = [
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Vermelho', value: '#EF4444' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Amarelo', value: '#F59E0B' },
    { name: 'Roxo', value: '#8B5CF6' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Ciano', value: '#06B6D4' },
    { name: 'Laranja', value: '#F97316' },
    { name: 'Cinza', value: '#6B7280' },
    { name: 'Preto', value: '#111827' }
  ];

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getStatuses();
      // O backend retorna o wrapper: { count, statuses, correlationId }
      // Precisamos acessar response.statuses após o camelCase conversion
      console.log('[DEBUG StatusManager] Response completo:', JSON.stringify(response, null, 2));
      console.log('[DEBUG StatusManager] response.statuses:', (response as any).statuses);
      const data = (response as any).statuses || [];
      setStatuses(Array.isArray(data) ? data : []);
      
      // Set default order for new status
      const maxOrder = statuses.length > 0 
        ? Math.max(...statuses.map(s => s.order || 0))
        : 0;
      setNewStatus(prev => ({ ...prev, order: maxOrder + 1 }));
    } catch (error) {
      console.error('Erro ao carregar status:', error);
      setError('Não foi possível carregar os status. Verifique a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newStatus.name.trim()) {
      setError('O nome do status é obrigatório');
      return;
    }

    try {
      setError(null);
      await api.createStatus(newStatus);
      setNewStatus({
        name: '',
        colorCode: '#3B82F6',
        order: statuses.length > 0 ? Math.max(...statuses.map(s => s.order || 0)) + 1 : 0,
        isFinalState: false,
        visibleToAi: true
      });
      loadStatuses();
    } catch (error) {
      console.error('Erro ao criar status:', error);
      setError('Erro ao criar status. Verifique os dados e tente novamente.');
    }
  };

  const handleUpdate = async () => {
    if (!editingStatus) return;
    
    try {
      setError(null);
      const { id, ...updateData } = editingStatus;
      await api.updateStatus(id, updateData);
      setEditingStatus(null);
      loadStatuses();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setError('Erro ao atualizar status. Verifique os dados e tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este status?')) return;
    
    try {
      setError(null);
      await api.deleteStatus(id);
      loadStatuses();
    } catch (error) {
      console.error('Erro ao excluir status:', error);
      setError('Erro ao excluir status. Verifique se não está sendo usado em tarefas.');
    }
  };

  const handleEdit = (status: Status) => {
    setEditingStatus(status);
  };

  const handleCancelEdit = () => {
    setEditingStatus(null);
  };

  const handleNewStatusChange = (field: keyof typeof newStatus, value: string | number | boolean) => {
    setNewStatus(prev => ({ ...prev, [field]: value }));
  };

  const handleEditStatusChange = (field: keyof Status, value: string | number | boolean) => {
    if (editingStatus) {
      setEditingStatus(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleColorSelect = (color: string, isEdit: boolean = false) => {
    if (isEdit && editingStatus) {
      setEditingStatus({ ...editingStatus, colorCode: color });
    } else {
      setNewStatus(prev => ({ ...prev, colorCode: color }));
    }
  };

  return (
    <div className="status-manager">
      <div className="status-header">
        <h1>Gerenciar Status</h1>
      </div>

      {/* Error message */}
      {error && (
        <div className="error-message">
          {error}
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: '12px',
              padding: '4px 12px',
              backgroundColor: 'var(--danger-color)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Fechar
          </button>
        </div>
      )}

      {/* Button to show/hide create form */}
      <button 
        className="btn-include-status"
        onClick={() => setShowCreateForm(!showCreateForm)}
        style={{
          backgroundColor: 'var(--primary-color, #3B82F6)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '10px 20px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '20px',
          display: 'inline-block'
        }}
      >
        {showCreateForm ? '❌ Ocultar Formulário' : '➕ Incluir Status'}
      </button>

      {/* Create form - conditional */}
      {showCreateForm && (
        <div className="status-form">
        <div className="form-group" style={{ flex: 2 }}>
          <label>Nome do Status *</label>
          <input
            type="text"
            value={newStatus.name}
            onChange={(e) => handleNewStatusChange('name', e.target.value)}
            placeholder="Ex: Em Andamento, Concluído, Bloqueado"
          />
        </div>

        <div className="form-group">
          <label>Cor</label>
          <div className="color-picker">
            <div 
              className="color-preview" 
              style={{ backgroundColor: newStatus.colorCode }}
            />
            <input
              type="text"
              value={newStatus.colorCode}
              onChange={(e) => handleNewStatusChange('colorCode', e.target.value)}
              className="color-input"
              placeholder="#3B82F6"
            />
          </div>
          <div className="color-palette">
            {colorOptions.map(color => (
              <div
                key={color.value}
                className={`color-option ${newStatus.colorCode === color.value ? 'selected' : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleColorSelect(color.value)}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Ordem</label>
          <input
            type="number"
            value={newStatus.order}
            onChange={(e) => handleNewStatusChange('order', parseInt(e.target.value) || 0)}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Estado Final</label>
          <div className="toggle-buttons">
            <button
              type="button"
              className={`toggle-button ${newStatus.isFinalState ? 'active' : ''}`}
              onClick={() => handleNewStatusChange('isFinalState', true)}
            >
              Sim
            </button>
            <button
              type="button"
              className={`toggle-button ${!newStatus.isFinalState ? 'active' : ''}`}
              onClick={() => handleNewStatusChange('isFinalState', false)}
            >
              Não
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Visível pela IA</label>
          <div className="toggle-buttons">
            <button
              type="button"
              className={`toggle-button ${newStatus.visibleToAi ? 'active' : ''}`}
              onClick={() => handleNewStatusChange('visibleToAi', true)}
            >
              Sim
            </button>
            <button
              type="button"
              className={`toggle-button ${!newStatus.visibleToAi ? 'active' : ''}`}
              onClick={() => handleNewStatusChange('visibleToAi', false)}
            >
              Não
            </button>
          </div>
        </div>

        <button 
          onClick={handleCreate}
          disabled={!newStatus.name.trim() || loading}
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--primary-color, #3B82F6)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          {loading ? 'Salvando...' : 'Adicionar Status'}
        </button>
      </div>
      )}

      {/* Edit form */}
      {editingStatus && (
        <div className="status-edit-form">
          <div className="status-edit-form-header">
            <h3>Editar Status</h3>
          </div>
          
          <div className="status-edit-form-fields">
            <div className="form-group">
              <label>Nome do Status *</label>
              <input
                type="text"
                value={editingStatus.name}
                onChange={(e) => handleEditStatusChange('name', e.target.value)}
                placeholder="Ex: Em Andamento, Concluído, Bloqueado"
              />
            </div>

            <div className="form-group">
              <label>Cor</label>
              <div className="color-picker">
                <div 
                  className="color-preview" 
                  style={{ backgroundColor: editingStatus.colorCode }}
                />
                <input
                  type="text"
                  value={editingStatus.colorCode}
                  onChange={(e) => handleEditStatusChange('colorCode', e.target.value)}
                  className="color-input"
                  placeholder="#3B82F6"
                />
              </div>
              <div className="color-palette">
                {colorOptions.map(color => (
                  <div
                    key={color.value}
                    className={`color-option ${editingStatus.colorCode === color.value ? 'selected' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorSelect(color.value, true)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Ordem</label>
              <input
                type="number"
                value={editingStatus.order || 0}
                onChange={(e) => handleEditStatusChange('order', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Estado Final</label>
              <div className="toggle-buttons">
                <button
                  type="button"
                  className={`toggle-button ${editingStatus.isFinalState ? 'active' : ''}`}
                  onClick={() => handleEditStatusChange('isFinalState', true)}
                >
                  Sim
                </button>
                <button
                  type="button"
                  className={`toggle-button ${!editingStatus.isFinalState ? 'active' : ''}`}
                  onClick={() => handleEditStatusChange('isFinalState', false)}
                >
                  Não
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Visível pela IA</label>
              <div className="toggle-buttons">
                <button
                  type="button"
                  className={`toggle-button ${editingStatus.visibleToAi ? 'active' : ''}`}
                  onClick={() => handleEditStatusChange('visibleToAi', true)}
                >
                  Sim
                </button>
                <button
                  type="button"
                  className={`toggle-button ${!editingStatus.visibleToAi ? 'active' : ''}`}
                  onClick={() => handleEditStatusChange('visibleToAi', false)}
                >
                  Não
                </button>
              </div>
            </div>
          </div>

          <div className="status-edit-form-actions">
            <button onClick={handleUpdate} disabled={!editingStatus.name.trim() || loading}>
              Salvar Alterações
            </button>
            <button onClick={handleCancelEdit}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Status list */}
      { (statuses && Array.isArray(statuses)) &&
      <div className="status-list">
        {loading ? (
          <div className="loading">Carregando status...</div>
        ) : statuses.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum status cadastrado</p>
            <p>Use o formulário acima para criar o primeiro status</p>
          </div>
        ) : (
          statuses
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(status => (
              <div key={status.id} className="status-item">
                <div className="status-info">
                  <div 
                    className="status-color" 
                    style={{ backgroundColor: status.colorCode }}
                  />
                  <div className="status-details">
                    <div className="status-name">{status.name}</div>
                    <div className="status-meta">
                      <span className="status-meta-item">Ordem: {status.order || 0}</span>
                      <span className="status-meta-item">Cor: {status.colorCode}</span>
                    </div>
                  </div>
                  <div className="status-badges">
                    {status.isFinalState && (
                      <span className="status-badge final">Final</span>
                    )}
                    {status.visibleToAi && (
                      <span className="status-badge ai">IA</span>
                    )}
                  </div>
                </div>
                <div className="status-actions">
                  <button onClick={() => handleEdit(status)}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(status.id)}>
                    Excluir
                  </button>
                </div>
              </div>
            ))
        )}
      </div>
      }
    </div>
  );
};

export default StatusManager;
