import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getBackendBaseUrl } from '../config/api';

interface SSEEvent {
  type: string;
  data: any;
}

interface SSEContextType {
  events: SSEEvent[];
  lastEvent: SSEEvent | null;
  isConnected: boolean;
  addEventListener: (eventType: string, callback: (data: any) => void) => void;
  removeEventListener: (eventType: string, callback: (data: any) => void) => void;
}

const SSEContext = createContext<SSEContextType | undefined>(undefined);

export const useSSE = () => {
  const context = useContext(SSEContext);
  if (!context) {
    throw new Error('useSSE must be used within an SSEProvider');
  }
  return context;
};

interface SSEProviderProps {
  children: React.ReactNode;
}

export const SSEProvider: React.FC<SSEProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [eventListeners, setEventListeners] = useState<Map<string, Set<(data: any) => void>>>(new Map());

  const addEventListener = useCallback((eventType: string, callback: (data: any) => void) => {
    setEventListeners(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(eventType)) {
        newMap.set(eventType, new Set());
      }
      newMap.get(eventType)!.add(callback);
      return newMap;
    });
  }, []);

  const removeEventListener = useCallback((eventType: string, callback: (data: any) => void) => {
    setEventListeners(prev => {
      const newMap = new Map(prev);
      const callbacks = newMap.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          newMap.delete(eventType);
        }
      }
      return newMap;
    });
  }, []);

  useEffect(() => {
    const backendUrl = getBackendBaseUrl();
    const sseUrl = `${backendUrl}/api/sse/events`;
    console.log(`🔌 SSEProvider: Conectando ao SSE em: ${sseUrl}`);
    
    const eventSource = new EventSource(sseUrl);
    
    eventSource.onopen = () => {
      console.log('✅ SSEProvider: Conexão SSE estabelecida');
      setIsConnected(true);
    };
    
    eventSource.onerror = (error) => {
      console.error('❌ SSEProvider: Erro na conexão SSE:', error);
      setIsConnected(false);
    };
    
    // Listen for all events
    eventSource.onmessage = (event) => {
      try {
        // Generic message handler
        console.log('📡 SSEProvider: Mensagem genérica recebida:', event.data);
      } catch (error) {
        console.error('❌ SSEProvider: Erro ao processar mensagem:', error);
      }
    };
    
    // Listen for specific events
    const handleEvent = (eventType: string) => (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log(`📡 SSEProvider: Evento ${eventType} recebido:`, data);
        console.log(`📡 SSEProvider: Callbacks registrados para ${eventType}:`, eventListeners.get(eventType)?.size || 0);
        
        // Update state
        const newEvent = { type: eventType, data };
        setEvents(prev => [...prev.slice(-9), newEvent]); // Keep last 10 events
        setLastEvent(newEvent);
        
        // Call registered listeners
        const callbacks = eventListeners.get(eventType);
        if (callbacks) {
          callbacks.forEach(callback => {
            try {
              callback(data);
            } catch (error) {
              console.error(`❌ SSEProvider: Erro no callback para ${eventType}:`, error);
            }
          });
        }
      } catch (error) {
        console.error(`❌ SSEProvider: Erro ao processar evento ${eventType}:`, error);
      }
    };
    
    // Listen for common events
    const eventTypes = [
      'task_created',
      'task_updated', 
      'task_deleted',
      'project_updated',
      'terminal_update',
      'agent_typing'
    ];
    
    eventTypes.forEach(eventType => {
      eventSource.addEventListener(eventType, handleEvent(eventType));
    });
    
    return () => {
      console.log('🔌 SSEProvider: Fechando conexão SSE');
      eventSource.close();
      setIsConnected(false);
    };
  }, [eventListeners]);

  const value: SSEContextType = {
    events,
    lastEvent,
    isConnected,
    addEventListener,
    removeEventListener
  };

  return (
    <SSEContext.Provider value={value}>
      {children}
    </SSEContext.Provider>
  );
};