/**
 * Script to show/hide 'acquisition_source' and 'warbond' fields based on 'source' value.
 * Logic:
 * - If source == 'other' -> Show 'acquisition_source', Hide 'warbond'
 * - If source == 'warbond' -> Show 'warbond', Hide 'acquisition_source'
 * - Else -> Hide both
 */
(function ($) {
    'use strict';

    function toggleFields() {
        var sourceSelect = $('#id_source');
        if (!sourceSelect.length) {
            return;
        }

        var sourceValue = sourceSelect.val();
        var acquisitionRow = $('.field-acquisition_source');
        var warbondRow = $('.field-warbond');

        // Handle Acquisition Source (only for 'other')
        if (sourceValue === 'other') {
            acquisitionRow.show();
        } else {
            acquisitionRow.hide();
            // Optional: clear value if needed, but safer to just hide
            // acquisitionRow.find('select').val(''); 
        }

        // Handle Warbond (only for 'warbond')
        if (sourceValue === 'warbond') {
            warbondRow.show();
        } else {
            warbondRow.hide();
            // warbondRow.find('select').val('');
        }
    }

    $(document).ready(function () {
        toggleFields();
        $('#id_source').on('change', toggleFields);
    });

    // Also run on window load to ensure everything is rendered
    $(window).on('load', function () {
        toggleFields();
    });

})(django.jQuery || jQuery);
