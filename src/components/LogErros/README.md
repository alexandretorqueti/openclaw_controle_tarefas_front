# LogErros Component - Refatoração

Esta é uma refatoração do componente LogErros.tsx original (730 linhas) em uma estrutura modular e organizada.

## Estrutura de Arquivos

```
LogErros/
├── index.ts                    # Exportações principais
├── LogErros.tsx               # Componente principal (container)
├── LogList.tsx                # Lista de logs
├── LogItem.tsx                # Item individual de log
├── LogDetailsModal.tsx        # Modal de detalhes
├── LogFilters.tsx             # Filtros e controles
├── types.ts                   # Tipos TypeScript
├── utils.ts                   # Funções utilitárias
├── styles.css                 # Estilos CSS
├── hooks/
│   ├── useLogs.ts            # Hook para gerenciamento de logs
│   └── useAutoRefresh.ts     # Hook para auto-refresh
└── README.md                  # Esta documentação
```

## Benefícios da Refatoração

1. **Separação de Responsabilidades**: Cada componente tem uma única responsabilidade
2. **Reutilização**: Componentes podem ser reutilizados em outras partes da aplicação
3. **Manutenibilidade**: Código mais fácil de entender e modificar
4. **Testabilidade**: Componentes menores são mais fáceis de testar
5. **Performance**: Melhor controle de re-renderizações com hooks personalizados

## Como Usar

### Importação do Componente Principal

```tsx
import LogErros from './components/LogErros/LogErros';

// No seu componente
<LogErros onBack={() => navigate('/dashboard')} />
```

### Importação de Componentes Individuais

```tsx
import { LogList, LogFilters, useLogs } from './components/LogErros';

// Usar hooks personalizados
const { logs, loading, fetchErrorLogs } = useLogs();
```

## Componentes

### LogErros (Principal)
- Container principal que orquestra todos os subcomponentes
- Gerencia estado global e comunicação entre componentes
- Responsável por fetch inicial e configurações

### LogList
- Exibe lista de logs
- Gerencia estados de loading e empty
- Recebe lista de logs e callback para clique

### LogItem
- Item individual de log
- Estilização baseada no nível do log (ERROR, WARN, INFO, DEBUG)
- Botão para abrir detalhes

### LogDetailsModal
- Modal com detalhes completos do log
- Formatação de JSON para request body e headers
- Botões para copiar informações

### LogFilters
- Filtros avançados para logs
- Filtro por data, nível, status code e busca textual
- Botões para aplicar e resetar filtros

## Hooks Personalizados

### useLogs
Gerencia estado e lógica de fetch de logs:
- Estado: logs, loading, error, lastUpdated, isRefreshing
- Métodos: fetchErrorLogs, setLogs, setError

### useAutoRefresh
Gerencia auto-refresh com polling:
- Estado: autoRefresh
- Configuração: intervalo de 5 minutos
- Cleanup automático

## Estilos

Todos os estilos estão centralizados em `styles.css` com:
- Classes bem organizadas por componente
- Cores temáticas (dark theme)
- Responsividade básica
- Animações sutis

## Migração do Componente Original

Para migrar do componente original para esta estrutura:

1. Substitua o arquivo `LogErros.tsx` original pelo novo
2. Copie a pasta `LogErros/` para `src/components/`
3. Atualize imports se necessário
4. Teste todas as funcionalidades

## Próximos Passos Possíveis

1. Adicionar testes unitários para cada componente
2. Implementar virtualização para listas grandes
3. Adicionar mais filtros avançados
4. Implementar exportação em diferentes formatos (CSV, XML)
5. Adicionar gráficos de análise de erros