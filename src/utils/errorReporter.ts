export interface ErrorData {
  type: string;
  message: string;
  stack?: string;
  line?: number;
  col?: number;
}

// Chave que usaremos para salvar os erros na "gaveta" do navegador
const STORAGE_KEY = '@app:pending_errors';

/**
 * Tenta enviar a fila de erros que ficaram presos no localStorage
 */
export const flushPendingErrors = async (): Promise<void> => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) return; // Nada pendente

    const pendingErrors = JSON.parse(existing);
    if (!Array.isArray(pendingErrors) || pendingErrors.length === 0) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    // Limpamos a gaveta primeiro para evitar envios duplicados se a função rodar duas vezes rápido
    localStorage.removeItem(STORAGE_KEY);
    
    const failedAgain = [];

    // Tenta enviar um por um
    for (const errorPayload of pendingErrors) {
      try {
        const response = await fetch(`${apiUrl}/error/frontend-errors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorPayload)
        });

        if (!response.ok) throw new Error('Backend rejeitou o erro');
      } catch (e) {
        // Se falhou de novo, devolvemos pra fila de falhas
        failedAgain.push(errorPayload);
      }
    }

    // Se sobrou algum que falhou de novo, guardamos de volta no localStorage
    if (failedAgain.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(failedAgain));
    } else {
      console.log('Todos os erros pendentes foram sincronizados com sucesso!');
    }
  } catch (err) {
    console.error('Erro ao processar fila de erros pendentes', err);
  }
};

/**
 * Salva um erro localmente quando a API está fora do ar
 */
const saveErrorLocally = (payload: any) => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const errors = existing ? JSON.parse(existing) : [];
    errors.push(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(errors));
  } catch (err) {
    console.error('Falha ao salvar erro no localStorage', err);
  }
};

/**
 * Envia os detalhes de um erro para o backend ou salva localmente em caso de falha.
 */
export const reportErrorToBackend = async (errorData: ErrorData): Promise<void> => {
  const payload = {
    ...errorData,
    url: window.location.href,
    userAgent: navigator.userAgent,
    // Adicionamos a data exata do erro, pois ele pode ser enviado dias depois
    timestamp: new Date().toISOString() 
  };

  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    const response = await fetch(`${apiUrl}/error/frontend-errors`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Se o backend retornou erro 500, nós tratamos como falha para salvar localmente
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    // Se o envio deu certo, aproveitamos para ver se tem erros antigos na gaveta para enviar junto!
    flushPendingErrors();

  } catch (e) {
    console.warn('API indisponível, salvando erro localmente para envio futuro...');
    saveErrorLocally(payload);
  }
};