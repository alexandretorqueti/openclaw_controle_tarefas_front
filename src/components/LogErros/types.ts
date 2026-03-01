export interface ErrorLog {
  id: string;
  timestamp: string;
  level: string;
  endpoint: string;
  method: string;
  statusCode: number;
  message: string;
  errorType: string;
  stackTrace: string;
  requestBody: string | Record<string, any>;
  requestQuery: string | Record<string, any>;
  requestParams: string | Record<string, any>;
  headers: string | Record<string, any>;
  clientIp: string;
  userId: string | null;
  correlationId: string;
  parentLogId: string | null;
  responseTime: number;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface LogErrosProps {
  onBack?: () => void;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface LogFilters {
  dateRange: DateRange;
  level?: string;
  statusCode?: number;
  searchTerm?: string;
}

export interface LogDetailsModalProps {
  log: ErrorLog | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

export interface LogListProps {
  logs: ErrorLog[];
  loading: boolean;
  onLogClick: (log: ErrorLog) => void;
  emptyMessage?: string;
}

export interface LogItemProps {
  log: ErrorLog;
  onClick: () => void;
}

export interface LogFiltersProps {
  filters: LogFilters;
  onFiltersChange: (filters: LogFilters) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}