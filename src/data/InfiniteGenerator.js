// ============================================================
// InfiniteGenerator.js — Gerador Procedural de Fases Infinitas
// Gera labirintos e desafios dinâmicos com dificuldade escalonada
// ============================================================

export function generateInfiniteLevel(levelNumber, W, H) {
  const difficulty = Math.min(10, 1 + Math.floor(levelNumber / 2));
  
  // Posicionamento do estilingue
  const slingX = W * 0.12 + Math.random() * (W * 0.08);
  const slingY = H * 0.65 + Math.random() * (H * 0.15);
  
  // Posicionamento do portal (lado oposto ou no alto)
  const portalX = W * 0.78 + Math.random() * (W * 0.12);
  const portalY = H * 0.2 + Math.random() * (H * 0.35);

  const platforms = [
    // Base de lançamento
    { x: slingX, y: slingY + 36, w: 160, h: 24, color: 0x334155 },
    // Base do portal
    { x: portalX, y: portalY + 45, w: 150, h: 24, color: 0x334155 }
  ];

  const spikes = [];
  const sticky = [];
  const walls = [];

  // Número de obstáculos intermediários baseado na dificuldade
  const obstacleCount = 2 + Math.floor(difficulty * 0.8);
  const stepX = (portalX - slingX) / (obstacleCount + 1);

  for (let i = 1; i <= obstacleCount; i++) {
    const ox = slingX + i * stepX + (Math.random() * 40 - 20);
    const oy = H * 0.3 + Math.random() * (H * 0.45);
    const pw = 80 + Math.random() * 100;
    const ph = 22;

    platforms.push({
      x: ox,
      y: oy,
      w: pw,
      h: ph,
      color: 0x475569
    });

    // 40% de chance de superfície pegajosa sobre a plataforma
    if (Math.random() < 0.4) {
      sticky.push({
        x: ox,
        y: oy - 12,
        w: pw * 0.7,
        h: 10
      });
    }

    // 50% de chance de espinhos no chão ou plataforma
    if (Math.random() < 0.5 && difficulty > 2) {
      spikes.push({
        x: ox,
        y: oy - 14,
        w: Math.min(pw * 0.6, 70),
        h: 16
      });
    }
  }

  // Espinho mortal no fosso inferior
  if (difficulty >= 2) {
    spikes.push({
      x: W * 0.5,
      y: H * 0.96,
      w: W * 0.8,
      h: 24
    });
  }

  return {
    sling: { x: slingX, y: slingY },
    portal: { x: portalX, y: portalY },
    platforms,
    spikes,
    sticky,
    walls
  };
}
