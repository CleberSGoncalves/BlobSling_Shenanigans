// ============================================================
// GameScene — Core Gameplay Loop completo
// Estilingue preciso, física de Blobs, portais, poderes
// Phaser 3 + Matter.js Physics
// ============================================================
import Phaser from 'phaser';
import {
  gameplayStart, gameplayStop,
  showRewardedAd, showMidgameAd
} from '../sdk/CrazyGamesSDK.js';
import {
  playSlingshot, playBounce, playPortalSuccess,
  playBlobSplit, playExplosion, playFail, playSticky, muteAudio
} from '../audio/AudioManager.js';
import { LEVELS } from '../data/Levels.js';
import BlobObject from '../objects/BlobObject.js';
import SlingshotObject from '../objects/SlingshotObject.js';
import PortalObject from '../objects/PortalObject.js';
import HUD from '../ui/HUD.js';
import { generateInfiniteLevel } from '../data/InfiniteGenerator.js';
import { setMusicState, muteMusic } from '../audio/MusicManager.js';
import ParallaxBackground from '../effects/ParallaxBackground.js';

const LEVEL_TIME = 30; // segundos por fase

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.levelIndex = data.level || 1;
    this.gameMode = data.mode || 'campaign';
    this.score = data.score || 0;
    this.coins = data.coins || 0;
    this.timeLeft = LEVEL_TIME;
    this.gameOver = false;
    this.levelComplete = false;
    this.blobsUsed = 0;
    this.activeBlobType = 'normal'; // normal | explosive | sticky | ice
    this.reviveUsed = false;
    this.infiniteScore = 0;
    this.lastMidgameAdLevel = 0;
    this.invulnTimer = 0;
  }

  preload() {
    // Geração de texturas procedurais em tempo de execução
    // (sem arquivos externos)
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Mute state
    const muted = localStorage.getItem('bss_mute') === '1';
    muteAudio(muted);
    muteMusic(muted);

    // Parallax background atmosférico (Princípio 4)
    this.parallax = new ParallaxBackground(this, W, H);

    // Iniciar música dinâmica de gameplay
    setMusicState('gameplay');

    // Physics com Matter.js
    this.matter.world.setGravity(0, 1.2);
    this.matter.world.setBounds(0, 0, W, H, 64);

    // Carregar dados do nível
    if (this.gameMode === 'infinite') {
      this.levelData = generateInfiniteLevel(this.levelIndex, W, H);
    } else {
      const idx = ((this.levelIndex - 1) % LEVELS.length);
      this.levelData = LEVELS[idx](W, H);
    }

    // Fundo do nível
    this._buildBackground(W, H);

    // Construir nível (plataformas, armadilhas)
    this._buildLevel(W, H);

    // Portal mágico
    this.portal = new PortalObject(this, this.levelData.portal.x, this.levelData.portal.y);

    // Estilingue
    this.slingshot = new SlingshotObject(this, this.levelData.sling.x, this.levelData.sling.y);

    // HUD
    this.hud = new HUD(this, W, H, {
      level: this.levelIndex,
      mode: this.gameMode,
      blobPowers: ['normal', 'explosive', 'sticky', 'ice'],
      onSelectPower: (type) => { this.activeBlobType = type; }
    });

    // Timer de 30s
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      repeat: LEVEL_TIME - 1,
      callback: this._onTimerTick,
      callbackScope: this
    });

    // Input: drag estilingue (Mouse + Touch)
    this._setupInput();

    // Iniciar ciclo de vida SDK
    gameplayStart();

    // Fade in
    this.cameras.main.fadeIn(300);
  }

  _buildBackground(W, H) {
    // Fundo temático por nível
    const colors = [
      [0x0a0a2e, 0x1e3a5f],
      [0x1a0a0e, 0x3b0d1a],
      [0x0a1a0a, 0x134e13],
      [0x1a1a0a, 0x4e3b0d]
    ];
    const palette = colors[(this.levelIndex - 1) % colors.length];
    const bg = this.add.graphics();
    bg.fillGradientStyle(palette[0], palette[0], palette[1], palette[1], 1);
    bg.fillRect(0, 0, W, H);

    // Grid sutil
    const grid = this.add.graphics();
    grid.lineStyle(1, 0xffffff, 0.04);
    for (let x = 0; x < W; x += 48) grid.lineBetween(x, 0, x, H);
    for (let y = 0; y < H; y += 48) grid.lineBetween(0, y, W, y);
  }

  _buildLevel(W, H) {
    const { platforms, spikes, sticky, walls } = this.levelData;

    this.platforms = [];
    this.spikes = [];

    // Plataformas sólidas
    (platforms || []).forEach(p => {
      const rect = this.matter.add.rectangle(p.x, p.y, p.w, p.h, {
        isStatic: true,
        friction: 0.1,
        restitution: 0.4,
        label: 'platform'
      });

      // Visual
      const gfx = this.add.graphics();
      gfx.fillStyle(p.color || 0x334155, 1);
      gfx.fillRoundedRect(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h, 6);
      gfx.lineStyle(2, 0x64748b, 0.6);
      gfx.strokeRoundedRect(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h, 6);
      this.platforms.push({ body: rect, gfx });
    });

    // Superfícies pegajosas (sticky)
    (sticky || []).forEach(s => {
      const rect = this.matter.add.rectangle(s.x, s.y, s.w, s.h, {
        isStatic: true, friction: 5, restitution: 0, label: 'sticky'
      });
      const gfx = this.add.graphics();
      gfx.fillStyle(0x16a34a, 0.85);
      gfx.fillRoundedRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h, 4);
      // Padrão de pontos
      gfx.fillStyle(0x22c55e, 0.4);
      for (let i = 0; i < 6; i++) {
        gfx.fillCircle(
          s.x - s.w / 2 + (i + 0.5) * (s.w / 6),
          s.y,
          3
        );
      }
    });

    // Espinhos (mortais)
    (spikes || []).forEach(sp => {
      const rect = this.matter.add.rectangle(sp.x, sp.y, sp.w || 20, sp.h || 20, {
        isStatic: true, isSensor: true, label: 'spike'
      });
      const gfx = this.add.graphics();
      gfx.fillStyle(0xef4444, 0.9);
      const count = Math.ceil((sp.w || 20) / 15);
      for (let i = 0; i < count; i++) {
        const tx = sp.x - (sp.w || 20) / 2 + i * 15 + 7.5;
        gfx.fillTriangle(tx - 7, sp.y + 8, tx + 7, sp.y + 8, tx, sp.y - 8);
      }
    });

    // Paredes invisíveis extras
    (walls || []).forEach(w => {
      this.matter.add.rectangle(w.x, w.y, w.w, w.h, { isStatic: true, label: 'wall' });
    });

    // Chão visual
    const ground = this.add.graphics();
    ground.fillStyle(0x1e293b, 1);
    ground.fillRect(0, H - 20, W, 20);
  }

  _setupInput() {
    const W = this.scale.width;
    const H = this.scale.height;

    let dragging = false;
    let startX = 0, startY = 0;
    let dragX = 0, dragY = 0;
    const MAX_DRAG = Math.min(W, H) * 0.12;

    const sx = this.slingshot.x;
    const sy = this.slingshot.y;

    // Anel de mira
    this.aimRing = this.add.graphics();
    this.aimLine = this.add.graphics();

    const onStart = (pointer) => {
      if (this.gameOver || this.levelComplete) return;
      // Verificar se clicou na zona do estilingue
      const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, sx, sy);
      if (dist < MAX_DRAG * 1.5) {
        dragging = true;
        startX = sx;
        startY = sy;
      }
    };

    const onMove = (pointer) => {
      if (!dragging) return;
      const dx = Phaser.Math.Clamp(pointer.x - startX, -MAX_DRAG, MAX_DRAG);
      const dy = Phaser.Math.Clamp(pointer.y - startY, -MAX_DRAG, MAX_DRAG);
      dragX = dx; dragY = dy;
      this.slingshot.setDrag(dx, dy);
      this._drawAim(sx, sy, dx, dy, MAX_DRAG);
    };

    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      this.aimRing.clear();
      this.aimLine.clear();
      this.slingshot.setDrag(0, 0);
      this._launchBlob(dragX, dragY, MAX_DRAG, sx, sy);
      dragX = 0; dragY = 0;
    };

    this.input.on('pointerdown', onStart);
    this.input.on('pointermove', onMove);
    this.input.on('pointerup', onEnd);

    // Teclado (espaço = lançar automático para cima)
    this.input.keyboard.on('keydown-SPACE', () => {
      if (!dragging) this._launchBlob(-50, -120, MAX_DRAG, sx, sy);
    });
  }

  _drawAim(sx, sy, dx, dy, maxDrag) {
    this.aimLine.clear();
    this.aimRing.clear();

    // Linha tracejada de trajetória
    const power = Math.sqrt(dx * dx + dy * dy) / maxDrag;
    const vx = -dx * 0.18;
    const vy = -dy * 0.18;
    const gravity = 0.012;

    this.aimLine.lineStyle(2, 0x00f5ff, 0.5);
    this.aimLine.beginPath();
    this.aimLine.moveTo(sx, sy);

    let px = sx, py = sy;
    let pvx = vx, pvy = vy;
    for (let i = 0; i < 20; i++) {
      px += pvx * 5;
      py += pvy * 5;
      pvy += gravity * 5;
      if (i % 2 === 0) {
        this.aimLine.lineTo(px, py);
        this.aimLine.moveTo(px, py);
      }
    }
    this.aimLine.strokePath();

    // Anel no blob
    const bx = sx + dx;
    const by = sy + dy;
    this.aimRing.lineStyle(2, 0x00f5ff, 0.8);
    this.aimRing.strokeCircle(bx, by, 16);

    // Indicador de poder
    const col = power > 0.7 ? 0xef4444 : power > 0.4 ? 0xf59e0b : 0x22c55e;
    this.aimRing.fillStyle(col, 0.3);
    this.aimRing.fillCircle(bx, by, 16 * power);
  }

  _launchBlob(dx, dy, maxDrag, sx, sy) {
    if (this.gameOver || this.levelComplete) return;

    const type = this.activeBlobType;
    const power = Math.sqrt(dx * dx + dy * dy) / maxDrag;
    if (power < 0.05) return; // Drag muito pequeno

    const blob = new BlobObject(this, sx, sy, type);

    // Velocidade proporcional ao drag
    const vx = (-dx / maxDrag) * 22;
    const vy = (-dy / maxDrag) * 22;

    blob.launch(vx, vy);
    playSlingshot();
    this.blobsUsed++;

    // Registrar blob ativo para colisões
    this._registerBlobCollisions(blob);
  }

  _registerBlobCollisions(blob) {
    // Colisão com portal
    this.matter.overlap(blob.body, this.portal.sensor, () => {
      if (!this.levelComplete) this._onPortalReached(blob);
    });

    // Colisão com espinhos
    this.matterCollision?.addOnCollideStart({
      objectA: blob.body,
      callback: ({ gameObjectB }) => {
        if (gameObjectB?.label === 'spike') this._onSpikeHit(blob);
        if (gameObjectB?.label === 'sticky') {
          blob.stick();
          playSticky();
        }
        if (gameObjectB?.label === 'platform' || gameObjectB?.label === 'wall') {
          const speed = blob.getSpeed();
          if (speed > 2) playBounce(speed);
        }
      }
    });

    // Detecção manual de sobreposição portal (fallback sem plugin)
    blob.onPortalCheck = () => {
      if (!this.portal) return;
      const dist = Phaser.Math.Distance.Between(
        blob.x, blob.y,
        this.portal.x, this.portal.y
      );
      if (dist < 35 && !this.levelComplete) {
        this._onPortalReached(blob);
      }
    };
  }

  _onPortalReached(blob) {
    this.levelComplete = true;
    blob.destroy();
    this.timerEvent?.remove();
    gameplayStop();

    // Efeito sonoro e música de vitória
    setMusicState('victory');
    this.portal.playSuccessEffect();
    playPortalSuccess();

    // Calcular pontuação
    const timeBonus = this.timeLeft * 10;
    const blobBonus = Math.max(0, (5 - this.blobsUsed) * 50);
    const levelScore = 100 + timeBonus + blobBonus;
    this.score += levelScore;
    this.coins += Math.floor(levelScore / 20);

    // Após 1.5s: ir para tela de vitória
    this.time.delayedCall(1500, () => {
      // Midgame ad a cada 3 níveis
      if ((this.levelIndex - this.lastMidgameAdLevel) >= 3) {
        this.lastMidgameAdLevel = this.levelIndex;
        showMidgameAd(() => this._showVictoryScreen(levelScore));
      } else {
        this._showVictoryScreen(levelScore);
      }
    });
  }

  _showVictoryScreen(levelScore) {
    const W = this.scale.width;
    const H = this.scale.height;

    // Overlay
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7).setDepth(10);
    const panel = this.add.rectangle(W / 2, H / 2, Math.min(W * 0.85, 380), Math.min(H * 0.65, 420), 0x0f172a, 1)
      .setDepth(11).setStrokeStyle(2, 0x00f5ff, 0.8);

    const texts = [
      this.add.text(W / 2, H / 2 - 120, '🎉 FASE COMPLETA!', {
        fontFamily: 'Segoe UI, Arial Black', fontSize: '26px',
        color: '#00f5ff', stroke: '#0284c7', strokeThickness: 3
      }).setOrigin(0.5).setDepth(12),

      this.add.text(W / 2, H / 2 - 70, `Pontuação: ${levelScore}`, {
        fontFamily: 'Segoe UI, Arial', fontSize: '18px', color: '#f59e0b'
      }).setOrigin(0.5).setDepth(12),

      this.add.text(W / 2, H / 2 - 40, `Total: ${this.score}  🪙 ${this.coins}`, {
        fontFamily: 'Segoe UI, Arial', fontSize: '16px', color: '#e2e8f0'
      }).setOrigin(0.5).setDepth(12),

      this.add.text(W / 2, H / 2, `⏱ Bônus de Tempo: +${this.timeLeft * 10}`, {
        fontFamily: 'Segoe UI, Arial', fontSize: '14px', color: '#94a3b8'
      }).setOrigin(0.5).setDepth(12)
    ];

    // Botão 2x Moedas (Rewarded)
    const dblBtn = this._makeOverlayButton(W / 2, H / 2 + 65, '🎁 Dobrar Moedas (Ad)', 0xf59e0b, 0xd97706, 12);
    dblBtn.on('pointerdown', () => {
      dblBtn.destroy();
      showRewardedAd(() => {
        this.coins *= 2;
        texts[2].setText(`Total: ${this.score}  🪙 ${this.coins}`);
        this.add.text(W / 2, H / 2 + 65, '✅ Moedas Dobradas!', {
          fontFamily: 'Segoe UI, Arial', fontSize: '16px', color: '#22c55e'
        }).setOrigin(0.5).setDepth(13);
      });
    });

    // Botão próxima fase
    const nextBtn = this._makeOverlayButton(W / 2, H / 2 + 115, '▶ Próxima Fase', 0x22c55e, 0x16a34a, 12);
    nextBtn.on('pointerdown', () => {
      this._saveProgress();
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.restart({ level: this.levelIndex + 1, mode: this.gameMode, score: this.score, coins: this.coins });
      });
    });
  }

  _onSpikeHit(blob) {
    if (this.invulnTimer > 0) return;
    blob.die();
    playFail();

    if (!this.reviveUsed) {
      this._showReviveScreen();
    } else {
      this._showGameOverScreen();
    }
  }

  _showReviveScreen() {
    const W = this.scale.width;
    const H = this.scale.height;
    gameplayStop();

    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75).setDepth(10);
    const panel = this.add.rectangle(W / 2, H / 2, Math.min(W * 0.8, 360), 260, 0x1a0a0e, 1)
      .setDepth(11).setStrokeStyle(2, 0xef4444, 0.8);

    this.add.text(W / 2, H / 2 - 90, '💀 Blob Esmagado!', {
      fontFamily: 'Segoe UI, Arial Black', fontSize: '24px', color: '#ef4444'
    }).setOrigin(0.5).setDepth(12);

    // Botão Reviver (Rewarded)
    const reviveBtn = this._makeOverlayButton(W / 2, H / 2 - 20, '❤️ Reviver (Ad)', 0xef4444, 0xb91c1c, 12);
    reviveBtn.on('pointerdown', () => {
      this.reviveUsed = true;
      showRewardedAd(() => {
        overlay.destroy(); panel.destroy(); reviveBtn.destroy();
        this._destroyOverlayTextAt(H / 2 - 90);
        this.invulnTimer = 3000; // 3s de invulnerabilidade
        gameplayStart();
        this.gameOver = false;
        this.levelComplete = false;
        this.timerEvent?.remove();
        this.timerEvent = this.time.addEvent({
          delay: 1000, repeat: this.timeLeft - 1,
          callback: this._onTimerTick, callbackScope: this
        });
        // Flash de invulnerabilidade
        const flash = this.add.rectangle(W / 2, H / 2, W, H, 0x00f5ff, 0.2).setDepth(5);
        this.tweens.add({ targets: flash, alpha: 0, duration: 3000, ease: 'Linear', onComplete: () => flash.destroy() });
      });
    });

    // Botão Menu
    const menuBtn = this._makeOverlayButton(W / 2, H / 2 + 50, '🏠 Menu Principal', 0x334155, 0x1e293b, 12);
    menuBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
    });
  }

  _showGameOverScreen() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.timerEvent?.remove();
    gameplayStop();

    // Música de Game Over
    setMusicState('gameover');

    const W = this.scale.width;
    const H = this.scale.height;

    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.8).setDepth(10);
    const panel = this.add.rectangle(W / 2, H / 2, Math.min(W * 0.8, 360), 280, 0x1a0a0e, 1)
      .setDepth(11).setStrokeStyle(2, 0xef4444, 0.8);

    this.add.text(W / 2, H / 2 - 100, '💀 GAME OVER', {
      fontFamily: 'Segoe UI, Arial Black', fontSize: '30px', color: '#ef4444', stroke: '#7f1d1d', strokeThickness: 3
    }).setOrigin(0.5).setDepth(12);

    this.add.text(W / 2, H / 2 - 55, `Fase ${this.levelIndex} | Pontuação: ${this.score}`, {
      fontFamily: 'Segoe UI, Arial', fontSize: '15px', color: '#94a3b8'
    }).setOrigin(0.5).setDepth(12);

    // Pular Fase (Rewarded)
    const skipBtn = this._makeOverlayButton(W / 2, H / 2 + 0, '⏭ Pular Fase (Ad)', 0x8b5cf6, 0x7c3aed, 12);
    skipBtn.on('pointerdown', () => {
      showRewardedAd(() => {
        this._saveProgress();
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.restart({ level: this.levelIndex + 1, mode: this.gameMode, score: this.score, coins: this.coins });
        });
      });
    });

    // Tentar novamente
    const retryBtn = this._makeOverlayButton(W / 2, H / 2 + 60, '🔄 Tentar Novamente', 0xf59e0b, 0xd97706, 12);
    retryBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.restart({ level: this.levelIndex, mode: this.gameMode, score: this.score, coins: this.coins });
      });
    });

    const menuBtn = this._makeOverlayButton(W / 2, H / 2 + 115, '🏠 Menu', 0x334155, 0x1e293b, 12);
    menuBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
    });
  }

  _makeOverlayButton(x, y, label, color, hoverColor, depth) {
    const btn = this.add.text(x, y, label, {
      fontFamily: 'Segoe UI, Arial',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: `#${color.toString(16).padStart(6, '0')}`,
      padding: { x: 18, y: 10 }
    }).setOrigin(0.5).setDepth(depth).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setStyle({ backgroundColor: `#${hoverColor.toString(16).padStart(6, '0')}` }));
    btn.on('pointerout', () => btn.setStyle({ backgroundColor: `#${color.toString(16).padStart(6, '0')}` }));
    return btn;
  }

  _destroyOverlayTextAt(y) {
    this.children.list
      .filter(c => c.type === 'Text' && Math.abs(c.y - y) < 5 && c.depth >= 10)
      .forEach(c => c.destroy());
  }

  _onTimerTick() {
    this.timeLeft = Math.max(0, this.timeLeft - 1);
    if (this.hud) this.hud.updateTimer(this.timeLeft);

    // Alerta musical de urgência quando tempo estiver acabando
    if (this.timeLeft === 8) {
      setMusicState('gameplay_urgent');
    }

    if (this.timeLeft <= 0 && !this.levelComplete && !this.gameOver) {
      this._showGameOverScreen();
    }
  }

  _saveProgress() {
    const saved = JSON.parse(localStorage.getItem('bss_save') || '{}');
    saved.highLevel = Math.max(saved.highLevel || 0, this.levelIndex);
    saved.totalScore = Math.max(saved.totalScore || 0, this.score);
    saved.coins = (saved.coins || 0) + this.coins;
    localStorage.setItem('bss_save', JSON.stringify(saved));
  }

  update(time, delta) {
    if (this.gameOver || this.levelComplete) return;

    // Atualização de parallax de fundo baseado no cursor/touch
    if (this.parallax && this.input.activePointer) {
      this.parallax.update(this.input.activePointer.x, this.input.activePointer.y);
    }

    // Invulnerabilidade pós-revive
    if (this.invulnTimer > 0) this.invulnTimer -= delta;

    // Atualizar objetos
    if (this.slingshot) this.slingshot.update();
    if (this.portal) this.portal.update(time);
    if (this.hud) this.hud.update(delta);

    // Verificar colisão blob→portal manualmente
    this.children.list.forEach(child => {
      if (child.onPortalCheck) child.onPortalCheck();
    });
  }
}
