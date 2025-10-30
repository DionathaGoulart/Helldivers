from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('armory', '0003_alter_armor_source_alter_cape_source_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='armor',
            name='armor',
            field=models.IntegerField(verbose_name='Classificação da armadura'),
        ),
        migrations.AlterField(
            model_name='armor',
            name='speed',
            field=models.IntegerField(verbose_name='Velocidade'),
        ),
        migrations.AlterField(
            model_name='armor',
            name='stamina',
            field=models.IntegerField(verbose_name='Regeneração de Resistência'),
        ),
    ]


