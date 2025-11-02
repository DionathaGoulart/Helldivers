/**
 * Utilitários para formatação de erros da API
 * Converte erros técnicos em mensagens amigáveis no tema Helldivers 2
 */

interface ApiError {
  response?: {
    data?: {
      detail?: string | string[];
      error?: string | string[];
      non_field_errors?: string[];
      [key: string]: string | string[] | undefined;
    };
  };
  message?: string;
}

/**
 * Mapeamento de erros técnicos para mensagens temáticas do Helldivers 2
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Erros de autenticação
  'Unable to log in with provided credentials.': 'CREDENCIAIS INVÁLIDAS. Suspeita de infiltração inimiga detectada.',
  'Impossível fazer login com as credenciais fornecidas.': 'CREDENCIAIS INVÁLIDAS. Suspeita de infiltração inimiga detectada.',
  'invalid': 'CREDENCIAIS INVÁLIDAS. Suspeita de infiltração inimiga detectada.',
  
  // Erros de permissão
  'You do not have permission to perform this action.': 'ACESSO NEGADO. Nível de autorização insuficiente para esta operação.',
  'Authentication credentials were not provided.': 'AUTENTICAÇÃO REQUERIDA. Autorize seu acesso para continuar, cidadão.',
  
  // Erros de validação
  'This field may not be blank.': 'CAMPO OBRIGATÓRIO. Preencha para servir a Democracia™.',
  'This field is required.': 'CAMPO OBRIGATÓRIO. Preencha para servir a Democracia™.',
  
  // Erros de rede
  'Network Error': 'FALHA DE COMUNICAÇÃO. Perda de conexão com a Gooddivers detectada.',
  'timeout': 'TEMPO ESGOTADO. A conexão com a Gooddivers expirou.',
  
  // Erros genéricos
  'Server Error': 'ERRO INTERNO. Falha no sistema da Gooddivers. Tente novamente.',
};

/**
 * Formata um erro da API em uma mensagem amigável no tema Helldivers 2
 * @param error - Erro da API
 * @param isLoginError - Se é erro de login (para mostrar mensagem específica)
 * @returns Mensagem formatada
 */
export function formatError(error: ApiError | unknown, isLoginError: boolean = false): string {
  if (!error) {
    if (isLoginError) {
      return 'CREDENCIAIS INVÁLIDAS. Verifique seu ID de Operativo ou Código de Autorização, cidadão.';
    }
    return 'FALHA NA OPERAÇÃO. Erro desconhecido detectado.';
  }

  // Se for uma string simples, retorna
  if (typeof error === 'string') {
    return formatErrorString(error, isLoginError);
  }

  // Se for um objeto de erro com response.data
  if (typeof error === 'object' && 'response' in error) {
    const apiError = error as ApiError;
    const errorData = apiError.response?.data;

    if (!errorData) {
      if (isLoginError) {
        return 'CREDENCIAIS INVÁLIDAS. Verifique seu ID de Operativo ou Código de Autorização, cidadão.';
      }
      return apiError.message || 'FALHA NA OPERAÇÃO. Erro desconhecido detectado.';
    }

    // Primeiro tenta detail
    if (errorData.detail) {
      const detail = Array.isArray(errorData.detail) 
        ? errorData.detail[0] 
        : errorData.detail;
      return formatErrorString(String(detail), isLoginError);
    }

    // Depois tenta error
    if (errorData.error) {
      const errorMsg = Array.isArray(errorData.error)
        ? errorData.error[0]
        : errorData.error;
      return formatErrorString(String(errorMsg), isLoginError);
    }

    // Tenta non_field_errors (erros gerais)
    if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors) && errorData.non_field_errors.length > 0) {
      return formatErrorString(String(errorData.non_field_errors[0]), isLoginError);
    }

    // Tenta outros campos de erro
    const errorFields = Object.entries(errorData)
      .filter(([key]) => !['detail', 'error'].includes(key))
      .filter(([, value]) => value !== undefined && value !== null);

    if (errorFields.length > 0) {
      const [, firstErrorValue] = errorFields[0];
      const errorMsg = Array.isArray(firstErrorValue)
        ? firstErrorValue[0]
        : firstErrorValue;
      return formatErrorString(String(errorMsg), isLoginError);
    }
  }

  // Se tiver message
  if (typeof error === 'object' && 'message' in error) {
    return formatErrorString(String((error as { message: string }).message), isLoginError);
  }

  // Se não conseguiu identificar o erro e é login, mostra mensagem específica
  if (isLoginError) {
    return 'CREDENCIAIS INVÁLIDAS. Verifique seu ID de Operativo ou Código de Autorização, cidadão.';
  }

  return 'FALHA NA OPERAÇÃO. Erro desconhecido detectado.';
}

/**
 * Formata uma string de erro específica
 * @param errorString - String de erro
 * @param isLoginError - Se é erro de login (para mostrar mensagem específica)
 * @returns Mensagem formatada
 */
function formatErrorString(errorString: string, isLoginError: boolean = false): string {
  // Limpa a string de caracteres especiais e estruturas JSON
  let cleaned = errorString.trim();
  
  // Remove estruturas JSON comuns
  cleaned = cleaned.replace(/\{'[^']+':\s*\[ErrorDetail\([^)]+\)\]\}/g, '');
  cleaned = cleaned.replace(/\{.*?\}/g, '');
  cleaned = cleaned.replace(/\[ErrorDetail\([^)]+\)\]/g, '');
  cleaned = cleaned.replace(/ErrorDetail\([^)]+\)/g, '');
  cleaned = cleaned.replace(/string=/g, '');
  cleaned = cleaned.replace(/code='[^']+'/g, '');
  cleaned = cleaned.trim();

  // Se ficou vazio e é erro de login, retorna mensagem específica
  if (!cleaned) {
    if (isLoginError) {
      return 'CREDENCIAIS INVÁLIDAS. Verifique seu ID de Operativo ou Código de Autorização, cidadão.';
    }
    return 'FALHA NA OPERAÇÃO. Erro desconhecido detectado.';
  }

  // Remove aspas extras
  cleaned = cleaned.replace(/^["']|["']$/g, '');

  // Verifica se já está no formato Helldivers
  if (cleaned.includes('CREDENCIAIS') || cleaned.includes('FALHA') || cleaned.includes('ERRO')) {
    return cleaned;
  }

  // Tenta encontrar mensagem mapeada
  const lowerError = cleaned.toLowerCase();
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (lowerError.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Se não encontrou, tenta melhorar a mensagem
  if (cleaned.includes('credential') || cleaned.includes('credencial')) {
    return 'CREDENCIAIS INVÁLIDAS. Suspeita de infiltração inimiga detectada.';
  }

  if (cleaned.includes('permission') || cleaned.includes('permissão')) {
    return 'ACESSO NEGADO. Nível de autorização insuficiente para esta operação.';
  }

  if (cleaned.includes('required') || cleaned.includes('obrigatório')) {
    return 'CAMPO OBRIGATÓRIO. Preencha para servir a Democracia™.';
  }

  // Se é erro de login e não conseguiu identificar, retorna mensagem específica
  if (isLoginError) {
    return 'CREDENCIAIS INVÁLIDAS. Verifique seu ID de Operativo ou Código de Autorização, cidadão.';
  }

  // Retorna a mensagem limpa em maiúsculas com prefixo
  return `FALHA NA OPERAÇÃO. ${cleaned.toUpperCase()}.`;
}

/**
 * Formata erros de campo específicos
 * @param fieldErrors - Objeto com erros por campo
 * @returns Objeto formatado com erros por campo
 */
export function formatFieldErrors(fieldErrors: Record<string, string | string[]>): Record<string, string> {
  const formatted: Record<string, string> = {};

  for (const [field, error] of Object.entries(fieldErrors)) {
    if (Array.isArray(error)) {
      formatted[field] = formatErrorString(error[0] || '');
    } else {
      formatted[field] = formatErrorString(error);
    }
  }

  return formatted;
}

