// ============================================================
// ParallaxBackground.js — Cenários em Múltiplas Camadas de Parallax
// Gradientes atmosféricos, nébula cósmica, partículas e iluminação suave
// ============================================================
import Phaser from 'phaser';

export default class ParallaxBackground {
  constructor(scene, W, H, theme = 'cosmic') {
    this.scene = scene;
    this.W = W;
    this.H = H;
    this.layers = [];
    this.particles = [];

    this._createLayers(theme);
    this._createCosmicDust();
  }

  _createLayers(theme) {
    const W = this.W;
    const H = this.H;

    // Camada 1: Gradiente Profundo de Fundo (Far layer)
    const farGfx = this.scene.add.graphics().setDepth(-10);
    farGfx.fillGradientStyle(0x020617, 0x020617, 0x0b1329, 0x111e42, 1);
    farGfx.fillRect(0, 0, W, H);
    this.layers.push({ gfx: farGfx, factor: 0.05 });

    // Camada 2: Nebulosas / Auras Cósmicas Flutuantes (Mid layer)
    const midGfx = this.scene.add.graphics().setDepth(-8);
    const nebulaColors = [0x00f5ff, 0x8b5cf6, 0x0284c7];
    for (let i = 0; i < 4; i++) {
      const nx = (W * 0.25) * i + Phaser.Math.Between(-60, 60);
      const ny = H * 0.4 + Phaser.Math.Between(-80, 80);
      const radius = Phaser.Math.Between(120, 220);
      midGfx.fillStyle(nebulaColors[i % nebulaColors.length], 0.04);
      midGfx.fillCircle(nx, ny, radius);
      midGfx.fillStyle(0xffffff, 0.015);
      midGfx.fillCircle(nx, ny, radius * 0.5);
    }
    this.layers.push({ gfx: midGfx, factor: 0.15 });

    // Camada 3: Silhuetas de Cristais & Ruínas Flutuantes (Near-mid layer)
    const nearMidGfx = this.scene.add.graphics().setDepth(-5);
    nearMidGfx.fillStyle(0x0f172a, 0.6);
    // Estruturas geométricas místicas distantes
    for (let x = 40; x < W; x += 180) {
      const pillarH = Phaser.Math.Between(80, 160);
      nearMidGfx.fillTriangle(
        x - 25, H,
        x + 25, H,
        x, H - pillarH
      );
    }
    this.layers.push({ gfx: nearMidGfx, factor: 0.3 });
  }

  _createCosmicDust() {
    const W = this.W;
    const H = this.H;

    // Poeira estelar sutil animada
    for (let i = 0; i < 35; i++) {
      const p = this.scene.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        Phaser.Math.FloatBetween(1, 2.5),
        Phaser.Math.RND.pick([0x00f5ff, 0x38bdf8, 0xa855f7, 0xffffff]),
        Phaser.Math.FloatBetween(0.2, 0.6)
      ).setDepth(-3);

      this.scene.tweens.add({
        targets: p,
        y: p.y - Phaser.Math.Between(40, 100),
        alpha: { from: 0.1, to: 0.7 },
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 3000)
      });

      this.particles.push(p);
    }
  }

  update(pointerX, pointerY) {
    if (!pointerX || !pointerY) return;
    const centerX = this.W / 2;
    const centerY = this.H / 2;
    const dx = (pointerX - centerX) / centerX;
    const dy = (pointerY - centerY) / centerY;

    // Efeito suave de inclinação de parallax
    this.layers.forEach(layer => {
      if (layer.gfx) {
        layer.gfx.x = -dx * 20 * layer.factor;
        layer.gfx.y = -dy * 15 * layer.factor;
      }
    });
  }

  destroy() {
    this.layers.forEach(l => l.gfx.destroy());
    this.particles.forEach(p => p.destroy());
  }
}
