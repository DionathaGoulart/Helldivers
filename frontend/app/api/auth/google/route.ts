import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Determinar a URL base automaticamente a partir da requisição
  const url = new URL(request.url);
  // Priorizar o host da requisição atual para garantir que o redirect_uri coincida
  // com o que o navegador usou para iniciar o fluxo OAuth (window.location.origin)
  const baseUrl = `${url.protocol}//${url.host}`;

  if (error) {
    return NextResponse.redirect(new URL('/login?error=access_denied', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  // Criar página HTML que processa o callback
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Autenticando...</title>
      </head>
      <body>
        <script>
          // Enviar código para o backend
          (async () => {
            try {
              // Usar URL relativa para aproveitar o proxy do Next.js (rewrites)
              // Isso resolve problemas de CORS e Cookies (SameSite)
              const apiUrl = '';
              const redirectUri = '${baseUrl}/api/auth/google';
              
              console.log('🔐 Iniciando autenticação OAuth');
              console.log('API URL (proxy relative):', apiUrl || '/');
              console.log('Redirect URI:', redirectUri);
              
              const response = await fetch('/api/v1/auth/google/callback/', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include', // Enviar e receber cookies
                body: JSON.stringify({
                  code: '${code}',
                  redirect_uri: redirectUri
                })
              });

              console.log('📥 Resposta recebida:', response.status, response.statusText);

              // Verifica se a resposta é OK antes de fazer parse JSON
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
                console.error('❌ Erro do backend:', errorData);
                throw new Error(\`Erro do servidor: \${response.status} - \${JSON.stringify(errorData)}\`);
              }

              const data = await response.json();
              console.log('✅ Dados recebidos:', data);
              
              // Tokens são gerenciados via cookies HttpOnly pelo servidor
              // Verificamos apenas se o usuário foi retornado (login bem-sucedido)
              if (data.user) {
                console.log('✅ Login bem-sucedido, redirecionando para /armory');
                // Redirecionar para armory
                // Os cookies já foram definidos automaticamente pelo servidor
                window.location.href = '/armory';
              } else {
                console.error('❌ Login falhou: sem dados de usuário', data);
                throw new Error('Login failed: no user data');
              }
            } catch (error) {
              // Erro OAuth - logar para debug
              console.error('❌ Erro OAuth completo:', error);
              window.location.href = '/login?error=oauth_failed';
            }
          })();
        </script>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

