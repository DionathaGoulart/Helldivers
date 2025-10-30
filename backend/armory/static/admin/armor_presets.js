(function() {
  const PRESETS = {
    light: {
      armor: [50, 64, 70, 75, 79, 100],
      speed: [521, 530, 536, 550],
      stamina: [111, 115, 118, 125],
    },
    medium: {
      armor: [100, 125, 129],
      speed: [450, 471, 500],
      stamina: [71, 100],
    },
    heavy: {
      armor: [150],
      speed: [450],
      stamina: [50],
    },
  };

  function setOptions(selectEl, options) {
    if (!selectEl) return;
    while (selectEl.options.length > 0) selectEl.remove(0);
    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = '---------';
    selectEl.appendChild(empty);
    (options || []).forEach((v) => {
      const opt = document.createElement('option');
      opt.value = String(v);
      opt.textContent = String(v);
      selectEl.appendChild(opt);
    });
  }

  function updateByCategory(category) {
    const armorSel = document.getElementById('id_armor');
    const speedSel = document.getElementById('id_speed');
    const staminaSel = document.getElementById('id_stamina');
    const cfg = PRESETS[category] || { armor: [], speed: [], stamina: [] };
    setOptions(armorSel, cfg.armor);
    setOptions(speedSel, cfg.speed);
    setOptions(staminaSel, cfg.stamina);
  }

  function init() {
    const cat = document.getElementById('id_category');
    if (!cat) return;
    cat.addEventListener('change', (e) => {
      updateByCategory(e.target.value);
    });
    if (cat.value) updateByCategory(cat.value);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


