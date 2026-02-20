# Sistema de Gestão de Tarefas

Aplicativo frontend React com TypeScript baseado na arquitetura de dados normalizada para gestão de projetos e tarefas.

## 📋 Funcionalidades

- **Lista de Tarefas** com filtros avançados (status, prioridade, projeto)
- **Visualização Detalhada** de cada tarefa
- **Sistema de Dependências** entre tarefas
- **Comentários e Anexos** por tarefa
- **Histórico de Status** (auditoria)
- **Subtarefas** hierárquicas
- **Responsividade** e interface moderna

## 🏗️ Arquitetura de Dados

Baseada no modelo entidade-relacionamento definido na documentação:

```
USERS → PROJECTS → TASKS
  ↓        ↓         ↓
COMMENTS  STATUSES  PRIORITIES
  ↓                 ↓
ATTACHMENTS     DEPENDENCIES
```

## 🚀 Tecnologias

- **React 18** com TypeScript
- **date-fns** para manipulação de datas
- **React Icons** para ícones
- **UUID** para geração de IDs únicos
- **CSS-in-JS** para estilização

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── TaskCard.tsx      # Card de tarefa individual
│   ├── TaskList.tsx      # Lista com filtros e ordenação
│   └── TaskDetail.tsx    # Visualização detalhada
├── types/
│   └── index.ts          # Tipos TypeScript
├── data/
│   └── mockData.ts       # Dados de teste
├── App.tsx               # Componente principal
└── index.tsx             # Ponto de entrada
```

## 🎯 Como Executar

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm start

# Construir para produção
npm run build
```

## 📊 Dados de Teste

O aplicativo inclui dados mockados para demonstração:

- **3 usuários** (Admin, Editor, Viewer)
- **2 projetos** ativos
- **4 tarefas** com diferentes status e prioridades
- **Dependências** entre tarefas
- **Comentários** e **anexos** de exemplo

## 🎨 Design System

- **Cores principais**: `#4ECDC4` (teal), `#FF6B6B` (vermelho), `#06D6A0` (verde)
- **Tipografia**: Sistema nativo do sistema operacional
- **Espaçamento**: 8px base grid
- **Bordas**: 8px radius padrão

## 🔧 Personalização

Para adaptar à sua necessidade:

1. Modifique `src/data/mockData.ts` para seus dados reais
2. Ajuste as cores em `src/components/*.tsx`
3. Conecte com sua API backend (substitua os mocks)

## 📈 Próximos Passos (Roadmap)

- [ ] Autenticação de usuários
- [ ] Conexão com API REST
- [ ] Drag & drop para reordenar tarefas
- [ ] Gráficos de progresso do projeto
- [ ] Exportação para PDF/Excel
- [ ] Notificações em tempo real

## 📄 Licença

Desenvolvido para demonstração da arquitetura de dados normalizada.