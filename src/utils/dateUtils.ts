/**
 * Utilitários para manipulação segura de datas
 */

/**
 * Parse seguro de string para Date
 * Retorna null se a string for inválida
 */
export function safeParseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date : null;
  } catch (error) {
    console.error('Erro ao parsear data:', dateString, error);
    return null;
  }
}

/**
 * Formata uma data de forma segura
 * Retorna string vazia se a data for inválida
 */
export function safeFormatDate(
  dateString: string | null | undefined, 
  formatStr: string, 
  options?: { locale?: any }
): string {
  const date = safeParseDate(dateString);
  if (!date) return '';
  
  try {
    // Formato simples sem date-fns para evitar problemas de importação
    if (formatStr.includes('dd/MM/yyyy')) {
      if (formatStr.includes('HH:mm')) {
        // dd/MM/yyyy HH:mm
        return date.toLocaleString('pt-BR');
      } else if (formatStr.includes("'às' HH:mm")) {
        // dd/MM/yyyy 'às' HH:mm
        return date.toLocaleString('pt-BR');
      } else if (formatStr.includes("'às' HH:mm:ss")) {
        // dd/MM/yyyy 'às' HH:mm:ss
        return date.toLocaleString('pt-BR', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      } else {
        // dd/MM/yyyy simples
        return date.toLocaleDateString('pt-BR');
      }
    } else if (formatStr.includes("dd 'de' MMMM 'de' yyyy")) {
      const months = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
      ];
      const day = date.getDate().toString().padStart(2, '0');
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      if (formatStr.includes("'às' HH:mm")) {
        // dd 'de' MMMM 'de' yyyy 'às' HH:mm
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day} de ${month} de ${year} às ${hours}:${minutes}`;
      } else {
        // dd 'de' MMMM 'de' yyyy simples
        return `${day} de ${month} de ${year}`;
      }
    }
    
    // Fallback padrão
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('Erro ao formatar data:', dateString, error);
    return '';
  }
}

/**
 * Formata uma data para exibição local (pt-BR) de forma segura
 */
export function safeToLocaleDateString(dateString: string | null | undefined): string {
  const date = safeParseDate(dateString);
  return date ? date.toLocaleDateString('pt-BR') : '';
}

/**
 * Formata uma data e hora para exibição local (pt-BR) de forma segura
 */
export function safeToLocaleString(dateString: string | null | undefined): string {
  const date = safeParseDate(dateString);
  return date ? date.toLocaleString('pt-BR') : '';
}

/**
 * Verifica se uma data está no passado
 */
export function isDateInPast(dateString: string | null | undefined): boolean {
  const date = safeParseDate(dateString);
  if (!date) return false;
  return date < new Date();
}

/**
 * Verifica se uma data está no futuro
 */
export function isDateInFuture(dateString: string | null | undefined): boolean {
  const date = safeParseDate(dateString);
  if (!date) return false;
  return date > new Date();
}