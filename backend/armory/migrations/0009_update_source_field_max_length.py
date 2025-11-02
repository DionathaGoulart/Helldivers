# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('armory', '0008_add_pt_br_translations'),
    ]

    operations = [
        migrations.AlterField(
            model_name='armor',
            name='source',
            field=models.CharField(
                choices=[
                    ('store', 'Loja'),
                    ('pass', 'Passe'),
                    ('others', 'Outros'),
                    ('starter_equipment', 'Starter Equipment'),
                    ('pre_order_bonus', 'Pre-Order Bonus'),
                    ('super_citizen_edition', 'Super Citizen Edition'),
                    ('downloadable_content', 'Downloadable Content'),
                    ('escalation_of_freedom', 'Escalation of Freedom'),
                    ('liberty_day', 'Liberty Day'),
                    ('anniversary_gift', 'Anniversary Gift'),
                    ('helldivers_killzone', 'Helldivers x Killzone'),
                    ('malevelon_creek_memorial', 'Malevelon Creek Memorial Day'),
                    ('heart_of_democracy', 'Heart of Democracy'),
                    ('social_media_mo', 'Social Media MO'),
                    ('ministry_of_prosperity', 'Ministry of Prosperity'),
                    ('station_81', 'Station-81'),
                ],
                default='store',
                max_length=30,
                verbose_name='Fonte de Aquisição'
            ),
        ),
        migrations.AlterField(
            model_name='cape',
            name='source',
            field=models.CharField(
                choices=[
                    ('store', 'Loja'),
                    ('pass', 'Passe'),
                    ('others', 'Outros'),
                    ('starter_equipment', 'Starter Equipment'),
                    ('pre_order_bonus', 'Pre-Order Bonus'),
                    ('super_citizen_edition', 'Super Citizen Edition'),
                    ('downloadable_content', 'Downloadable Content'),
                    ('escalation_of_freedom', 'Escalation of Freedom'),
                    ('liberty_day', 'Liberty Day'),
                    ('anniversary_gift', 'Anniversary Gift'),
                    ('helldivers_killzone', 'Helldivers x Killzone'),
                    ('malevelon_creek_memorial', 'Malevelon Creek Memorial Day'),
                    ('heart_of_democracy', 'Heart of Democracy'),
                    ('social_media_mo', 'Social Media MO'),
                    ('ministry_of_prosperity', 'Ministry of Prosperity'),
                    ('station_81', 'Station-81'),
                ],
                default='store',
                max_length=30,
                verbose_name='Fonte de Aquisição'
            ),
        ),
        migrations.AlterField(
            model_name='helmet',
            name='source',
            field=models.CharField(
                choices=[
                    ('store', 'Loja'),
                    ('pass', 'Passe'),
                    ('others', 'Outros'),
                    ('starter_equipment', 'Starter Equipment'),
                    ('pre_order_bonus', 'Pre-Order Bonus'),
                    ('super_citizen_edition', 'Super Citizen Edition'),
                    ('downloadable_content', 'Downloadable Content'),
                    ('escalation_of_freedom', 'Escalation of Freedom'),
                    ('liberty_day', 'Liberty Day'),
                    ('anniversary_gift', 'Anniversary Gift'),
                    ('helldivers_killzone', 'Helldivers x Killzone'),
                    ('malevelon_creek_memorial', 'Malevelon Creek Memorial Day'),
                    ('heart_of_democracy', 'Heart of Democracy'),
                    ('social_media_mo', 'Social Media MO'),
                    ('ministry_of_prosperity', 'Ministry of Prosperity'),
                    ('station_81', 'Station-81'),
                ],
                default='store',
                max_length=30,
                verbose_name='Fonte de Aquisição'
            ),
        ),
    ]

