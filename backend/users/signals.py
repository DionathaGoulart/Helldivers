from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
from decouple import config
from django.contrib.auth import get_user_model

User = get_user_model()


@receiver(post_migrate)
def setup_social_auth(sender, **kwargs):
    """
    Configura automaticamente Site e Google OAuth após as migrations
    """
    # Só executa para o app 'users' (evita executar múltiplas vezes)
    if sender.name != 'users':
        return

    if kwargs.get('plan'):  # Skip during dry-run
            return
    
    print("\n   Configurando Site e Google OAuth...")
    
    # 1. Configura o Site
    site, created = Site.objects.update_or_create(
        id=1,
        defaults={
            'domain': 'localhost:8000',
            'name': 'Local Development'
        }
    )
    
    if created:
        print("   Site criado")
    else:
        print("   Site atualizado")
    
    # 2. Pega credenciais do .env
    google_client_id = config('GOOGLE_CLIENT_ID', default='')
    google_secret = config('GOOGLE_SECRET', default='')
    
    if not google_client_id or not google_secret:
        print("   GOOGLE_CLIENT_ID ou GOOGLE_SECRET não encontrados no .env")
        print("   Configure essas variáveis para habilitar login com Google\n")
        return
    
    # 3. Configura o Google Social App
    social_app, created = SocialApp.objects.update_or_create(
        provider='google',
        defaults={
            'name': 'Google OAuth',
            'client_id': google_client_id,
            'secret': google_secret,
        }
    )
    
    # 4. Associa o Site ao Social App
    if site not in social_app.sites.all():
        social_app.sites.add(site)
    
    if created:
        print("   Google OAuth criado")
    else:
        print("   Google OAuth atualizado")
    
    print("   Configuração concluída!\n")
    
    # 5. Criar usuário superadmin se não existir
    print("   Verificando usuário superadmin...")
    if not User.objects.filter(username='good').exists():
        try:
            admin_user = User.objects.create_user(
                username='good',
                email='dionatha.work@gmail.com',
                password='12345',
                is_superuser=True,
                is_staff=True,
                first_name='Good',
                last_name='User'
            )
            print("   Usuário superadmin 'good' criado")
            print("   Username: good")
            print("   Email: dionatha.work@gmail.com")
            print("   Password: 12345")
        except Exception as e:
            print(f"   Erro ao criar usuário superadmin: {e}")
    else:
        print("   Usuário superadmin 'good' já existe\n")