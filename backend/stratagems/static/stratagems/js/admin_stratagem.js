document.addEventListener('DOMContentLoaded', function () {
    const departmentSelect = document.querySelector('#id_department');
    const warbondRow = document.querySelector('.field-warbond');

    function toggleWarbondField() {
        if (departmentSelect && warbondRow) {
            if (departmentSelect.value === 'warbonds') {
                warbondRow.style.display = '';
            } else {
                warbondRow.style.display = 'none';
            }
        }
    }

    if (departmentSelect) {
        // Initial check
        toggleWarbondField();

        // Listen for changes
        departmentSelect.addEventListener('change', toggleWarbondField);
    }
});
