from rest_framework import serializers
from armory.models import Passive


class PassiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passive
        fields = ['id', 'name', 'name_pt_br', 'description', 'description_pt_br', 'effect', 'effect_pt_br', 'image']
    
    def to_representation(self, instance):
        """Garante que a URL da imagem seja retornada corretamente"""
        representation = super().to_representation(instance)
        
        # Processar o campo image se houver
        if instance and hasattr(instance, 'image') and instance.image:
            request = self.context.get('request')
            if request:
                # Construir URL absoluta se tiver request no contexto
                try:
                    representation['image'] = request.build_absolute_uri(instance.image.url)
                except:
                    representation['image'] = instance.image.url
            else:
                # Se não tiver request, usar a URL relativa
                representation['image'] = instance.image.url if instance.image else None
        
        return representation