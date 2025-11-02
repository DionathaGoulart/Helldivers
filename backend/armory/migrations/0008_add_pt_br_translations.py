# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('armory', '0007_passive_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='armor',
            name='name_pt_br',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='Nome (PT-BR)'),
        ),
        migrations.AddField(
            model_name='helmet',
            name='name_pt_br',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='Nome (PT-BR)'),
        ),
        migrations.AddField(
            model_name='cape',
            name='name_pt_br',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='Nome (PT-BR)'),
        ),
        migrations.AddField(
            model_name='battlepass',
            name='name_pt_br',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='Nome do Passe (PT-BR)'),
        ),
        migrations.AddField(
            model_name='armorset',
            name='name_pt_br',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='Nome do Set (PT-BR)'),
        ),
        migrations.AddField(
            model_name='passive',
            name='name_pt_br',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='Nome (PT-BR)'),
        ),
        migrations.AddField(
            model_name='passive',
            name='description_pt_br',
            field=models.TextField(blank=True, null=True, verbose_name='Descrição (PT-BR)'),
        ),
        migrations.AddField(
            model_name='passive',
            name='effect_pt_br',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='Efeito Prático (PT-BR)'),
        ),
    ]

