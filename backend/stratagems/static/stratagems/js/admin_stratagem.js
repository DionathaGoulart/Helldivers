window.addEventListener('load', function () {
    (function ($) {
        $(document).ready(function () {
            /** 
             * Function to toggle visibility of Weapon Stats fieldset
             */
            function toggleWeaponStats() {
                // Check if 'Is Tertiary Weapon' is checked. 
                // Using vanilla JS selector because Django Admin standardizes IDs.
                const isTertiary = $('#id_is_tertiary_weapon').is(':checked');

                // The fieldset we want to toggle.
                // We will need to make sure the fieldset in admin.py has a class or we find it by content.
                // Django admin fieldsets usually have a class 'module' but we can target by the header text if we customize the admin template,
                // or simpler: target the fieldset that contains our specific fields. 
                // However, a robust way is to assign a class in admin.py if possible, or assume it's the second fieldset if we order them.

                // Ideally, we can look for the fieldset containing 'damage_value'.
                // Django wraps fields in .form-row.

                const weaponStatsRows = [
                    '.field-damage_value',
                    '.field-damage_type',
                    '.field-max_penetration',
                    '.field-capacity',
                    '.field-fire_rate',
                    '.field-dps',
                    '.field-spare_mags',
                    '.field-supply_box_refill',
                    '.field-ammo_box_refill'
                ];

                if (isTertiary) {
                    // Show all rows
                    weaponStatsRows.forEach(cls => $(cls).closest('.form-row').show());
                    // Also show the header if we have one. 
                    // Let's assume we put them in a separate fieldset named "Weapon Stats"
                    $('fieldset h2:contains("Weapon Stats")').closest('fieldset').show();
                } else {
                    // Hide all rows
                    weaponStatsRows.forEach(cls => $(cls).closest('.form-row').hide());
                    // Hide the header
                    $('fieldset h2:contains("Weapon Stats")').closest('fieldset').hide();
                }
            }

            // Bind to the change event
            $('#id_is_tertiary_weapon').change(toggleWeaponStats);

            // Run on load
            toggleWeaponStats();
        });
    })(django.jQuery);
});
