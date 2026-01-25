from django.db import models


class GlobalVersion(models.Model):
    """
    Rastreia a versão global dos dados para invalidação de cache.
    Sempre que um modelo monitorado é atualizado, o updated_at é renovado.
    """
    resource = models.CharField(max_length=100, default='global', unique=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.resource}: {self.updated_at}"
