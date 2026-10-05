// ============================================================
// LoreScene — Apresentação Narrativa Cinematográfica
// 3 atos imersivos, 5 segundos, partículas volumétricas
// ============================================================
import Phaser from 'phaser';

const LORE_ACTS = [
  {
    title: 'Os Blobs Existem...',
    body: 'Criaturas gelatinosas vivem em labirintos mágicos repletos de perigo.',
    bgColor: 0x0a0a2e,
    accentColor: '#00f5ff'
  },
  {
    title: 'Armadilhas os Aguardam',
    body: 'Superfícies pegajosas, espinhos e obstáculos bloqueiam o caminho à liberdade.',
    bgColor: 0x1a0a0e,
    accentColor: '#f59e0b'
  },
  {
    title: 'O Estilingue Místico',
    body: 'Apenas você e seu estilingue podem guiá-los ao portal da salvação!',
    bgColor: 0x020617,
    accentColor: '#a855f7'
  }
];

export default class LoreScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoreScene' });
    this.actIndex = 0;
    this.elapsed = 0;
    this.particles = [];
    this.transitioning = false;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.bg = this.add.rectangle(W / 2, H / 2, W, H, LORE_ACTS[0].bgColor);

    // Partículas volumétricas de fundo
    this._spawnParticles(W, H);

    // Feixes de luz dinâmicos
    this._createLightBeams(W, H);

    // Texto da lore
    this.actTitle = this.add.text(W / 2, H * 0.35, '', {
      fontFamily: 'Segoe UI, Arial Black',
      fontSize: `${Math.min(36, W / 18)}px`,
      fontStyle: 'bold',
      color: LORE_ACTS[0].accentColor,
      stroke: '#000',
      strokeThickness: 4,
      shadow: { color: LORE_ACTS[0].accentColor, blur: 20, fill: true }
    }).setOrigin(0.5).setWordWrapWidth(W * 0.8);

    this.actBody = this.add.text(W / 2, H * 0.52, '', {
      fontFamily: 'Segoe UI, Arial',
      fontSize: `${Math.min(18, W / 36)}px`,
      color: '#e2e8f0',
      wordWrap: { width: W * 0.75 },
      lineSpacing: 8,
      align: 'center'
    }).setOrigin(0.5);

    // Indicadores de ato
    this.actDots = [];
    for (let i = 0; i < 3; i++) {
      const dot = this.add.circle(W / 2 + (i - 1) * 20, H * 0.72, 5, 0x334155);
      this.actDots.push(dot);
    }

    // Botão Pular História
    const skipBtn = this.add.text(W - 20, 20, '⏭ Pular História', {
      fontFamily: 'Segoe UI, Arial',
      fontSize: '14px',
      color: '#64748b',
      backgroundColor: '#1e293b',
      padding: { x: 10, y: 6 }
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    skipBtn.on('pointerover', () => skipBtn.setColor('#94a3b8'));
    skipBtn.on('pointerout', () => skipBtn.setColor('#64748b'));
    skipBtn.on('pointerdown', () => this._goToGame());

    // Botão Continuar (aparece no ato final)
    this.continueBtn = this.add.text(W / 2, H * 0.82, 'Continuar ➔', {
      fontFamily: 'Segoe UI, Arial Black',
      fontSize: '20px',
      color: '#00f5ff',
      backgroundColor: '#0f172a',
      padding: { x: 24, y: 12 },
      stroke: '#0284c7',
      strokeThickness: 2
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    this.continueBtn.on('pointerover', () => this.continueBtn.setColor('#38bdf8'));
    this.continueBtn.on('pointerout', () => this.continueBtn.setColor('#00f5ff'));
    this.continueBtn.on('pointerdown', () => this._goToGame());

    this._showAct(0);
  }

  _spawnParticles(W, H) {
    for (let i = 0; i < 40; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        Phaser.Math.Between(2, 5),
        Phaser.Math.RND.pick([0x00f5ff, 0xa855f7, 0xf59e0b]),
        Phaser.Math.FloatBetween(0.1, 0.4)
      );
      this.particles.push(p);
      this.tweens.add({
        targets: p,
        y: p.y - Phaser.Math.Between(50, 150),
        x: p.x + Phaser.Math.Between(-30, 30),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        delay: Phaser.Math.Between(0, 2000),
        repeat: -1,
        onRepeat: () => {
          p.x = Phaser.Math.Between(0, W);
          p.y = H + 10;
          p.alpha = Phaser.Math.FloatBetween(0.1, 0.4);
        }
      });
    }
  }

  _createLightBeams(W, H) {
    for (let i = 0; i < 4; i++) {
      const beam = this.add.graphics();
      beam.fillStyle(0x00f5ff, 0.03);
      beam.fillRect(-20, -H, 40, H * 2);
      beam.x = Phaser.Math.Between(W * 0.1, W * 0.9);
      beam.y = H / 2;
      beam.rotation = Phaser.Math.FloatBetween(-0.3, 0.3);
      this.tweens.add({
        targets: beam, alpha: { from: 0, to: 0.8 },
        duration: Phaser.Math.Between(1500, 3000),
        yoyo: true, repeat: -1,
        delay: i * 500
      });
    }
  }

  _showAct(index) {
    const act = LORE_ACTS[index];
    const W = this.scale.width;

    // Fade in text
    this.actTitle.setAlpha(0).setText(act.title).setColor(act.accentColor);
    this.actBody.setAlpha(0).setText(act.body);

    // Update dots
    this.actDots.forEach((dot, i) => {
      dot.setFillStyle(i === index ? 0x00f5ff : 0x334155);
      dot.setRadius(i === index ? 7 : 5);
    });

    // Animate title
    this.tweens.add({
      targets: this.actTitle,
      alpha: 1,
      y: { from: this.scale.height * 0.35 - 20, to: this.scale.height * 0.35 },
      duration: 500,
      ease: 'Sine.easeOut'
    });

    this.tweens.add({
      targets: this.actBody,
      alpha: 1,
      duration: 700,
      delay: 200,
      ease: 'Sine.easeOut'
    });

    // Bg color tween
    this.tweens.addCounter({
      from: 0, to: 1, duration: 500,
      onUpdate: (tween) => {
        const t = tween.getValue();
        const r1 = (this.bg.fillColor >> 16) & 0xff;
        const g1 = (this.bg.fillColor >> 8) & 0xff;
        const b1 = this.bg.fillColor & 0xff;
        const r2 = (act.bgColor >> 16) & 0xff;
        const g2 = (act.bgColor >> 8) & 0xff;
        const b2 = act.bgColor & 0xff;
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        this.bg.setFillStyle((r << 16) | (g << 8) | b);
      }
    });

    // No ato final: mostrar botão Continuar
    if (index === 2) {
      this.tweens.add({
        targets: this.continueBtn,
        alpha: 1,
        duration: 500,
        delay: 800
      });
      this.tweens.add({
        targets: this.continueBtn,
        scaleX: { from: 0.95, to: 1.05 },
        scaleY: { from: 0.95, to: 1.05 },
        duration: 700,
        yoyo: true,
        repeat: -1,
        delay: 1200
      });
    }
  }

  update(time, delta) {
    this.elapsed += delta / 1000;

    // Avança atos automaticamente (a cada ~1.6s)
    if (!this.transitioning && this.actIndex < 2 && this.elapsed > 1.6) {
      this.elapsed = 0;
      this.actIndex++;
      this._showAct(this.actIndex);
    }
  }

  _goToGame() {
    if (this.transitioning) return;
    this.transitioning = true;
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MenuScene');
    });
  }
}
