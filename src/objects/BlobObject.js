// ============================================================
// BlobObject — Criatura gelatinosa com física Matter.js
// Tipos: normal, explosive, sticky, ice
// Suporte a divisão em mini-blobs
// ============================================================
import Phaser from 'phaser';
import { playBlobSplit, playExplosion } from '../audio/AudioManager.js';

const BLOB_CONFIGS = {
  normal:    { color: 0x22c55e, glowColor: 0x16a34a, radius: 14, restitution: 0.7, friction: 0.05, label: '🟢' },
  explosive: { color: 0xef4444, glowColor: 0xb91c1c, radius: 14, restitution: 0.5, friction: 0.05, label: '💥' },
  sticky:    { color: 0xa855f7, glowColor: 0x7c3aed, radius: 14, restitution: 0.1, friction: 8, label: '🟣' },
  ice:       { color: 0x38bdf8, glowColor: 0x0284c7, radius: 14, restitution: 0.9, friction: 0.01, label: '🔵' }
};

export default class BlobObject extends Phaser.GameObjects.Container {
  constructor(scene, x, y, type = 'normal') {
    super(scene, x, y);
    scene.add.existing(this);

    this.blobType = type;
    this.cfg = BLOB_CONFIGS[type];
    this.alive = true;
    this.stuck = false;
    this.hasSplit = false;
    this.miniBlobs = [];

    this._buildGraphics();
    this._buildPhysics(scene, x, y);
    this._buildGlow();
    this._startWobble();
  }

  _buildGraphics() {
    const r = this.cfg.radius;

    // Corpo principal
    this.bodyGfx = this.scene.add.graphics();
    this._drawBlobShape(this.bodyGfx, 0, 0, r, this.cfg.color);

    // Olhos
    this.eyeGfx = this.scene.add.graphics();
    this.eyeGfx.fillStyle(0xffffff, 1);
    this.eyeGfx.fillCircle(-r * 0.35, -r * 0.2, r * 0.25);
    this.eyeGfx.fillCircle(r * 0.35, -r * 0.2, r * 0.25);
    this.eyeGfx.fillStyle(0x111827, 1);
    this.eyeGfx.fillCircle(-r * 0.3, -r * 0.2, r * 0.12);
    this.eyeGfx.fillCircle(r * 0.4, -r * 0.2, r * 0.12);

    // Brilho especular
    this.specGfx = this.scene.add.graphics();
    this.specGfx.fillStyle(0xffffff, 0.45);
    this.specGfx.fillCircle(-r * 0.3, -r * 0.4, r * 0.22);

    this.add([this.bodyGfx, this.eyeGfx, this.specGfx]);
  }

  _drawBlobShape(gfx, cx, cy, r, color) {
    gfx.clear();
    gfx.fillStyle(color, 1);
    // Corpo irregular (blob orgânico)
    gfx.fillCircle(cx, cy, r);
    gfx.fillCircle(cx + r * 0.3, cy - r * 0.2, r * 0.7);
    gfx.fillCircle(cx - r * 0.3, cy - r * 0.15, r * 0.65);
    gfx.fillCircle(cx, cy + r * 0.3, r * 0.75);
    // Sombra inferior
    gfx.fillStyle(this.cfg.glowColor, 0.5);
    gfx.fillEllipse(cx, cy + r * 0.5, r * 1.4, r * 0.5);
  }

  _buildPhysics(scene, x, y) {
    this.body = scene.matter.add.circle(x, y, this.cfg.radius, {
      restitution: this.cfg.restitution,
      friction: this.cfg.friction,
      frictionAir: 0.01,
      density: 0.002,
      label: `blob_${this.blobType}`
    });
  }

  _buildGlow() {
    this.glowRing = this.scene.add.graphics();
    this.glowRing.lineStyle(3, this.cfg.color, 0.3);
    this.glowRing.strokeCircle(0, 0, this.cfg.radius * 1.6);
    this.add(this.glowRing);

    // Pulse do glow
    this.scene.tweens.add({
      targets: this.glowRing,
      alpha: { from: 0.2, to: 0.7 },
      duration: 400,
      yoyo: true,
      repeat: -1
    });
  }

  _startWobble() {
    // Squash & Stretch procedural
    this.scene.tweens.add({
      targets: this.bodyGfx,
      scaleX: { from: 1, to: 1.08 },
      scaleY: { from: 1, to: 0.94 },
      duration: 350,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  launch(vx, vy) {
    if (this.body) {
      this.scene.matter.body.setVelocity(this.body, { x: vx, y: vy });
    }
  }

  getSpeed() {
    if (!this.body) return 0;
    const v = this.body.velocity;
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  get x() { return this.body ? this.body.position.x : super.x; }
  get y() { return this.body ? this.body.position.y : super.y; }

  stick() {
    if (!this.body) return;
    this.stuck = true;
    this.scene.matter.body.setVelocity(this.body, { x: 0, y: 0 });
    this.scene.matter.body.setStatic(this.body, true);

    // Visual de grudado
    this.bodyGfx.clear();
    this._drawBlobShape(this.bodyGfx, 0, 0, this.cfg.radius * 1.15, this.cfg.color);
    this.scene.tweens.add({ targets: this, scaleX: 1.2, scaleY: 0.85, duration: 150, yoyo: true });

    // Divisão automática após 1.5s se tipo normal/ice
    if ((this.blobType === 'normal' || this.blobType === 'ice') && !this.hasSplit) {
      this.scene.time.delayedCall(1500, () => this.split());
    }
  }

  split() {
    if (this.hasSplit || !this.alive) return;
    this.hasSplit = true;
    playBlobSplit();

    const count = 3;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const mx = this.x + Math.cos(angle) * 20;
      const my = this.y + Math.sin(angle) * 20;
      const mini = new MiniBlobObject(this.scene, mx, my, this.blobType);
      mini.launch(Math.cos(angle) * 5, Math.sin(angle) * 5);
      this.miniBlobs.push(mini);

      // Herdar verificação de portal
      mini.onPortalCheck = () => {
        if (!this.scene.portal) return;
        const dist = Phaser.Math.Distance.Between(mini.x, mini.y, this.scene.portal.x, this.scene.portal.y);
        if (dist < 28 && !this.scene.levelComplete) {
          this.scene._onPortalReached(mini);
        }
      };
    }

    // Explosivo: BOOM ao split
    if (this.blobType === 'explosive') {
      this.explode();
    } else {
      this.die();
    }
  }

  explode() {
    if (!this.alive) return;
    playExplosion();

    // Onda de choque
    const blast = this.scene.add.circle(this.x, this.y, 80, 0xef4444, 0.4);
    this.scene.tweens.add({
      targets: blast,
      scaleX: 2, scaleY: 2, alpha: 0,
      duration: 400,
      ease: 'Power2.easeOut',
      onComplete: () => blast.destroy()
    });

    // Empurrar corpos próximos
    if (this.scene.matter) {
      const bodies = this.scene.matter.world.getAllBodies();
      bodies.forEach(b => {
        if (b === this.body || b.isStatic) return;
        const dx = b.position.x - this.x;
        const dy = b.position.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100 && dist > 0) {
          const force = (1 - dist / 100) * 0.06;
          this.scene.matter.body.applyForce(b, b.position, {
            x: (dx / dist) * force,
            y: (dy / dist) * force
          });
        }
      });
    }

    this.die();
  }

  die() {
    if (!this.alive) return;
    this.alive = false;

    // Pop animation
    this.scene.tweens.add({
      targets: [this.bodyGfx, this.eyeGfx, this.specGfx, this.glowRing],
      scaleX: { from: 1, to: 2 },
      scaleY: { from: 1, to: 2 },
      alpha: 0,
      duration: 250,
      ease: 'Power2.easeOut',
      onComplete: () => {
        if (this.body) this.scene.matter.world.remove(this.body);
        this.destroy();
      }
    });
  }

  update() {
    if (!this.alive || !this.body) return;

    // Sincronizar gráficos com physics body
    const bx = this.body.position.x;
    const by = this.body.position.y;

    [this.bodyGfx, this.eyeGfx, this.specGfx, this.glowRing].forEach(g => {
      if (g) { g.x = bx; g.y = by; }
    });

    // Rotação com velocidade
    const angle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
    this.bodyGfx.rotation = angle * 0.3;
  }

  destroy() {
    [this.bodyGfx, this.eyeGfx, this.specGfx, this.glowRing].forEach(g => { if (g) g.destroy(); });
    super.destroy();
  }
}

// ============================================================
// MiniBlobObject — Versão menor do Blob após split
// ============================================================
class MiniBlobObject {
  constructor(scene, x, y, type) {
    this.scene = scene;
    this.blobType = type;
    this.alive = true;
    this.onPortalCheck = null;
    const cfg = BLOB_CONFIGS[type];

    this.body = scene.matter.add.circle(x, y, 8, {
      restitution: cfg.restitution,
      friction: cfg.friction * 0.5,
      frictionAir: 0.015,
      density: 0.001,
      label: `miniblob_${type}`
    });

    this.gfx = scene.add.graphics();
    this.gfx.fillStyle(cfg.color, 0.85);
    this.gfx.fillCircle(0, 0, 8);
    this.gfx.fillStyle(0xffffff, 0.4);
    this.gfx.fillCircle(-3, -3, 3);
  }

  get x() { return this.body ? this.body.position.x : 0; }
  get y() { return this.body ? this.body.position.y : 0; }

  launch(vx, vy) {
    if (this.body) this.scene.matter.body.setVelocity(this.body, { x: vx, y: vy });
  }

  getSpeed() {
    if (!this.body) return 0;
    const v = this.body.velocity;
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  update() {
    if (this.gfx && this.body) {
      this.gfx.x = this.body.position.x;
      this.gfx.y = this.body.position.y;
      if (this.onPortalCheck) this.onPortalCheck();
    }
  }

  die() {
    this.alive = false;
    if (this.gfx) { this.gfx.destroy(); this.gfx = null; }
    if (this.body) { this.scene.matter.world.remove(this.body); this.body = null; }
  }

  destroy() { this.die(); }
}
