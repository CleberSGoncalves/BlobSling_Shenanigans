// ============================================================
// Levels.js — Conjunto de Níveis da Campanha
// Cada nível é uma função (W, H) que retorna a geometria e elementos
// ============================================================

export const LEVELS = [
  // Nível 1: Introdução ao Estilingue & Pulo Básico
  (W, H) => ({
    sling: { x: W * 0.18, y: H * 0.72 },
    portal: { x: W * 0.82, y: H * 0.38 },
    platforms: [
      { x: W * 0.18, y: H * 0.82, w: 180, h: 24, color: 0x334155 },
      { x: W * 0.5, y: H * 0.62, w: 220, h: 24, color: 0x475569 },
      { x: W * 0.82, y: H * 0.48, w: 180, h: 24, color: 0x334155 }
    ],
    spikes: [
      { x: W * 0.5, y: H * 0.95, w: 320, h: 20 }
    ],
    sticky: [
      { x: W * 0.5, y: H * 0.6, w: 100, h: 10 }
    ],
    walls: []
  }),

  // Nível 2: Parede Central e Quique Parabólico
  (W, H) => ({
    sling: { x: W * 0.15, y: H * 0.75 },
    portal: { x: W * 0.85, y: H * 0.72 },
    platforms: [
      { x: W * 0.15, y: H * 0.85, w: 160, h: 24, color: 0x334155 },
      { x: W * 0.5, y: H * 0.55, w: 36, h: H * 0.6, color: 0x64748b }, // Pilar alto central
      { x: W * 0.85, y: H * 0.85, w: 160, h: 24, color: 0x334155 },
      { x: W * 0.5, y: H * 0.18, w: 240, h: 24, color: 0x475569 } // Teto reflexivo
    ],
    spikes: [
      { x: W * 0.35, y: H * 0.95, w: 180, h: 20 },
      { x: W * 0.65, y: H * 0.95, w: 180, h: 20 }
    ],
    sticky: [
      { x: W * 0.5, y: H * 0.35, w: 36, h: 80 }
    ],
    walls: []
  }),

  // Nível 3: Labirinto Vertical com Plataformas em Zig-Zag
  (W, H) => ({
    sling: { x: W * 0.15, y: H * 0.8 },
    portal: { x: W * 0.15, y: H * 0.22 },
    platforms: [
      { x: W * 0.15, y: H * 0.9, w: 180, h: 24, color: 0x334155 },
      { x: W * 0.45, y: H * 0.7, w: 280, h: 24, color: 0x475569 },
      { x: W * 0.75, y: H * 0.5, w: 280, h: 24, color: 0x475569 },
      { x: W * 0.4, y: H * 0.32, w: 260, h: 24, color: 0x475569 },
      { x: W * 0.15, y: H * 0.32, w: 140, h: 24, color: 0x334155 }
    ],
    spikes: [
      { x: W * 0.75, y: H * 0.95, w: 350, h: 20 },
      { x: W * 0.45, y: H * 0.68, w: 100, h: 16 }
    ],
    sticky: [
      { x: W * 0.75, y: H * 0.48, w: 80, h: 10 }
    ],
    walls: []
  }),

  // Nível 4: A Garganta Estreita (Foco em Divisão / Mini-Blobs)
  (W, H) => ({
    sling: { x: W * 0.12, y: H * 0.5 },
    portal: { x: W * 0.88, y: H * 0.5 },
    platforms: [
      { x: W * 0.12, y: H * 0.65, w: 150, h: 24, color: 0x334155 },
      // Paredes formando túnel estreito
      { x: W * 0.5, y: H * 0.25, w: 80, h: H * 0.42, color: 0x1e293b },
      { x: W * 0.5, y: H * 0.78, w: 80, h: H * 0.42, color: 0x1e293b },
      { x: W * 0.88, y: H * 0.65, w: 150, h: 24, color: 0x334155 }
    ],
    spikes: [
      { x: W * 0.32, y: H * 0.95, w: 260, h: 20 },
      { x: W * 0.68, y: H * 0.95, w: 260, h: 20 }
    ],
    sticky: [
      { x: W * 0.5, y: H * 0.47, w: 80, h: 14 }
    ],
    walls: []
  }),

  // Nível 5: O Fosso Vulcânico (Uso do Blob Explosivo ou de Gelo)
  (W, H) => ({
    sling: { x: W * 0.12, y: H * 0.75 },
    portal: { x: W * 0.88, y: H * 0.28 },
    platforms: [
      { x: W * 0.12, y: H * 0.85, w: 160, h: 24, color: 0x334155 },
      { x: W * 0.38, y: H * 0.65, w: 140, h: 24, color: 0x475569 },
      { x: W * 0.62, y: H * 0.48, w: 140, h: 24, color: 0x475569 },
      { x: W * 0.88, y: H * 0.38, w: 160, h: 24, color: 0x334155 }
    ],
    spikes: [
      { x: W * 0.5, y: H * 0.96, w: W * 0.85, h: 24 } // Chão quase todo em espinhos
    ],
    sticky: [
      { x: W * 0.38, y: H * 0.63, w: 80, h: 10 },
      { x: W * 0.62, y: H * 0.46, w: 80, h: 10 }
    ],
    walls: []
  }),

  // Nível 6: O Templo da Gravidade Invertida
  (W, H) => ({
    sling: { x: W * 0.15, y: H * 0.3 },
    portal: { x: W * 0.85, y: H * 0.78 },
    platforms: [
      { x: W * 0.15, y: H * 0.4, w: 160, h: 24, color: 0x334155 },
      { x: W * 0.35, y: H * 0.25, w: 200, h: 24, color: 0x475569 },
      { x: W * 0.65, y: H * 0.55, w: 220, h: 24, color: 0x475569 },
      { x: W * 0.85, y: H * 0.88, w: 160, h: 24, color: 0x334155 }
    ],
    spikes: [
      { x: W * 0.5, y: H * 0.95, w: 280, h: 20 },
      { x: W * 0.35, y: H * 0.23, w: 100, h: 16 }
    ],
    sticky: [
      { x: W * 0.65, y: H * 0.53, w: 120, h: 12 }
    ],
    walls: []
  }),

  // Nível 7: Câmara de Precisão com Paredes Bouncy
  (W, H) => ({
    sling: { x: W * 0.15, y: H * 0.78 },
    portal: { x: W * 0.5, y: H * 0.2 },
    platforms: [
      { x: W * 0.15, y: H * 0.88, w: 160, h: 24, color: 0x334155 },
      { x: W * 0.08, y: H * 0.45, w: 24, h: 280, color: 0x38bdf8 }, // Parede bouncy gelo
      { x: W * 0.92, y: H * 0.45, w: 24, h: 280, color: 0x38bdf8 },
      { x: W * 0.5, y: H * 0.32, w: 180, h: 24, color: 0x334155 },
      { x: W * 0.5, y: H * 0.6, w: 240, h: 24, color: 0x475569 }
    ],
    spikes: [
      { x: W * 0.5, y: H * 0.58, w: 160, h: 18 },
      { x: W * 0.5, y: H * 0.95, w: 400, h: 20 }
    ],
    sticky: [
      { x: W * 0.5, y: H * 0.3, w: 90, h: 10 }
    ],
    walls: []
  }),

  // Nível 8: O Grande Abismo e Ilhas Flutuantes
  (W, H) => ({
    sling: { x: W * 0.12, y: H * 0.6 },
    portal: { x: W * 0.9, y: H * 0.6 },
    platforms: [
      { x: W * 0.12, y: H * 0.72, w: 140, h: 24, color: 0x334155 },
      { x: W * 0.35, y: H * 0.7, w: 90, h: 20, color: 0x64748b },
      { x: W * 0.5, y: H * 0.48, w: 90, h: 20, color: 0x64748b },
      { x: W * 0.65, y: H * 0.68, w: 90, h: 20, color: 0x64748b },
      { x: W * 0.9, y: H * 0.72, w: 140, h: 24, color: 0x334155 }
    ],
    spikes: [
      { x: W * 0.5, y: H * 0.96, w: W * 0.9, h: 24 }
    ],
    sticky: [
      { x: W * 0.5, y: H * 0.46, w: 70, h: 8 }
    ],
    walls: []
  }),

  // Nível 9: Fortaleza dos Espinhos (Desafio Extremo)
  (W, H) => ({
    sling: { x: W * 0.12, y: H * 0.8 },
    portal: { x: W * 0.88, y: H * 0.22 },
    platforms: [
      { x: W * 0.12, y: H * 0.9, w: 150, h: 24, color: 0x334155 },
      { x: W * 0.32, y: H * 0.68, w: 120, h: 22, color: 0x475569 },
      { x: W * 0.52, y: H * 0.52, w: 120, h: 22, color: 0x475569 },
      { x: W * 0.72, y: H * 0.36, w: 120, h: 22, color: 0x475569 },
      { x: W * 0.88, y: H * 0.32, w: 150, h: 24, color: 0x334155 }
    ],
    spikes: [
      { x: W * 0.32, y: H * 0.66, w: 70, h: 16 },
      { x: W * 0.52, y: H * 0.5, w: 70, h: 16 },
      { x: W * 0.5, y: H * 0.95, w: W * 0.9, h: 20 }
    ],
    sticky: [
      { x: W * 0.72, y: H * 0.34, w: 60, h: 10 }
    ],
    walls: []
  }),

  // Nível 10: O Santuário Místico dos Blobs (Clímax da Campanha)
  (W, H) => ({
    sling: { x: W * 0.15, y: H * 0.75 },
    portal: { x: W * 0.5, y: H * 0.16 },
    platforms: [
      { x: W * 0.15, y: H * 0.85, w: 160, h: 24, color: 0x334155 },
      { x: W * 0.85, y: H * 0.85, w: 160, h: 24, color: 0x334155 },
      { x: W * 0.28, y: H * 0.55, w: 160, h: 24, color: 0x475569 },
      { x: W * 0.72, y: H * 0.55, w: 160, h: 24, color: 0x475569 },
      { x: W * 0.5, y: H * 0.3, w: 200, h: 24, color: 0x64748b }
    ],
    spikes: [
      { x: W * 0.5, y: H * 0.95, w: W * 0.8, h: 20 },
      { x: W * 0.5, y: H * 0.28, w: 100, h: 16 }
    ],
    sticky: [
      { x: W * 0.28, y: H * 0.53, w: 80, h: 10 },
      { x: W * 0.72, y: H * 0.53, w: 80, h: 10 }
    ],
    walls: []
  })
];
