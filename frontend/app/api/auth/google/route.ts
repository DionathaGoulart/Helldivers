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
                body: JSON.stringify({
                  code: '${code}',
                  redirect_uri: '${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/google'
                })
              });

              const data = await response.json();
              
              if (data.access && data.refresh) {
                // Armazenar tokens
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                
                // Redirecionar para dashboard
                window.location.href = '/dashboard';
              } else {
                throw new Error('No tokens received');
              }
            } catch (error) {
              console.error('OAuth error:', error);
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

