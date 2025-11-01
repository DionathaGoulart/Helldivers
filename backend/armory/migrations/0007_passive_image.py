# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('armory', '0006_battlepass_armor_pass_field_cape_pass_field_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='passive',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='passives/', verbose_name='Imagem'),
        ),
    ]

