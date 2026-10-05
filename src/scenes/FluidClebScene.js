// ============================================================
// FluidCleb Interactive — Splash Screen Procedural
// Cena Phaser 3 — 0.0s a 2.8s
// ============================================================
import Phaser from 'phaser';
import { playFluidClebIntro } from '../audio/AudioManager.js';

export default class FluidClebScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FluidClebScene' });
    this.orbs = [];
    this.elapsed = 0;
    this.phase = 'rising'; // rising | fusion | reveal | done
    this.fusionDone = false;
    this.loadingLabels = [
      'Inicializando engine...',
      'Carregando física...',
      'Preparando blobs...',
      'Calibrando estilingue...',
      'Abrindo portais...',
      'Pronto!'
    ];
    this.labelIndex = 0;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Fundo profundo
    this.add.rectangle(W / 2, H / 2, W, H, 0x020617);

    // Partículas de fundo (estrelas)
    for (let i = 0; i < 60; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        Phaser.Math.Between(1, 2),
        0x38bdf8, Phaser.Math.FloatBetween(0.1, 0.5)
      );
      this.tweens.add({
        targets: star, alpha: { from: 0.1, to: 0.7 },
        duration: Phaser.Math.Between(800, 2000),
        yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 1500)
      });
    }

    // Criar orbes
    this._createOrbs(W, H);

    // Barra de carregamento
    this.barBg = this.add.rectangle(W / 2, H - 60, W * 0.6, 6, 0x1e3a5f).setOrigin(0.5);
    this.barFill = this.add.rectangle(W / 2 - W * 0.3, H - 60, 0, 6, 0x00f5ff).setOrigin(0, 0.5);

    // Label de carregamento
    this.loadLabel = this.add.text(W / 2, H - 40, this.loadingLabels[0], {
      fontFamily: 'Segoe UI, Arial',
      fontSize: '12px',
      color: '#38bdf8',
      alpha: 0.8
    }).setOrigin(0.5);

    // Logo e marca — inicialmente invisíveis
    this.logoGroup = this.add.container(W / 2, H / 2);

    // Emblema da gota metálica
    const dropShape = this.make.graphics({ x: 0, y: -80, add: false });
    dropShape.fillStyle(0x94a3b8, 1);
    dropShape.fillCircle(0, 0, 28);
    dropShape.fillTriangle(-20, -5, 20, -5, 0, -40);
    dropShape.fillStyle(0x0284c7, 0.8);
    dropShape.fillCircle(0, 0, 16);
    this.logoGroup.add(dropShape);

    // Texto FLUIDCLEB
    const logoText = this.add.text(0, -20, 'FLUIDCLEB', {
      fontFamily: 'Segoe UI, Arial Black',
      fontSize: '38px',
      fontStyle: 'bold',
      color: '#00f5ff',
      stroke: '#0284c7',
      strokeThickness: 3,
      shadow: { color: '#00f5ff', fill: true, blur: 20, offsetX: 0, offsetY: 0 }
    }).setOrigin(0.5);
    this.logoGroup.add(logoText);

    // Texto INTERACTIVE
    const subText = this.add.text(0, 22, 'INTERACTIVE', {
      fontFamily: 'Segoe UI, Arial',
      fontSize: '13px',
      letterSpacing: 6,
      color: '#38bdf8',
      alpha: 0.9
    }).setOrigin(0.5);
    this.logoGroup.add(subText);

    this.logoGroup.setAlpha(0);

    // Iniciar áudio
    playFluidClebIntro();

    // Ciclo de labels
    this._scheduleLabelUpdates(W, H);
  }

  _createOrbs(W, H) {
    const colors = [0x00f5ff, 0x38bdf8, 0x0284c7];
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(W * 0.2, W * 0.8);
      const size = Phaser.Math.Between(10, 22);
      const color = colors[i % colors.length];
      const orb = this.add.circle(x, H + 30, size, color, 0.85);

      // Glow via second circle
      const glow = this.add.circle(x, H + 30, size * 1.8, color, 0.15);

      this.orbs.push({ orb, glow, startX: x, targetX: W / 2, size, delay: i * 0.15 });

      // Animação de subida
      this.tweens.add({
        targets: [orb, glow],
        y: { from: H + 30, to: Phaser.Math.Between(H * 0.2, H * 0.5) },
        duration: 700 + i * 100,
        delay: i * 150,
        ease: 'Sine.easeOut',
        onComplete: () => {
          // Convergir para o centro
          this.tweens.add({
            targets: [orb, glow],
            x: W / 2,
            y: H / 2,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 250,
            ease: 'Power2.easeIn',
            delay: i * 30
          });
        }
      });
    }
  }

  _scheduleLabelUpdates(W, H) {
    const maxWidth = W * 0.6;
    this.time.addEvent({
      delay: 420,
      repeat: this.loadingLabels.length - 2,
      callback: () => {
        this.labelIndex = Math.min(this.labelIndex + 1, this.loadingLabels.length - 1);
        this.loadLabel.setText(this.loadingLabels[this.labelIndex]);
        // Avança barra
        const progress = this.labelIndex / (this.loadingLabels.length - 1);
        this.tweens.add({
          targets: this.barFill,
          width: maxWidth * progress,
          duration: 400,
          ease: 'Sine.easeOut'
        });
      }
    });
  }

  update(time, delta) {
    this.elapsed += delta / 1000;
    const W = this.scale.width;
    const H = this.scale.height;

    // Em 0.7s: fusão central — flash e logo aparece
    if (this.elapsed >= 0.7 && !this.fusionDone) {
      this.fusionDone = true;

      // Flash branco
      const flash = this.add.rectangle(W / 2, H / 2, W, H, 0xffffff, 0.6);
      this.tweens.add({
        targets: flash, alpha: 0, duration: 400, ease: 'Power2.easeOut',
        onComplete: () => flash.destroy()
      });

      // Reveal do logo
      this.tweens.add({
        targets: this.logoGroup,
        alpha: 1,
        duration: 500,
        ease: 'Sine.easeOut'
      });

      // Pulse do logo
      this.tweens.add({
        targets: this.logoGroup,
        scaleX: { from: 1.2, to: 1 },
        scaleY: { from: 1.2, to: 1 },
        duration: 400,
        ease: 'Back.easeOut'
      });
    }

    // Em 2.8s: transição para próxima cena
    if (this.elapsed >= 2.8) {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('LoreScene');
      });
      this.elapsed = -9999; // Evitar re-trigger
    }
  }
}
