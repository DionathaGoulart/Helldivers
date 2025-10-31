/**
 * Tema Helldivers 2
 * 
 * Sistema de design baseado na estética militar futurista,
 * propaganda democrática exagerada e sátira autoritária do universo Helldivers 2.
 */

export const helldiversTheme = {
  colors: {
    // Cores Principais
    superEarthBlue: '#1a2332',
    militaryGray: '#2a3a4a',
    democracyGold: '#d4af37',
    alertRed: '#ff3333',
    holoCyan: '#00d9ff',
    terminalGreen: '#39ff14',
    
    // Backgrounds
    bgPrimary: '#0f1419',
    bgSecondary: '#1a2332',
    bgTertiary: '#2a3a4a',
    
    // Text
    textPrimary: '#ffffff',
    textSecondary: '#b8c5d6',
    textMuted: '#6b7d91',
    
    // Status
    success: '#39ff14',
    warning: '#ffa500',
    danger: '#ff3333',
    info: '#00d9ff',
    
    // Borders
    borderPrimary: '#3a4a5a',
    borderGlow: '#00d9ff',
    borderGold: '#d4af37',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  borderRadius: {
    none: '0',
    sm: '2px',
    md: '4px',
  },
  
  effects: {
    scanline: 'repeating-linear-gradient(0deg, rgba(0,217,255,0.03) 0px, transparent 1px, transparent 2px, rgba(0,217,255,0.03) 3px)',
    glow: '0 0 20px rgba(0,217,255,0.5), 0 0 40px rgba(0,217,255,0.2)',
    glowGold: '0 0 20px rgba(212,175,55,0.5), 0 0 40px rgba(212,175,55,0.2)',
    textShadow: '0 0 10px rgba(0,217,255,0.8)',
  },
  
  transitions: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
  },
  
  fonts: {
    heading: "'Orbitron', sans-serif",
    body: "'Barlow Condensed', sans-serif",
    ui: "'Rajdhani', sans-serif",
    terminal: "'Courier New', monospace",
  },
} as const;

