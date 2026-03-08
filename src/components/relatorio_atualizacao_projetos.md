## Relatório da Tarefa: Adicionar Campos `frontendBuildCmd` e `backendBuildCmd`

### Objetivo:
Adicionar campos `frontendBuildCmd` e `backendBuildCmd` para as funcionalidades de criação e edição de projetos no sistema `tarefas-web`.

### Passos Realizados:

1. **Leitura do Arquivo:**
   - Foi lido todo o conteúdo do arquivo `ProjectView.tsx` para verificar se os campos estavam presentes.

2. **Verificação dos Campos:**
   - Utilizou-se o comando `grep` para procurar `frontendBuildCmd` e `backendBuildCmd`. Ambos não foram encontrados, indicando a necessidade de adição.

3. **Adição dos Campos:**
   - Usado `sed` para adicionar os campos aos objetos `newProjectData` e `editProjectData`.
   - Adicionados inputs para esses campos nos formulários de criação e edição.

### Detalhes das Edições:

#### Inicialização em `newProjectData`

**Antes:**
```javascript
pastaBase: '',
frontendPort: 0,
backendPath: '',
backendPort: 0,
repositoryUrl: '',
```
**Depois:**
```javascript
pastaBase: '',
frontendPort: 0,
backendPath: '',
backendPort: 0,
repositoryUrl: '',
frontendBuildCmd: '',
backendBuildCmd: '',
```

#### Inicialização em `editProjectData`

**Antes:**
```javascript
setEditingProject(selectedProject);
```
**Depois:**
```javascript
setEditingProject(selectedProject);
setEditProjectData({
  ...selectedProject,
  frontendBuildCmd: selectedProject.frontendBuildCmd || '',
  backendBuildCmd: selectedProject.backendBuildCmd || '',
});
```

#### Adição nos Formulários de Criação

**Antes:**
```jsx
<label>Porta Frontend:</label>
<input
  type="number"
  value={newProjectData.frontendPort}
  onChange={(e) => setNewProjectData({ ...newProjectData, frontendPort: parseInt(e.target.value) })}
  className="w-full p-2 border rounded"
/>
```
**Depois:**
```jsx
<label>Porta Frontend:</label>
<input
  type="number"
  value={newProjectData.frontendPort}
  onChange={(e) => setNewProjectData({ ...newProjectData, frontendPort: parseInt(e.target.value) })}
  className="w-full p-2 border rounded"
/>
<label>Comando de Build do Frontend:</label>
<input
  type="text"
  value={newProjectData.frontendBuildCmd}
  onChange={(e) => setNewProjectData({ ...newProjectData, frontendBuildCmd: e.target.value })}
  className="w-full p-2 border rounded"
/>
<label>Comando de Build do Backend:</label>
<input
  type="text"
  value={newProjectData.backendBuildCmd}
  onChange={(e) => setNewProjectData({ ...newProjectData, backendBuildCmd: e.target.value })}
  className="w-full p-2 border rounded"
/>
```

#### Adição nos Formulários de Edição

**Antes:**
```jsx
<label>Porta Frontend:</label>
<input
  type="number"
  value={editProjectData.frontendPort}
  onChange={(e) => setEditProjectData({ ...editProjectData, frontendPort: parseInt(e.target.value) })}
  className="w-full p-2 border rounded"
/>
```
**Depois:**
```jsx
<label>Porta Frontend:</label>
<input
  type="number"
  value={editProjectData.frontendPort}
  onChange={(e) => setEditProjectData({ ...editProjectData, frontendPort: parseInt(e.target.value) })}
  className="w-full p-2 border rounded"
/>
<label>Comando de Build do Frontend:</label>
<input
  type="text"
  value={editProjectData.frontendBuildCmd}
  onChange={(e) => setEditProjectData({ ...editProjectData, frontendBuildCmd: e.target.value })}
  className="w-full p-2 border rounded"
/>
<label>Comando de Build do Backend:</label>
<input
  type="text"
  value={editProjectData.backendBuildCmd}
  onChange={(e) => setEditProjectData({ ...editProjectData, backendBuildCmd: e.target.value })}
  className="w-full p-2 border rounded"
/>
```

### Conclusão:
Os campos `frontendBuildCmd` e `backendBuildCmd` foram adicionados com sucesso no arquivo `ProjectView.tsx`, garantindo que estejam incluídos tanto na criação quanto na edição de projetos.

## Relatório Gerado em: 08/03/2026