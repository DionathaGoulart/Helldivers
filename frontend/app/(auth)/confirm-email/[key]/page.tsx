'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ConfirmEmailPage() {
  const router = useRouter();
  const params = useParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirmando email...');

  useEffect(() => {
    const confirmEmail = async () => {
      const key = params?.key as string;

      if (!key) {
        setStatus('error');
        setMessage('Link inválido');
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/verify-email/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key }),
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            setStatus('success');
            setMessage(data.detail || 'Email confirmado com sucesso!');
          } else {
            setStatus('success');
            setMessage('Email confirmado com sucesso!');
          }
          // Redirecionar para dashboard após 2 segundos
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          const contentType = response.headers.get('content-type');
          let errorMessage = 'Erro ao confirmar email';
          
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.error('Erro ao confirmar email:', data);
            errorMessage = data.detail || data.error || errorMessage;
          } else {
            const text = await response.text();
            console.error('Resposta não-JSON:', text);
            errorMessage = `Erro ${response.status}: ${response.statusText}`;
          }
          
          setStatus('error');
          setMessage(errorMessage);
        }
      } catch (error) {
        console.error('Erro na requisição:', error);
        setStatus('error');
        setMessage('Erro ao confirmar email. Tente novamente.');
      }
    };

    confirmEmail();
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center py-6">
          {status === 'loading' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Confirmando...</h3>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Email Confirmado!</h3>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecionando...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Erro na Confirmação</h3>
              <p className="text-gray-600 mb-4">{message}</p>
              <Button onClick={() => router.push('/dashboard')} fullWidth>
                Ir para Dashboard
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

