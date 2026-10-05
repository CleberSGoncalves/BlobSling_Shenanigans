// ============================================================
// PortalObject — Portal mágico animado com aura, partículas e luz
// ============================================================
import Phaser from 'phaser';

export default class PortalObject {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.time = 0;

    this._buildSensor();
    this._buildVisuals();
    this._buildParticles();
  }

  _buildSensor() {
    // Sensor de colisão (círculo invisível)
    this.sensor = this.scene.matter.add.circle(this.x, this.y, 32, {
      isStatic: true,
      isSensor: true,
      label: 'portal'
    });
  }

  _buildVisuals() {
    const x = this.x;
    const y = this.y;

    // Camada de brilho externo (halo)
    this.halo = this.scene.add.graphics();
    this._drawHalo(0);

    // Anel externo giratório
    this.ringOuter = this.scene.add.graphics();
    this.ringInner = this.scene.add.graphics();
    this._drawRings();

    // Núcleo do portal
    this.core = this.scene.add.graphics();
    this._drawCore(0);

    // Texto flutuante "PORTAL"
    this.label = this.scene.add.text(x, y - 50, '⬡ PORTAL', {
      fontFamily: 'Segoe UI, Arial',
      fontSize: '11px',
      color: '#00f5ff',
      alpha: 0.85,
      stroke: '#0284c7',
      strokeThickness: 1
    }).setOrigin(0.5);

    // Animação de float do label
    this.scene.tweens.add({
      targets: this.label,
      y: y - 58,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Pulse do halo
    this.scene.tweens.add({
      targets: this.halo,
      alpha: { from: 0.3, to: 0.7 },
      duration: 700,
      yoyo: true,
      repeat: -1
    });
  }

  _drawHalo(t) {
    const x = this.x;
    const y = this.y;
    this.halo.clear();
    for (let i = 3; i >= 1; i--) {
      this.halo.fillStyle(0x00f5ff, 0.06 * i);
      this.halo.fillCircle(x, y, 32 + i * 12 + Math.sin(t * 3) * 4);
    }
  }

  _drawRings() {
    const x = this.x;
    const y = this.y;

    this.ringOuter.clear();
    this.ringOuter.lineStyle(3, 0x00f5ff, 0.7);
    this.ringOuter.strokeCircle(x, y, 34);
    this.ringOuter.lineStyle(1, 0x38bdf8, 0.3);
    this.ringOuter.strokeCircle(x, y, 38);

    this.ringInner.clear();
    this.ringInner.lineStyle(2, 0xa855f7, 0.8);
    this.ringInner.strokeCircle(x, y, 22);
  }

  _drawCore(t) {
    const x = this.x;
    const y = this.y;
    this.core.clear();

    // Gradiente simulado com círculos concêntricos
    const pulse = Math.sin(t * 4) * 0.1;
    const colors = [
      [0x0f172a, 18 + pulse * 6],
      [0x1e3a5f, 14 + pulse * 4],
      [0x0284c7, 9 + pulse * 3],
      [0x00f5ff, 5 + pulse * 2]
    ];
    colors.forEach(([c, r]) => {
      this.core.fillStyle(c, 1);
      this.core.fillCircle(x, y, r);
    });

    // Swirl lines
    this.core.lineStyle(1, 0x38bdf8, 0.5);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + t * 2;
      const r1 = 6, r2 = 16;
      this.core.lineBetween(
        x + Math.cos(angle) * r1,
        y + Math.sin(angle) * r1,
        x + Math.cos(angle + 0.4) * r2,
        y + Math.sin(angle + 0.4) * r2
      );
    }
  }

  _buildParticles() {
    // Partículas orbitais procedurais
    this.orbParticles = [];
    const colors = [0x00f5ff, 0xa855f7, 0x38bdf8, 0x22c55e];
    for (let i = 0; i < 8; i++) {
      const orb = {
        angle: (i / 8) * Math.PI * 2,
        radius: 28 + Phaser.Math.Between(-6, 6),
        speed: Phaser.Math.FloatBetween(0.02, 0.04),
        size: Phaser.Math.Between(3, 6),
        color: colors[i % colors.length],
        gfx: this.scene.add.graphics()
      };
      this.orbParticles.push(orb);
    }

    // Emissão de partículas aleatórias
    this.scene.time.addEvent({
      delay: 200,
      loop: true,
      callback: this._emitParticle,
      callbackScope: this
    });
  }

  _emitParticle() {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const dist = Phaser.Math.Between(10, 30);
    const px = this.x + Math.cos(angle) * dist;
    const py = this.y + Math.sin(angle) * dist;
    const p = this.scene.add.circle(px, py, Phaser.Math.Between(2, 5), 0x00f5ff, 0.8);

    this.scene.tweens.add({
      targets: p,
      x: px + Math.cos(angle) * Phaser.Math.Between(20, 50),
      y: py + Math.sin(angle) * Phaser.Math.Between(20, 50) - Phaser.Math.Between(15, 35),
      alpha: 0,
      scaleX: 0, scaleY: 0,
      duration: Phaser.Math.Between(400, 800),
      ease: 'Power2.easeOut',
      onComplete: () => p.destroy()
    });
  }

  playSuccessEffect() {
    const x = this.x;
    const y = this.y;

    // Onda de expansão
    for (let i = 0; i < 4; i++) {
      const ring = this.scene.add.graphics();
      ring.lineStyle(3, 0x00f5ff, 0.8);
      ring.strokeCircle(x, y, 10);
      this.scene.tweens.add({
        targets: ring,
        scaleX: 6, scaleY: 6,
        alpha: 0,
        duration: 600,
        delay: i * 120,
        ease: 'Power2.easeOut',
        onComplete: () => ring.destroy()
      });
    }

    // Explosão de estrelas
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const star = this.scene.add.circle(x, y, Phaser.Math.Between(4, 9),
        [0x00f5ff, 0xf59e0b, 0xa855f7, 0xffffff][i % 4], 1);
      this.scene.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * Phaser.Math.Between(60, 120),
        y: y + Math.sin(angle) * Phaser.Math.Between(60, 120),
        alpha: 0,
        duration: Phaser.Math.Between(500, 900),
        ease: 'Power2.easeOut',
        onComplete: () => star.destroy()
      });
    }

    // Flash branco central
    const flash = this.scene.add.circle(x, y, 60, 0xffffff, 0.9);
    this.scene.tweens.add({
      targets: flash, scaleX: 3, scaleY: 3, alpha: 0,
      duration: 400, ease: 'Power3.easeOut',
      onComplete: () => flash.destroy()
    });
  }

  update(time) {
    this.time = time / 1000;
    const t = this.time;

    // Girar anel externo
    this.ringOuter.rotation = t * 0.8;

    // Contra-rotação anel interno
    this.ringInner.rotation = -t * 1.2;

    // Halo pulsante
    this._drawHalo(t);

    // Núcleo animado
    this._drawCore(t);

    // Orbs orbitais
    this.orbParticles.forEach(orb => {
      orb.angle += orb.speed;
      const ox = this.x + Math.cos(orb.angle) * orb.radius;
      const oy = this.y + Math.sin(orb.angle) * orb.radius;
      orb.gfx.clear();
      orb.gfx.fillStyle(orb.color, 0.85);
      orb.gfx.fillCircle(ox, oy, orb.size);
      // Trail
      orb.gfx.fillStyle(orb.color, 0.2);
      orb.gfx.fillCircle(
        this.x + Math.cos(orb.angle - 0.3) * orb.radius,
        this.y + Math.sin(orb.angle - 0.3) * orb.radius,
        orb.size * 0.6
      );
    });
  }

  destroy() {
    this.orbParticles.forEach(o => o.gfx.destroy());
    this.halo.destroy();
    this.ringOuter.destroy();
    this.ringInner.destroy();
    this.core.destroy();
    this.label.destroy();
    if (this.sensor) this.scene.matter.world.remove(this.sensor);
  }
}
