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
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
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
        color: '#6c757d',
        fontSize: '14px'
      }}>
        Carregando...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#6c757d',
        fontSize: '14px'
      }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{
      overflowX: 'auto',
      borderRadius: '8px',
      border: bordered ? '1px solid #e0e0e0' : 'none',
      backgroundColor: '#fff',
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
            backgroundColor: '#f8f9fa',
            borderBottom: '2px solid #e0e0e0'
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
                const isButton = target.tagName === 'BUTTON' || 
                                 target.closest('button') !== null ||
                                 target.closest('[data-prevent-row-click]') !== null ||
                                 target.closest('.prevent-row-click') !== null ||
                                 target.tagName === 'svg' || 
                                 target.closest('svg') !== null ||
                                 target.closest('[role="img"]') !== null;
                
                if (!isButton && onRowClick) {
                  onRowClick(item);
                }
              }}
              style={{
                backgroundColor: striped && rowIndex % 2 === 0 ? '#fafafa' : '#fff',
                borderBottom: '1px solid #f0f0f0',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: hover ? 'all 0.2s ease' : 'none'
              }}
              onMouseEnter={(e) => {
                if (hover) {
                  e.currentTarget.style.backgroundColor = onRowClick ? '#f5f8ff' : '#f9f9f9';
                }
              }}
              onMouseLeave={(e) => {
                if (hover) {
                  e.currentTarget.style.backgroundColor = striped && rowIndex % 2 === 0 ? '#fafafa' : '#fff';
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
                    borderBottom: '1px solid #f0f0f0',
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