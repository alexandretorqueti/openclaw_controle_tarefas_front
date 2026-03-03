const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/TaskCard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the "Assigned to" section and replace it with an editable version
const assignedToSection = `        {/* Assigned to */}
        <div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Atribuído a</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {assignedUser?.avatarUrl ? (
              <img 
                src={assignedUser.avatarUrl} 
                alt={assignedUser.name}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#e3f2fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaUser size={12} color="#1976d2" />
              </div>
            )}
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
              {assignedUser?.name || 'Não atribuído'}
            </span>
          </div>
        </div>`;

const newAssignedToSection = `        {/* Assigned to */}
        <div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Atribuído a</div>
          {onUpdateTask ? (
            <select
              value={task.assignedToId || ''}
              onChange={handleAssignedToChange}
              disabled={isUpdating}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#fff',
                width: '100%',
                cursor: 'pointer'
              }}
            >
              <option value="">Não atribuído</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {assignedUser?.avatarUrl ? (
                <img 
                  src={assignedUser.avatarUrl} 
                  alt={assignedUser.name}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#e3f2fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaUser size={12} color="#1976d2" />
                </div>
              )}
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
                {assignedUser?.name || 'Não atribuído'}
              </span>
            </div>
          )}
        </div>`;

// Also need to add the handleAssignedToChange function
const handleAssignedToChangeFunction = `
  const handleAssignedToChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    if (!onUpdateTask) return;
    
    setIsUpdating(true);
    setError(null); // Limpa erros anteriores
    
    try {
      const newValue = e.target.value === '' ? null : e.target.value;
      await onUpdateTask(task.id, { assignedToId: newValue });
    } catch (error: any) {
      console.error('Failed to update task assigned user:', error);
      
      // Extrai mensagem de erro amigável
      let errorMessage = 'Erro ao atualizar usuário atribuído da tarefa.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Tenta extrair detalhes da resposta da API
      if (error.details && Array.isArray(error.details)) {
        const validationErrors = error.details.map((detail: any) => 
          detail.message || \`\${detail.path?.join('.')}: \${detail.code}\`
        ).join(', ');
        
        if (validationErrors) {
          errorMessage = \`Erros de validação: \${validationErrors}\`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };`;

// First, add the handleAssignedToChange function after handlePriorityChange
const handlePriorityChangeEnd = '      setIsUpdating(false);\n    }\n  };';
const newHandlePriorityChangeEnd = '      setIsUpdating(false);\n    }\n  };\n\n' + handleAssignedToChangeFunction;

// Replace the assigned to section
if (content.includes(assignedToSection)) {
  content = content.replace(assignedToSection, newAssignedToSection);
  
  // Add the handleAssignedToChange function
  if (content.includes(handlePriorityChangeEnd)) {
    content = content.replace(handlePriorityChangeEnd, newHandlePriorityChangeEnd);
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Campo "Atribuído a" atualizado para ser editável via combo!');
} else {
  console.log('❌ Não foi possível encontrar a seção "Atribuído a" original.');
}
