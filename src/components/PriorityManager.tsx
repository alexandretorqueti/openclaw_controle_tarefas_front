import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Priority } from '../types/tasks';
import './PriorityManager.css';

const PriorityManager: React.FC = () => {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [editingPriority, setEditingPriority] = useState<Priority | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state for new priority
  const [newPriority, setNewPriority] = useState({
    name: '',
    weight: 1
  });

  // Weight options for quick selection
  const weightOptions = [
    { value: 1, label: 'Muito Baixa (1)', color: '#10B981' },
    { value: 2, label: 'Baixa (2)', color: '#10B981' },
    { value: 3, label: 'Média (3)', color: '#F59E0B' },
    { value: 4, label: 'Média-Alta (4)', color: '#F59E0B' },
    { value: 5, label: 'Alta (5)', color: '#EF4444' },
    { value: 6, label: 'Muito Alta (6)', color: '#EF4444' },
    { value: 7, label: 'Crítica (7)', color: '#DC2626' },
    { value: 8, label: 'Urgente (8)', color: '#DC2626' },
    { value: 9, label: 'Emergência (9)', color: '#991B1B' },
    { value: 10, label: 'Imediata (10)', color: '#991B1B' }
  ];

  useEffect(() => {
    loadPriorities();
  }, []);

  const loadPriorities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getPriorities();
      const data = (response as any).data || response;
      const prioritiesArray = Array.isArray(data) ? data : (data.priorities || []);
      setPriorities(prioritiesArray);
      
      // Set default weight for new priority
      const maxWeight = prioritiesArray.length > 0 
        ? Math.max(...prioritiesArray.map(p => p.weight || 1))
        : 0;
      setNewPriority(prev => ({ ...prev, weight: maxWeight + 1 }));
    } catch (error) {
      console.error('Erro ao carregar prioridades:', error);
      setError('Não foi possível carregar as prioridades. Verifique a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newPriority.name.trim()) {
      setError('O nome da prioridade é obrigatório');
      return;
    }

    if (newPriority.weight < 1 || newPriority.weight > 10) {
      setError('O peso deve estar entre 1 e 10');
      return;
    }

    try {
      setError(null);
      await api.createPriority(newPriority);
      setNewPriority({
        name: '',
        weight: priorities.length > 0 ? Math.max(...priorities.map(p => p.weight || 1)) + 1 : 1
      });
      setShowCreateForm(false);
      loadPriorities();
    } catch (error) {
      console.error('Erro ao criar prioridade:', error);
      setError('Erro ao criar prioridade. Verifique os dados e tente novamente.');
    }
  };

  const handleUpdate = async () => {
    if (!editingPriority) return;
    
    try {
      setError(null);
      const { id, ...updateData } = editingPriority;
      await api.updatePriority(id, updateData);
      setEditingPriority(null);
      loadPriorities();
    } catch (error) {
      console.error('Erro ao atualizar prioridade:', error);
      setError('Erro ao atualizar prioridade. Verifique os dados e tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta prioridade?')) return;
    
    try {
      setError(null);
      await api.deletePriority(id);
      loadPriorities();
    } catch (error) {
      console.error('Erro ao excluir prioridade:', error);
      setError('Erro ao excluir prioridade. Verifique se não está sendo usada em tarefas.');
    }
  };

  const handleEdit = (priority: Priority) => {
    setEditingPriority(priority);
  };

  const handleCancelEdit = () => {
    setEditingPriority(null);
  };

  const handleNewPriorityChange = (field: keyof typeof newPriority, value: string | number) => {
    setNewPriority(prev => ({ ...prev, [field]: value }));
  };

  const handleEditPriorityChange = (field: keyof Priority, value: string | number) => {
    if (editingPriority) {
      setEditingPriority(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleWeightSelect = (weight: number, isEdit: boolean = false) => {
    if (isEdit && editingPriority) {
      setEditingPriority({ ...editingPriority, weight });
    } else {
      setNewPriority(prev => ({ ...prev, weight }));
    }
  };

  // Função para obter cor baseada no peso
  const getPriorityColor = (weight: number) => {
    if (weight >= 9) return '#991B1B'; // Emergência/Imediata - Vermelho escuro
    if (weight >= 7) return '#DC2626'; // Crítica/Urgente - Vermelho
    if (weight >= 5) return '#EF4444'; // Alta/Muito Alta - Vermelho claro
    if (weight >= 3) return '#F59E0B'; // Média/Média-Alta - Amarelo/Laranja
    return '#10B981'; // Muito Baixa/Baixa - Verde
  };

  // Função para obter descrição baseada no peso
  const getPriorityDescription = (weight: number) => {
    if (weight === 10) return 'Imediata - Ação imediata necessária';
    if (weight === 9) return 'Emergência - Atenção máxima';
    if (weight === 8) return 'Urgente - Resolver o mais rápido possível';
    if (weight === 7) return 'Crítica - Alta urgência';
    if (weight === 6) return 'Muito Alta - Atenção urgente';
    if (weight === 5) return 'Alta - Importante';
    if (weight === 4) return 'Média-Alta - Atenção elevada';
    if (weight === 3) return 'Média - Atenção normal';
    if (weight === 2) return 'Baixa - Quando possível';
    return 'Muito Baixa - Sem urgência';
  };

  return (
    <div className="priority-manager">
      <div className="priority-header">
        <div className="priority-header-title">
          <h1>Gerenciar Prioridades</h1>
        </div>
        <div className="priority-header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            Incluir Prioridade
          </button>
        </div>
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

      {/* Create form - only shown when showCreateForm is true */}
      {showCreateForm && (
        <div className="priority-form">
          <div className="form-group" style={{ flex: 2 }}>
            <label>Nome da Prioridade *</label>
            <input
              type="text"
              value={newPriority.name}
              onChange={(e) => handleNewPriorityChange('name', e.target.value)}
              placeholder="Ex: Crítica, Alta, Média, Baixa"
            />
          </div>

          <div className="form-group">
            <label>Peso (1-10)</label>
            <div className="weight-picker">
              <div 
                className="weight-preview" 
                style={{ backgroundColor: getPriorityColor(newPriority.weight) }}
              >
                {newPriority.weight}
              </div>
              <input
                type="number"
                value={newPriority.weight}
                onChange={(e) => handleNewPriorityChange('weight', parseInt(e.target.value) || 1)}
                min="1"
                max="10"
                className="weight-input"
              />
            </div>
            <div className="weight-palette">
              {weightOptions.map(option => (
                <div
                  key={option.value}
                  className={`weight-option ${newPriority.weight === option.value ? 'selected' : ''}`}
                  style={{ backgroundColor: option.color }}
                  onClick={() => handleWeightSelect(option.value)}
                  title={option.label}
                >
                  {option.value}
                </div>
              ))}
            </div>
            <div className="weight-description">
              {getPriorityDescription(newPriority.weight)}
            </div>
          </div>

          <div className="form-actions">
            <button 
              onClick={handleCreate}
              disabled={!newPriority.name.trim() || loading}
            >
              Adicionar Prioridade
            </button>
            <button 
              onClick={() => {
                setShowCreateForm(false);
                setNewPriority({
                  name: '',
                  weight: priorities.length > 0 ? Math.max(...priorities.map(p => p.weight || 1)) + 1 : 1
                });
              }}
              className="btn-cancel"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Edit form */}
      {editingPriority && (
        <div className="priority-edit-form">
          <div className="priority-edit-form-header">
            <h3>Editar Prioridade</h3>
          </div>
          
          <div className="priority-edit-form-fields">
            <div className="form-group">
              <label>Nome da Prioridade *</label>
              <input
                type="text"
                value={editingPriority.name}
                onChange={(e) => handleEditPriorityChange('name', e.target.value)}
                placeholder="Ex: Crítica, Alta, Média, Baixa"
              />
            </div>

            <div className="form-group">
              <label>Peso (1-10)</label>
              <div className="weight-picker">
                <div 
                  className="weight-preview" 
                  style={{ backgroundColor: getPriorityColor(editingPriority.weight) }}
                >
                  {editingPriority.weight}
                </div>
                <input
                  type="number"
                  value={editingPriority.weight}
                  onChange={(e) => handleEditPriorityChange('weight', parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                  className="weight-input"
                />
              </div>
              <div className="weight-palette">
                {weightOptions.map(option => (
                  <div
                    key={option.value}
                    className={`weight-option ${editingPriority.weight === option.value ? 'selected' : ''}`}
                    style={{ backgroundColor: option.color }}
                    onClick={() => handleWeightSelect(option.value, true)}
                    title={option.label}
                  >
                    {option.value}
                  </div>
                ))}
              </div>
              <div className="weight-description">
                {getPriorityDescription(editingPriority.weight)}
              </div>
            </div>
          </div>

          <div className="priority-edit-form-actions">
            <button onClick={handleUpdate} disabled={!editingPriority.name.trim() || loading}>
              Salvar Alterações
            </button>
            <button onClick={handleCancelEdit}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Priority list */}
      <div className="priority-list">
        {loading ? (
          <div className="loading">Carregando prioridades...</div>
        ) : priorities.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma prioridade cadastrada</p>
            <p>Clique no botão "Incluir Prioridade" para criar a primeira prioridade</p>
          </div>
        ) : (
          priorities
            .sort((a, b) => (b.weight || 1) - (a.weight || 1))
            .map(priority => {
              const priorityColor = getPriorityColor(priority.weight);
              const priorityDesc = getPriorityDescription(priority.weight);
              
              return (
                <div key={priority.id} className="priority-item">
                  <div className="priority-info">
                    <div 
                      className="priority-weight" 
                      style={{ backgroundColor: priorityColor }}
                    >
                      {priority.weight}
                    </div>
                    <div className="priority-details">
                      <div className="priority-name">{priority.name}</div>
                      <div className="priority-meta">
                        <span className="priority-meta-item">Peso: {priority.weight}</span>
                        <span className="priority-meta-item">{priorityDesc}</span>
                      </div>
                    </div>
                    <div className="priority-visual">
                      <div className="weight-indicator">
                        <div 
                          className="weight-fill" 
                          style={{ 
                            width: `${(priority.weight / 10) * 100}%`,
                            backgroundColor: priorityColor
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="priority-actions">
                    <button onClick={() => handleEdit(priority)}>
                      Editar
                    </button>
                    <button onClick={() => handleDelete(priority.id)}>
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Informações sobre prioridades */}
      <div className="priority-info-section">
        <h3>💡 Dicas sobre Prioridades</h3>
        <ul>
          <li>Use pesos diferentes para cada nível de prioridade</li>
          <li>Maior peso = maior prioridade (1-10)</li>
          <li>Mantenha uma escala consistente</li>
          <li>Evite muitos níveis (3-5 são suficientes para a maioria dos casos)</li>
          <li>Prioridades críticas devem ter peso 7-10</li>
          <li>Evite excluir prioridades em uso por tarefas</li>
        </ul>
      </div>
    </div>
  );
};

export default PriorityManager;