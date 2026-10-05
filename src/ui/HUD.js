// ============================================================
// HUD — Interface responsiva, sem sobreposição
// Timer, score, poderes especiais, moedas
// ============================================================
import Phaser from 'phaser';

const POWER_CONFIGS = {
  normal:    { icon: '🟢', label: 'Normal',    color: 0x22c55e },
  explosive: { icon: '💥', label: 'Explosivo', color: 0xef4444 },
  sticky:    { icon: '🟣', label: 'Grudento',  color: 0xa855f7 },
  ice:       { icon: '❄️', label: 'Gelo',       color: 0x38bdf8 }
};

export default class HUD {
  constructor(scene, W, H, options = {}) {
    this.scene = scene;
    this.W = W;
    this.H = H;
    this.options = options;
    this.selectedPower = 'normal';
    this.pulseTime = 0;

    this._buildTopBar();
    this._buildPowerBar();
    this._buildTimerBar();
  }

  _buildTopBar() {
    const W = this.W;
    const pad = 12;

    // Barra superior semi-transparente
    const topBar = this.scene.add.graphics().setDepth(20);
    topBar.fillStyle(0x0f172a, 0.82);
    topBar.fillRoundedRect(0, 0, W, 48, 0);

    // Ícone + Nível
    this.levelText = this.scene.add.text(pad + 4, 14, `🎯 Fase ${this.options.level || 1}`, {
      fontFamily: 'Segoe UI, Arial',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#00f5ff'
    }).setDepth(21);

    // Score
    this.scoreText = this.scene.add.text(W / 2, 14, `⭐ 0`, {
      fontFamily: 'Segoe UI, Arial',
      fontSize: '15px',
      color: '#f59e0b'
    }).setOrigin(0.5, 0).setDepth(21);

    // Moedas
    this.coinText = this.scene.add.text(W - pad, 14, `🪙 0`, {
      fontFamily: 'Segoe UI, Arial',
      fontSize: '15px',
      color: '#fbbf24'
    }).setOrigin(1, 0).setDepth(21);

    // Modo badge
    const modeLabel = this.options.mode === 'infinite' ? '∞ INFINITO' : '📋 CAMPANHA';
    this.scene.add.text(W / 2, 32, modeLabel, {
      fontFamily: 'Segoe UI, Arial',
      fontSize: '9px',
      color: '#475569',
      letterSpacing: 3
    }).setOrigin(0.5, 0).setDepth(21);
  }

  _buildTimerBar() {
    const W = this.W;

    // Background da barra de tempo
    this.timerBg = this.scene.add.graphics().setDepth(20);
    this.timerBg.fillStyle(0x1e293b, 0.9);
    this.timerBg.fillRect(0, 48, W, 8);

    // Preenchimento
    this.timerFill = this.scene.add.graphics().setDepth(21);
    this._drawTimerFill(30);

    // Label do timer (canto)
    this.timerText = this.scene.add.text(this.W / 2, 60, '⏱ 30s', {
      fontFamily: 'Segoe UI, Arial',
      fontSize: '13px',
      color: '#22c55e'
    }).setOrigin(0.5, 0).setDepth(22);
  }

  _drawTimerFill(seconds) {
    const W = this.W;
    const ratio = seconds / 30;
    const color = ratio > 0.5 ? 0x22c55e : ratio > 0.25 ? 0xf59e0b : 0xef4444;

    this.timerFill.clear();
    this.timerFill.fillStyle(color, 1);
    this.timerFill.fillRect(0, 48, W * ratio, 8);

    // Glow na extremidade
    if (ratio > 0.01) {
      this.timerFill.fillStyle(color, 0.3);
      this.timerFill.fillRect(W * ratio - 6, 48, 6, 8);
    }
  }

  _buildPowerBar() {
    const W = this.W;
    const H = this.H;
    const powers = this.options.blobPowers || ['normal'];
    const btnSize = Math.min(52, (W - 32) / powers.length - 10);
    const totalW = powers.length * (btnSize + 8) - 8;
    const startX = (W - totalW) / 2;
    const barY = H - btnSize - 16;

    // Background da barra de poderes
    const barBg = this.scene.add.graphics().setDepth(20);
    barBg.fillStyle(0x0f172a, 0.88);
    barBg.fillRoundedRect(startX - 10, barY - 8, totalW + 20, btnSize + 24, 12);
    barBg.lineStyle(1, 0x334155, 0.6);
    barBg.strokeRoundedRect(startX - 10, barY - 8, totalW + 20, btnSize + 24, 12);

    this.powerBtns = {};
    powers.forEach((type, i) => {
      const cfg = POWER_CONFIGS[type];
      const bx = startX + i * (btnSize + 8) + btnSize / 2;
      const by = barY + btnSize / 2;

      // Botão de fundo
      const btnBg = this.scene.add.graphics().setDepth(21);
      const isSelected = type === this.selectedPower;
      this._drawPowerBtn(btnBg, bx - btnSize / 2, barY, btnSize, cfg.color, isSelected);

      // Ícone
      const icon = this.scene.add.text(bx, by - 4, cfg.icon, {
        fontSize: `${Math.max(18, btnSize * 0.4)}px`
      }).setOrigin(0.5).setDepth(22);

      // Label
      const label = this.scene.add.text(bx, barY + btnSize + 2, cfg.label, {
        fontFamily: 'Segoe UI, Arial',
        fontSize: '9px',
        color: '#94a3b8'
      }).setOrigin(0.5, 0).setDepth(22);

      // Zona de toque
      const hitZone = this.scene.add.rectangle(bx, by, btnSize, btnSize, 0x000000, 0)
        .setDepth(23).setInteractive({ useHandCursor: true });

      hitZone.on('pointerdown', () => {
        this.selectedPower = type;
        if (this.options.onSelectPower) this.options.onSelectPower(type);
        this._refreshPowerBtns();
      });
      hitZone.on('pointerover', () => {
        this.scene.tweens.add({ targets: [icon, label], scaleX: 1.15, scaleY: 1.15, duration: 100 });
      });
      hitZone.on('pointerout', () => {
        this.scene.tweens.add({ targets: [icon, label], scaleX: 1, scaleY: 1, duration: 100 });
      });

      this.powerBtns[type] = { btnBg, icon, label, bx, barY, btnSize, cfg, hitZone };
    });
  }

  _drawPowerBtn(gfx, x, y, size, color, selected) {
    gfx.clear();
    if (selected) {
      gfx.fillStyle(color, 0.35);
      gfx.fillRoundedRect(x - 2, y - 2, size + 4, size + 4, 10);
      gfx.lineStyle(2, color, 0.9);
      gfx.strokeRoundedRect(x - 2, y - 2, size + 4, size + 4, 10);
    } else {
      gfx.fillStyle(0x1e293b, 0.8);
      gfx.fillRoundedRect(x, y, size, size, 8);
      gfx.lineStyle(1, 0x334155, 0.5);
      gfx.strokeRoundedRect(x, y, size, size, 8);
    }
  }

  _refreshPowerBtns() {
    Object.entries(this.powerBtns).forEach(([type, btn]) => {
      const selected = type === this.selectedPower;
      this._drawPowerBtn(btn.btnBg, btn.bx - btn.btnSize / 2, btn.barY, btn.btnSize, btn.cfg.color, selected);
      if (selected) {
        this.scene.tweens.add({ targets: btn.icon, scaleX: 1.25, scaleY: 1.25, duration: 150, yoyo: true });
      }
    });
  }

  updateTimer(seconds) {
    this._drawTimerFill(seconds);
    const color = seconds > 15 ? '#22c55e' : seconds > 8 ? '#f59e0b' : '#ef4444';
    this.timerText.setText(`⏱ ${seconds}s`).setColor(color);

    // Pulso urgente nos últimos 5 segundos
    if (seconds <= 5) {
      this.scene.tweens.add({
        targets: this.timerText,
        scaleX: { from: 1.3, to: 1 }, scaleY: { from: 1.3, to: 1 },
        duration: 200, ease: 'Back.easeOut'
      });
    }
  }

  updateScore(score, coins) {
    if (this.scoreText) this.scoreText.setText(`⭐ ${score}`);
    if (this.coinText) this.coinText.setText(`🪙 ${coins}`);
  }

  update(delta) {
    this.pulseTime += delta / 1000;
  }

  destroy() {
    Object.values(this.powerBtns).forEach(b => {
      b.btnBg?.destroy(); b.icon?.destroy(); b.label?.destroy(); b.hitZone?.destroy();
    });
    this.timerFill?.destroy();
    this.timerBg?.destroy();
    this.timerText?.destroy();
    this.scoreText?.destroy();
    this.coinText?.destroy();
    this.levelText?.destroy();
  }
}
