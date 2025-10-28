import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  // Função para obter a mensagem personalizada
  const getValidationMessage = (required: boolean | undefined, type: string | undefined) => {
    if (!required) return undefined;
    
    if (type === 'email') {
      return 'Por favor, insira um email válido';
    }
    
    return 'Por favor, preencha este campo';
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300'
        } ${className}`}
        {...props}
        onInvalid={(e) => {
          const target = e.target as HTMLInputElement;
          if (props.required && target.validity.valueMissing) {
            const message = getValidationMessage(props.required, props.type) || 'Por favor, preencha este campo';
            target.setCustomValidity(message);
          }
        }}
        onInput={(e) => {
          const target = e.target as HTMLInputElement;
          target.setCustomValidity('');
        }}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

