import Phaser from 'phaser';
import { gameplayStop } from '../sdk/CrazyGamesSDK.js';
import { setMusicState, muteMusic } from '../audio/MusicManager.js';
import { muteAudio } from '../audio/AudioManager.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    gameplayStop();

    // Iniciar trilha sonora do menu
    setMusicState('menu');

    // Fundo gradiente
    const grad = this.add.graphics();
    grad.fillGradientStyle(0x020617, 0x020617, 0x0f172a, 0x1e3a5f, 1);
    grad.fillRect(0, 0, W, H);

    // Partículas decorativas
    for (let i = 0; i < 30; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        Phaser.Math.Between(3, 8),
        Phaser.Math.RND.pick([0x00f5ff, 0x38bdf8, 0xa855f7, 0x22c55e]),
        Phaser.Math.FloatBetween(0.15, 0.5)
      );
      this.tweens.add({
        targets: p, alpha: 0,
        y: p.y - Phaser.Math.Between(60, 200),
        duration: Phaser.Math.Between(2000, 5000),
        delay: Phaser.Math.Between(0, 3000),
        repeat: -1, yoyo: false,
        onRepeat: () => {
          p.x = Phaser.Math.Between(0, W);
          p.y = H + 10;
          p.alpha = Phaser.Math.FloatBetween(0.15, 0.5);
        }
      });
    }

    // Logo do jogo
    const titleY = H * 0.2;
    const title = this.add.text(W / 2, titleY, '🎯 BlobSling', {
      fontFamily: 'Segoe UI, Arial Black',
      fontSize: `${Math.min(52, W / 10)}px`,
      fontStyle: 'bold',
      color: '#00f5ff',
      stroke: '#0284c7',
      strokeThickness: 4,
      shadow: { color: '#00f5ff', blur: 30, fill: true }
    }).setOrigin(0.5);

    const subtitle = this.add.text(W / 2, titleY + Math.min(60, H * 0.07), 'Shenanigans', {
      fontFamily: 'Segoe UI, Arial Black',
      fontSize: `${Math.min(38, W / 14)}px`,
      color: '#a855f7',
      stroke: '#7c3aed',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Blob decorativo animado
    this._drawMenuBlob(W / 2, titleY + Math.min(115, H * 0.14));

    // Botões principais
    const btnY = H * 0.55;
    const btnW = Math.min(260, W * 0.55);
    const btnH = 52;
    const gap = 14;

    this._makeButton(W / 2, btnY, btnW, btnH, '▶  JOGAR', 0x22c55e, 0x16a34a, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene', { level: 1, mode: 'campaign' });
      });
    });

    this._makeButton(W / 2, btnY + btnH + gap, btnW, btnH, '∞  MODO INFINITO', 0x8b5cf6, 0x7c3aed, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene', { level: 0, mode: 'infinite' });
      });
    });

    this._makeButton(W / 2, btnY + (btnH + gap) * 2, btnW, btnH, '🏆  RECORDES', 0xf59e0b, 0xd97706, () => {
      this.scene.launch('LeaderboardScene');
    });

    // Rodapé FluidCleb
    this.add.text(W / 2, H - 18, 'FluidCleb Interactive © 2026', {
      fontFamily: 'Segoe UI, Arial',
      fontSize: '11px',
      color: '#334155'
    }).setOrigin(0.5);

    // Botão áudio mute
    const savedMute = localStorage.getItem('bss_mute') === '1';
    muteMusic(savedMute);
    muteAudio(savedMute);

    const muteBtn = this.add.text(W - 16, 16, savedMute ? '🔇' : '🔊', {
      fontSize: '22px'
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    muteBtn.on('pointerdown', () => {
      const isMuted = localStorage.getItem('bss_mute') === '1';
      const nextMute = !isMuted;
      localStorage.setItem('bss_mute', nextMute ? '1' : '0');
      muteMusic(nextMute);
      muteAudio(nextMute);
      muteBtn.setText(nextMute ? '🔇' : '🔊');
    });

    // Fade in
    this.cameras.main.fadeIn(400);
  }

  _drawMenuBlob(x, y) {
    const blob = this.add.graphics();
    blob.fillStyle(0x22c55e, 0.9);
    blob.fillCircle(x, y, 22);
    blob.fillStyle(0x16a34a, 0.7);
    blob.fillCircle(x - 8, y - 6, 14);
    blob.fillStyle(0xffffff, 0.5);
    blob.fillCircle(x - 5, y - 10, 5);

    this.tweens.add({
      targets: blob,
      scaleX: { from: 1, to: 1.12 },
      scaleY: { from: 1, to: 0.9 },
      y: y + 4,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  _makeButton(x, y, w, h, label, color, hoverColor, callback) {
    const bg = this.add.rectangle(x, y, w, h, color, 1)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xffffff, 0.3);

    const text = this.add.text(x, y, label, {
      fontFamily: 'Segoe UI, Arial',
      fontSize: `${Math.min(17, w / 14)}px`,
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    bg.on('pointerover', () => {
      bg.setFillStyle(hoverColor);
      this.tweens.add({ targets: [bg, text], scaleX: 1.04, scaleY: 1.04, duration: 120 });
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(color);
      this.tweens.add({ targets: [bg, text], scaleX: 1, scaleY: 1, duration: 120 });
    });
    bg.on('pointerdown', () => {
      this.tweens.add({ targets: [bg, text], scaleX: 0.96, scaleY: 0.96, duration: 80, yoyo: true });
      this.time.delayedCall(80, callback);
    });

    return { bg, text };
  }
}
