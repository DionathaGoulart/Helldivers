/**
 * Script para mostrar/esconder o campo pass_field baseado na fonte de aquisição
 * Funciona para Armor, Helmet e Cape
 */
(function($) {
    'use strict';
    
    /**
     * Mostra ou esconde o campo pass_field baseado no valor de source
     */
    function togglePassField() {
        var sourceField = $('#id_source');
        var passFieldSelect = $('#id_pass_field');
        
        // Verificar se os campos existem
        if (!sourceField.length || !passFieldSelect.length) {
            return false;
        }
        
        var sourceValue = sourceField.val() || '';
        
        // Buscar a div com classe form-row field-pass_field
        // Essa é a estrutura exata que o Django Admin cria
        var passFieldContainer = $('div.form-row.field-pass_field');
        
        // Se não encontrou, tentar outras formas de busca
        if (passFieldContainer.length === 0) {
            // Tentar encontrar pela classe field-pass_field
            passFieldContainer = $('div.field-pass_field');
        }
        
        if (passFieldContainer.length === 0) {
            // Tentar encontrar subindo a partir do select
            passFieldContainer = passFieldSelect.closest('div.form-row');
        }
        
        if (passFieldContainer.length === 0) {
            // Tentar encontrar pelo label
            var passFieldLabel = $('label[for="id_pass_field"]');
            if (passFieldLabel.length) {
                passFieldContainer = passFieldLabel.closest('div.form-row');
            }
        }
        
        // Se encontrou o container, aplicar show/hide
        if (passFieldContainer.length > 0) {
            if (sourceValue === 'pass') {
                // Mostrar quando source='pass'
                passFieldContainer.css('display', '');
                passFieldContainer.show();
            } else {
                // Esconder quando source não é 'pass'
                passFieldContainer.css('display', 'none');
                passFieldContainer.hide();
                // Limpar o valor
                passFieldSelect.val('');
            }
            return true;
        }
        
        return false;
    }
    
    /**
     * Função que tenta executar o toggle várias vezes até conseguir
     */
    function tryToggle() {
        var success = togglePassField();
        if (!success) {
            // Se não conseguiu, tentar novamente em breve
            setTimeout(tryToggle, 50);
        }
    }
    
    /**
     * Inicializa quando o documento estiver pronto
     */
    $(document).ready(function() {
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
        $(document).on('change', '#id_source', function() {
            setTimeout(togglePassField, 10);
            setTimeout(togglePassField, 50);
        });
    });
    
    // Também executar quando a janela carregar completamente
    $(window).on('load', function() {
        setTimeout(togglePassField, 100);
        setTimeout(togglePassField, 300);
    });
    
    // Usar django.jQuery se disponível
    if (typeof django !== 'undefined' && django.jQuery) {
        django.jQuery(document).on('formset:added', function() {
            setTimeout(togglePassField, 100);
        });
    }
    
})(django.jQuery || jQuery);
