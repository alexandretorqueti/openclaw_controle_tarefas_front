import React from 'react';
import LogErros from './LogErros/LogErros';

// Este é um wrapper simples que exporta o componente refatorado
// Mantém compatibilidade com imports existentes
const LogErrosWrapper: React.FC<{ onBack?: () => void }> = (props) => {
  return <LogErros {...props} />;
};

export default LogErrosWrapper;