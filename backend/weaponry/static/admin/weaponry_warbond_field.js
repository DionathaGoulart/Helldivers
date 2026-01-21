/**
 * Script para mostrar/esconder o campo warbond baseado na fonte de aquisição
 * Funciona para PrimaryWeapon, SecondaryWeapon e Throwable
 */
(function ($) {
    'use strict';

    /**
     * Mostra ou esconde o campo warbond baseado no valor de source
     */
    function toggleWarbondField() {
        var sourceField = $('#id_source');
        var warbondFieldSelect = $('#id_warbond');

        // Verificar se os campos existem
        if (!sourceField.length || !warbondFieldSelect.length) {
            return false;
        }

        var sourceValue = sourceField.val() || '';

        // Buscar a div com classe form-row field-warbond
        // Essa é a estrutura exata que o Django Admin cria
        var warbondFieldContainer = $('div.form-row.field-warbond');

        // Se não encontrou, tentar outras formas de busca
        if (warbondFieldContainer.length === 0) {
            // Tentar encontrar pela classe field-warbond
            warbondFieldContainer = $('div.field-warbond');
        }

        if (warbondFieldContainer.length === 0) {
            // Tentar encontrar subindo a partir do select
            warbondFieldContainer = warbondFieldSelect.closest('div.form-row');
        }

        if (warbondFieldContainer.length === 0) {
            // Tentar encontrar pelo label
            var warbondFieldLabel = $('label[for="id_warbond"]');
            if (warbondFieldLabel.length) {
                warbondFieldContainer = warbondFieldLabel.closest('div.form-row');
            }
        }

        // Se encontrou o container, aplicar show/hide
        if (warbondFieldContainer.length > 0) {
            if (sourceValue === 'pass') {
                // Mostrar quando source='pass'
                warbondFieldContainer.css('display', '');
                warbondFieldContainer.show();
            } else {
                // Esconder quando source não é 'pass'
                warbondFieldContainer.css('display', 'none');
                warbondFieldContainer.hide();
                // Limpar o valor
                warbondFieldSelect.val('');
            }
            return true;
        }

        return false;
    }

    /**
     * Função que tenta executar o toggle várias vezes até conseguir
     */
    function tryToggle() {
        var success = toggleWarbondField();
        if (!success) {
            // Se não conseguiu, tentar novamente em breve
            setTimeout(tryToggle, 50);
        }
    }

    /**
     * Inicializa quando o documento estiver pronto
     */
    $(document).ready(function () {
        // Executar várias vezes com delays diferentes
        tryToggle();
        setTimeout(tryToggle, 10);
        setTimeout(tryToggle, 50);
        setTimeout(tryToggle, 100);
        setTimeout(tryToggle, 200);
        setTimeout(tryToggle, 300);
        setTimeout(tryToggle, 500);
        setTimeout(tryToggle, 1000);

        // Listener para mudanças no campo source
        $(document).on('change', '#id_source', function () {
            setTimeout(toggleWarbondField, 10);
            setTimeout(toggleWarbondField, 50);
        });
    });

    // Também executar quando a janela carregar completamente
    $(window).on('load', function () {
        setTimeout(toggleWarbondField, 100);
        setTimeout(toggleWarbondField, 300);
    });

    // Usar django.jQuery se disponível
    if (typeof django !== 'undefined' && django.jQuery) {
        django.jQuery(document).on('formset:added', function () {
            setTimeout(toggleWarbondField, 100);
        });
    }

})(django.jQuery || jQuery);
