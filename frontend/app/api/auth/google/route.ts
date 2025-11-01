import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

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
              const response = await fetch('${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/google/callback/', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include', // Enviar e receber cookies
                body: JSON.stringify({
                  code: '${code}',
                  redirect_uri: '${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/google'
                })
              });

              const data = await response.json();
              
              // Tokens são gerenciados via cookies HttpOnly pelo servidor
              // Verificamos apenas se o usuário foi retornado (login bem-sucedido)
              if (data.user) {
                // Redirecionar para armory
                // Os cookies já foram definidos automaticamente pelo servidor
                window.location.href = '/armory';
              } else {
                throw new Error('Login failed');
              }
            } catch (error) {
              // Erro OAuth
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

