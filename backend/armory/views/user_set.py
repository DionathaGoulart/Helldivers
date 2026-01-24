from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q, F
from armory.models import UserSet
from armory.serializers import UserSetSerializer

class UserSetViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar sets criados por usuários.
    
    list:
    Retorna lista de sets.
    - Se ?mode=community: Retorna todos os sets públicos
    - Caso contrário: Retorna apenas os sets do usuário logado
    """
    serializer_class = UserSetSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'user__username']
    ordering_fields = ['created_at', 'likes_count', 'favorites_count']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        mode = self.request.query_params.get('mode')
        ordering_param = self.request.query_params.get('ordering')
        
        if mode == 'community':
            # Comunidade: Apenas sets públicos
            queryset = UserSet.objects.filter(is_public=True).annotate(
                likes_count=Count('likes', distinct=True),
                favorites_count=Count('favorites', distinct=True)
            ).select_related('user', 'helmet', 'armor', 'cape')

            # Ordenação Customizada
            if ordering_param == 'random':
                return queryset.order_by('?')
            elif ordering_param == 'smart' or not ordering_param:
                # Smart Sort: Combinação de Likes, Favoritos e Recência
                # Exemplo simples: (likes * 2) + (favorites * 3)
                # Idealmente isso seria mais complexo ou feito no frontend, mas vamos simplificar
                # Por enquanto vamos ordenar por popularidade geral (likes + favs)
                return queryset.annotate(
                    popularity=F('likes_count') + F('favorites_count')
                ).order_by('-popularity', '-created_at')
            
            return queryset
        elif mode == 'favorites':
            # Meus Favoritos: Sets públicos que o usuário favoritou
            return UserSet.objects.filter(is_public=True, favorites=user).annotate(
                likes_count=Count('likes', distinct=True),
                favorites_count=Count('favorites', distinct=True)
            ).select_related('user', 'helmet', 'armor', 'cape')
        else:
            # Meus Sets: Apenas sets do usuário (públicos ou privados)
            return UserSet.objects.filter(user=user).annotate(
                likes_count=Count('likes', distinct=True),
                favorites_count=Count('favorites', distinct=True)
            ).select_related('user', 'helmet', 'armor', 'cape')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Permitir se for o dono OU se for staff/superuser
        if instance.user != request.user and not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"detail": "You do not have permission to delete this set."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Toggle like no set"""
        user_set = self.get_object()
        user = request.user
        
        if user in user_set.likes.all():
            user_set.likes.remove(user)
            liked = False
        else:
            user_set.likes.add(user)
            liked = True
            
        return Response({
            'status': 'success',
            'liked': liked,
            'total_likes': user_set.likes.count()
        })

    @action(detail=True, methods=['post'])
    def favorite(self, request, pk=None):
        """Toggle favorite no set"""
        user_set = self.get_object()
        user = request.user
        
        if user in user_set.favorites.all():
            user_set.favorites.remove(user)
            favorited = False
        else:
            user_set.favorites.add(user)
            favorited = True
            
        return Response({
            'status': 'success',
            'favorited': favorited
        })
