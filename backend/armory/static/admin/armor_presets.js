(function() {
  const PRESETS = {
    light: {
      armor: [50, 64, 70, 75, 79, 100],
      speed: [521, 530, 536, 550],
      stamina: [111, 115, 118, 125],
    },
    medium: {
      armor: [100, 125, 129, 150],
      speed: [450, 471, 500],
      stamina: [71, 100],
    },
    heavy: {
      armor: [150, 200],
      speed: [450],
      stamina: [50],
    },
  };

  function setOptions(selectEl, options) {
    if (!selectEl) return;
    // Preservar o valor atual antes de limpar
    const currentValue = selectEl.value;
    while (selectEl.options.length > 0) selectEl.remove(0);
    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = '---------';
    selectEl.appendChild(empty);
    
    // Criar um conjunto com os valores das opções para verificar duplicatas
    const optionValues = new Set();
    
    (options || []).forEach((v) => {
      const value = String(v);
      if (!optionValues.has(value)) {
        optionValues.add(value);
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        selectEl.appendChild(opt);
      }
    });
    
    // Se havia um valor atual e ele não está nas opções, adicioná-lo
    if (currentValue && currentValue !== '' && !optionValues.has(currentValue)) {
      const opt = document.createElement('option');
      opt.value = currentValue;
      opt.textContent = currentValue;
      // Inserir após o primeiro (---------)
      if (selectEl.options.length > 1) {
        selectEl.insertBefore(opt, selectEl.options[1]);
      } else {
        selectEl.appendChild(opt);
      }
    }
    
    // Restaurar o valor se ainda existir nas opções
    if (currentValue && Array.from(selectEl.options).some(opt => opt.value === currentValue)) {
      selectEl.value = currentValue;
    }
  }

  function updateByCategory(category, preserveValues = false) {
    const armorSel = document.getElementById('id_armor');
    const speedSel = document.getElementById('id_speed');
    const staminaSel = document.getElementById('id_stamina');
    const cfg = PRESETS[category] || { armor: [], speed: [], stamina: [] };
    
    // Se preserveValues é true, preservar os valores atuais antes de atualizar
    if (preserveValues) {
      setOptions(armorSel, cfg.armor);
      setOptions(speedSel, cfg.speed);
      setOptions(staminaSel, cfg.stamina);
    } else {
      // Ao mudar categoria manualmente, preservar valores se possível
      setOptions(armorSel, cfg.armor);
      setOptions(speedSel, cfg.speed);
      setOptions(staminaSel, cfg.stamina);
    }
  }

  function init() {
    const cat = document.getElementById('id_category');
    if (!cat) return;
    
    const armorSel = document.getElementById('id_armor');
    const speedSel = document.getElementById('id_speed');
    const staminaSel = document.getElementById('id_stamina');
    
    // Aguardar um pouco para garantir que o Django terminou de renderizar
    setTimeout(function() {
      // Verificar se já há valores selecionados (editando um objeto existente)
      const hasArmorValue = armorSel && armorSel.value && armorSel.value !== '';
      const hasSpeedValue = speedSel && speedSel.value && speedSel.value !== '';
      const hasStaminaValue = staminaSel && staminaSel.value && staminaSel.value !== '';
      const hasValues = hasArmorValue || hasSpeedValue || hasStaminaValue;
      
      if (cat.value) {
        if (hasValues) {
          // Se há valores salvos, NÃO sobrescrever as opções
          // Apenas garantir que os valores atuais estão nas opções
          const cfg = PRESETS[cat.value] || { armor: [], speed: [], stamina: [] };
          
          // Para cada campo, adicionar o valor atual se não estiver nas opções
          if (hasArmorValue) {
            const currentArmor = armorSel.value;
            const armorOptions = Array.from(armorSel.options).map(opt => opt.value);
            if (!armorOptions.includes(currentArmor)) {
              const opt = document.createElement('option');
              opt.value = currentArmor;
              opt.textContent = currentArmor;
              opt.selected = true;
              armorSel.appendChild(opt);
              // Manter o valor selecionado
              armorSel.value = currentArmor;
            }
          }
          
          if (hasSpeedValue) {
            const currentSpeed = speedSel.value;
            const speedOptions = Array.from(speedSel.options).map(opt => opt.value);
            if (!speedOptions.includes(currentSpeed)) {
              const opt = document.createElement('option');
              opt.value = currentSpeed;
              opt.textContent = currentSpeed;
              opt.selected = true;
              speedSel.appendChild(opt);
              // Manter o valor selecionado
              speedSel.value = currentSpeed;
            }
          }
          
          if (hasStaminaValue) {
            const currentStamina = staminaSel.value;
            const staminaOptions = Array.from(staminaSel.options).map(opt => opt.value);
            if (!staminaOptions.includes(currentStamina)) {
              const opt = document.createElement('option');
              opt.value = currentStamina;
              opt.textContent = currentStamina;
              opt.selected = true;
              staminaSel.appendChild(opt);
              // Manter o valor selecionado
              staminaSel.value = currentStamina;
            }
          }
        } else {
          // Se não há valores (criando novo), inicializar normalmente
          updateByCategory(cat.value);
        }
      }
    }, 100); // Aguardar 100ms para garantir que o Django terminou de renderizar
    
    // Event listener para mudança de categoria
    cat.addEventListener('change', (e) => {
      updateByCategory(e.target.value);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


