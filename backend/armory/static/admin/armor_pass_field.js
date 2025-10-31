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
        
        // Procurar pela linha da tabela (tr) que contém o campo pass_field
        // O Django Admin usa tabelas com classe .form-row
        var passFieldRow = passFieldSelect.closest('tr');
        
        // Se não encontrar em tr, procurar em outros containers
        if (!passFieldRow.length || passFieldRow.length === 0) {
            passFieldRow = $('.field-pass_field').closest('.form-row, .form-group, tr, div');
        }
        
        if (sourceField.length && passFieldRow.length && passFieldSelect.length) {
            if (sourceField.val() === 'pass') {
                // Mostrar o campo quando source='pass'
                passFieldRow.show();
            } else {
                // Esconder o campo quando source não é 'pass'
                passFieldRow.hide();
                // Limpar o valor quando esconder
                passFieldSelect.val('');
            }
        }
    }
    
    /**
     * Inicializa quando o documento estiver pronto
     */
    $(document).ready(function() {
        // Aplicar ao carregar a página (com pequeno delay para garantir que o DOM está pronto)
        setTimeout(togglePassField, 100);
        
        // Aplicar quando source mudar
        $('#id_source').on('change', function() {
            togglePassField();
        });
    });
    
    // Também aplicar quando campos inline forem adicionados (para formulários de conjunto)
    if (typeof django !== 'undefined' && django.jQuery) {
        django.jQuery(document).on('formset:added', function() {
            togglePassField();
        });
    }
    
})(django.jQuery);

