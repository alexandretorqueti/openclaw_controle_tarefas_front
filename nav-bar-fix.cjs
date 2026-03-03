const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldNavBar = `        {/* Navigation Bar */}
        <div style={{
          backgroundColor: '#fff',
          padding: '0 24px',
          borderBottom: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '64px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <FloatingMenu
                onOpenStatus={() => setIsStatusModalOpen(true)}
                onOpenPriority={() => setIsPriorityModalOpen(true)}
                onOpenUser={() => setIsUserModalOpen(true)}
                onOpenNextTask={() => setIsNextTaskModalOpen(true)}
              />
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#333' }}>
                Sistema de Gestão
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setSelectedTask(null);
                  setViewMode('error-logs');
                }}
                style={{
                  padding: '10px 16px',
                  backgroundColor: viewMode === 'error-logs' ? '#4ECDC4' : '#f8f9fa',
                  color: viewMode === 'error-logs' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <FaExclamationTriangle size={14} />
                Logs de Erros
              </button>
              
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setSelectedTask(null);
                  setViewMode('logs');
                }}
                style={{
                  padding: '10px 16px',
                  backgroundColor: viewMode === 'logs' ? '#4ECDC4' : '#f8f9fa',
                  color: viewMode === 'logs' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <FaTerminal size={14} />
                Logs do Jarbas
              </button>
              
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setSelectedTask(null);
                  setViewMode('recurrence');
                }}
                style={{
                  padding: '10px 16px',
                  backgroundColor: viewMode === 'recurrence' ? '#4ECDC4' : '#f8f9fa',
                  color: viewMode === 'recurrence' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <FaSync size={14} />
                Recorrência
              </button>
              
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setSelectedTask(null);
                  setViewMode('projects');
                }}
                style={{
                  padding: '10px 16px',
                  backgroundColor: viewMode === 'projects' ? '#4ECDC4' : '#f8f9fa',
                  color: viewMode === 'projects' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <FaFolder size={14} />
                Projetos
              </button>

              <button
                onClick={() => {
                  setSelectedProject(null);
                  setSelectedTask(null);
                  setViewMode('tasks');
                }}
                style={{
                  padding: '10px 16px',
                  backgroundColor: viewMode === 'tasks' ? '#4ECDC4' : '#f8f9fa',
                  color: viewMode === 'tasks' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <FaTasks size={14} />
                Todas as Tarefas
              </button>
            </div>

            <UserDropdownMenu
              onLogout={logout}
              onEditProfile={() => setIsProfileEditModalOpen(true)}
            />
          </div>
        </div>`;

const newNavBar = `        {/* Navigation Bar */}
        <div style={{
          backgroundColor: '#fff',
          padding: '0 16px',
          borderBottom: '1px solid #e0e0e0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '56px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FloatingMenu
                onOpenStatus={() => setIsStatusModalOpen(true)}
                onOpenPriority={() => setIsPriorityModalOpen(true)}
                onOpenUser={() => setIsUserModalOpen(true)}
                onOpenNextTask={() => setIsNextTaskModalOpen(true)}
              />
              <h1 style={{ fontSize: '16px', fontWeight: 600, color: '#333', letterSpacing: '-0.3px' }}>
                Sistema de Gestão
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setSelectedTask(null);
                  setViewMode('projects');
                }}
                style={{
                  padding: '8px 12px',
                  backgroundColor: viewMode === 'projects' ? '#4ECDC4' : '#f8f9fa',
                  color: viewMode === 'projects' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  fontWeight: 500
                }}
              >
                <FaFolder size={12} />
                Projetos
              </button>

              <button
                onClick={() => {
                  setSelectedProject(null);
                  setSelectedTask(null);
                  setViewMode('tasks');
                }}
                style={{
                  padding: '8px 12px',
                  backgroundColor: viewMode === 'tasks' ? '#4ECDC4' : '#f8f9fa',
                  color: viewMode === 'tasks' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  fontWeight: 500
                }}
              >
                <FaTasks size={12} />
                Tarefas
              </button>
              
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setSelectedTask(null);
                  setViewMode('recurrence');
                }}
                style={{
                  padding: '8px 12px',
                  backgroundColor: viewMode === 'recurrence' ? '#4ECDC4' : '#f8f9fa',
                  color: viewMode === 'recurrence' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  fontWeight: 500
                }}
              >
                <FaSync size={12} />
                Recorrência
              </button>
              
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setSelectedTask(null);
                  setViewMode('logs');
                }}
                style={{
                  padding: '8px 12px',
                  backgroundColor: viewMode === 'logs' ? '#4ECDC4' : '#f8f9fa',
                  color: viewMode === 'logs' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  fontWeight: 500
                }}
              >
                <FaTerminal size={12} />
                Logs
              </button>
              
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setSelectedTask(null);
                  setViewMode('error-logs');
                }}
                style={{
                  padding: '8px 12px',
                  backgroundColor: viewMode === 'error-logs' ? '#4ECDC4' : '#f8f9fa',
                  color: viewMode === 'error-logs' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  fontWeight: 500
                }}
              >
                <FaExclamationTriangle size={12} />
                Erros
              </button>
            </div>

            <UserDropdownMenu
              onLogout={logout}
              onEditProfile={() => setIsProfileEditModalOpen(true)}
            />
          </div>
        </div>`;

if (content.includes(oldNavBar)) {
  content = content.replace(oldNavBar, newNavBar);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Barra de navegação atualizada com sucesso!');
} else {
  console.log('❌ Não foi possível encontrar a barra de navegação original.');
}
