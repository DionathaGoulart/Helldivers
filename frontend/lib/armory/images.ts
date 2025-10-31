/**
 * Helper para imagens padrão do Armory
 */

export const getDefaultImage = (type: 'armor' | 'helmet' | 'cape' | 'passive' | 'set' | 'pass'): string => {
  const svgStrings = {
    armor: `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#f3f4f6"/><rect x="120" y="80" width="160" height="240" rx="10" fill="#4b5563" stroke="#6b7280" stroke-width="4"/><rect x="160" y="100" width="80" height="120" rx="5" fill="#1f2937"/><circle cx="200" cy="140" r="20" fill="#374151"/><rect x="140" y="230" width="120" height="20" rx="5" fill="#1f2937"/><rect x="130" y="260" width="140" height="40" rx="5" fill="#1f2937"/></svg>`,
    helmet: `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#fef3c7"/><path d="M200 100 L150 180 L160 320 L240 320 L250 180 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="4"/><path d="M200 100 L200 320" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/><circle cx="200" cy="200" r="30" fill="#1f2937"/><rect x="180" y="240" width="40" height="10" rx="5" fill="#4b5563"/></svg>`,
    cape: `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#fed7aa"/><path d="M200 50 Q250 100 280 200 L280 350 L200 350 L120 350 L120 200 Q150 100 200 50 Z" fill="#fb923c" stroke="#ea580c" stroke-width="4"/><path d="M200 200 L280 350 M200 200 L120 350" stroke="#ea580c" stroke-width="3"/><circle cx="200" cy="250" r="20" fill="#1f2937"/><rect x="180" y="100" width="40" height="150" fill="#dc2626"/></svg>`,
    passive: `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#f3e8ff"/><circle cx="200" cy="200" r="100" fill="#c084fc" stroke="#a855f7" stroke-width="6"/><circle cx="200" cy="200" r="60" fill="#e9d5ff"/><path d="M160 200 L185 225 L240 170" stroke="#7e22ce" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    set: `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#e0f2fe"/><rect x="50" y="50" width="300" height="300" rx="20" fill="#0ea5e9" stroke="#0284c7" stroke-width="6"/><rect x="100" y="100" width="200" height="80" rx="10" fill="#ffffff" opacity="0.9"/><circle cx="200" cy="140" r="15" fill="#0ea5e9"/><rect x="150" y="120" width="100" height="15" rx="5" fill="#0284c7"/><rect x="160" y="200" width="80" height="10" rx="5" fill="#ffffff"/><rect x="170" y="220" width="60" height="10" rx="5" fill="#ffffff"/><rect x="180" y="240" width="40" height="10" rx="5" fill="#ffffff"/></svg>`,
    pass: `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#faf5ff"/><rect x="50" y="50" width="300" height="300" rx="15" fill="#d8b4fe" stroke="#a855f7" stroke-width="6"/><rect x="80" y="80" width="240" height="180" rx="10" fill="#e9d5ff"/><circle cx="200" cy="170" r="40" fill="#a855f7"/><path d="M180 170 L195 185 L220 160" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/><rect x="100" y="280" width="200" height="30" rx="5" fill="#c084fc"/><rect x="120" y="290" width="160" height="15" rx="3" fill="#a855f7"/></svg>`
  };

  const encoded = encodeURIComponent(svgStrings[type]);
  return `data:image/svg+xml,${encoded}`;
};

