import React from 'react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[] | undefined;
  columns: Column<T>[];
  keyExtractor?: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  striped?: boolean;
  hover?: boolean;
  bordered?: boolean;
  compact?: boolean;
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = 'Nenhum dado encontrado',
  loading = false,
  striped = true,
  hover = true,
  bordered = false,
  compact = false,
}: DataTableProps<T>) => {
  if (loading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '14px'
      }}>
        Carregando...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '14px'
      }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    keyExtractor &&
    <div style={{
      overflowX: 'auto',
      borderRadius: '8px',
      border: bordered ? '1px solid var(--text-primary)' : 'none',
      backgroundColor: 'white',
      boxShadow: bordered ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: compact ? '13px' : '14px',
        minWidth: '600px'
      }}>
        <thead>
          <tr style={{
            backgroundColor: 'var(--bg-card)',
            borderBottom: '2px solid var(--text-primary)'
          }}>
            {columns.map((column, index) => (
              <th
                key={index}
                style={{
                  padding: compact ? '12px 16px' : '16px 24px',
                  textAlign: column.align || 'left',
                  fontWeight: 600,
                  color: '#333',
                  fontSize: compact ? '13px' : '14px',
                  whiteSpace: 'nowrap',
                  width: column.width || 'auto'
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr
              key={keyExtractor(item)}
              onClick={(e) => {
                // Não acionar onRowClick se o clique veio de um botão ou elemento que previne o clique
                const target = e.target as HTMLElement;
                
                // Verificar se o clique veio de qualquer elemento interativo
                const interactiveElement = target.closest('button, a, input, select, textarea, [role="button"], [tabindex]');
                const hasPreventClick = target.closest('[data-prevent-row-click]') !== null || 
                                       target.closest('.prevent-row-click') !== null;
                
                // Se for um elemento interativo OU tiver atributo/classe de prevenção, não aciona onRowClick
                if (interactiveElement || hasPreventClick) {
                  return;
                }
                
                if (onRowClick) {
                  onRowClick(item);
                }
              }}
              style={{
                backgroundColor: striped && rowIndex % 2 === 0 ? 'var(--bg-card)' : 'white',
                borderBottom: '1px solid var(--text-primary)',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: hover ? 'all 0.2s ease' : 'none'
              }}
              onMouseEnter={(e) => {
                if (hover) {
                  e.currentTarget.style.backgroundColor = onRowClick ? '#f5f8ff' : 'var(--bg-card)';
                }
              }}
              onMouseLeave={(e) => {
                if (hover) {
                  e.currentTarget.style.backgroundColor = striped && rowIndex % 2 === 0 ? 'var(--bg-card)' : 'white';
                }
              }}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  style={{
                    padding: compact ? '12px 16px' : '16px 24px',
                    textAlign: column.align || 'left',
                    color: '#333',
                    fontSize: compact ? '13px' : '14px',
                    borderBottom: '1px solid var(--text-primary)',
                    verticalAlign: 'top'
                  }}
                >
                  {column.render
                    ? column.render(item)
                    : typeof column.key === 'string' && column.key.includes('.')
                      ? column.key.split('.').reduce((obj: any, key: string) => obj?.[key], item)
                      : item[column.key as keyof T]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;