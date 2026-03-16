import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Stage } from '../types';
import './StageManager.css';

const StageManager: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [newStage, setNewStage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStages();
  }, []);

  const loadStages = async () => {
    try {
      const response = await api.getStages();
      setStages(response.data || response);
    } catch (error) {
      console.error('Erro ao carregar etapas:', error);
    }
  };

  const handleCreate = async () => {
    if (!newStage.trim()) return;
    try {
      await api.createStage({ etapa: newStage });
      setNewStage('');
      loadStages();
    } catch (error) {
      console.error('Erro ao criar etapa:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editingStage) return;
    try {
      await api.updateStage(editingStage.id, { etapa: editingStage.etapa });
      setEditingStage(null);
      loadStages();
    } catch (error) {
      console.error('Erro ao atualizar etapa:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta etapa?')) return;
    try {
      await api.deleteStage(id);
      loadStages();
    } catch (error) {
      console.error('Erro ao excluir etapa:', error);
    }
  };

  return (
    <div className="stage-manager">
      <h1>Gerenciar Etapas</h1>
      
      <div className="stage-form">
        <input
          type="text"
          value={newStage}
          onChange={(e) => setNewStage(e.target.value)}
          placeholder="Nova etapa"
        />
        <button onClick={handleCreate}>Adicionar</button>
      </div>

      {editingStage && (
        <div className="stage-edit-form">
          <input
            type="text"
            value={editingStage.etapa}
            onChange={(e) => setEditingStage({ ...editingStage, etapa: e.target.value })}
          />
          <button onClick={handleUpdate}>Salvar</button>
          <button onClick={() => setEditingStage(null)}>Cancelar</button>
        </div>
      )}

      <div className="stage-list">
        {stages.map((stage) => (
          <div key={stage.id} className="stage-item">
            <span>{stage.etapa}</span>
            <div className="stage-actions">
              <button onClick={() => setEditingStage(stage)}>Editar</button>
              <button onClick={() => handleDelete(stage.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StageManager;