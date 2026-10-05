// ============================================================
// LeaderboardScene — Placares Globais & Eventos Diários/Semanais
// ============================================================
import Phaser from 'phaser';

export default class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Overlay escuro
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x020617, 0.88).setInteractive();

    // Painel central
    const panelW = Math.min(W * 0.88, 540);
    const panelH = Math.min(H * 0.85, 520);
    const panel = this.add.rectangle(W / 2, H / 2, panelW, panelH, 0x0f172a, 1)
      .setStrokeStyle(2, 0x00f5ff, 0.8);

    // Título
    this.add.text(W / 2, H / 2 - panelH / 2 + 35, '🏆 PLACARES GLOBAIS', {
      fontFamily: 'Segoe UI, Arial Black',
      fontSize: '24px',
      color: '#00f5ff',
      stroke: '#0284c7',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Subtítulo / Evento Semanal
    this.add.text(W / 2, H / 2 - panelH / 2 + 65, '⚡ Evento Semanal: Torneio Místico dos Blobs', {
      fontFamily: 'Segoe UI, Arial',
      fontSize: '13px',
      color: '#f59e0b'
    }).setOrigin(0.5);

    // Carregar save do jogador
    const saved = JSON.parse(localStorage.getItem('bss_save') || '{}');
    const playerHigh = saved.totalScore || 0;
    const playerLevel = saved.highLevel || 1;

    // Lista simulada de jogadores com integração do jogador local
    const mockLeaders = [
      { rank: 1, name: 'SlingMaster99', score: 18450, level: 24, badge: '👑' },
      { rank: 2, name: 'GelatinousGod', score: 14200, level: 19, badge: '🥈' },
      { rank: 3, name: 'BlobNinja', score: 11800, level: 15, badge: '🥉' },
      { rank: 4, name: 'Você (Jogador)', score: Math.max(playerHigh, 2400), level: playerLevel, badge: '⭐' },
      { rank: 5, name: 'CosmicJumper', score: 6500, level: 9, badge: '✨' },
      { rank: 6, name: 'MysticBouncer', score: 4800, level: 7, badge: '✨' }
    ];

    // Ordenar por score
    mockLeaders.sort((a, b) => b.score - a.score);
    mockLeaders.forEach((item, idx) => { item.rank = idx + 1; });

    // Renderizar tabela de líderes
    const startY = H / 2 - panelH / 2 + 105;
    const rowH = 42;

    mockLeaders.forEach((player, i) => {
      const y = startY + i * rowH;
      const isPlayer = player.name.includes('Você');

      // Linha de fundo
      const rowBg = this.add.rectangle(W / 2, y, panelW - 40, rowH - 6, isPlayer ? 0x1e3a5f : 0x1e293b, 0.8)
        .setStrokeStyle(isPlayer ? 2 : 1, isPlayer ? 0x00f5ff : 0x334155, 0.8);

      // Rank + Badge
      this.add.text(W / 2 - panelW / 2 + 35, y, `#${player.rank} ${player.badge}`, {
        fontFamily: 'Segoe UI, Arial',
        fontSize: '15px',
        color: isPlayer ? '#00f5ff' : '#94a3b8',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      // Nome
      this.add.text(W / 2 - panelW / 2 + 120, y, player.name, {
        fontFamily: 'Segoe UI, Arial',
        fontSize: '15px',
        color: isPlayer ? '#ffffff' : '#e2e8f0',
        fontStyle: isPlayer ? 'bold' : 'normal'
      }).setOrigin(0, 0.5);

      // Nível
      this.add.text(W / 2 + 50, y, `Fase ${player.level}`, {
        fontFamily: 'Segoe UI, Arial',
        fontSize: '13px',
        color: '#64748b'
      }).setOrigin(0, 0.5);

      // Score
      this.add.text(W / 2 + panelW / 2 - 35, y, `${player.score.toLocaleString()} pts`, {
        fontFamily: 'Segoe UI, Arial',
        fontSize: '15px',
        color: '#fbbf24',
        fontStyle: 'bold'
      }).setOrigin(1, 0.5);
    });

    // Recompensa do Evento Diário
    const eventBoxY = H / 2 + panelH / 2 - 80;
    this.add.rectangle(W / 2, eventBoxY, panelW - 40, 48, 0x161e2e, 0.9)
      .setStrokeStyle(1, 0x38bdf8, 0.5);

    this.add.text(W / 2, eventBoxY, '🎁 Missão Diária: Conclua 3 fases com 3 estrelas (+200 Moedas)', {
      fontFamily: 'Segoe UI, Arial',
      fontSize: '12px',
      color: '#38bdf8'
    }).setOrigin(0.5);

    // Botão Voltar / Fechar
    const closeBtn = this.add.text(W / 2, H / 2 + panelH / 2 - 28, '⬅ VOLTAR AO MENU', {
      fontFamily: 'Segoe UI, Arial',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#0284c7',
      padding: { x: 20, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerover', () => closeBtn.setStyle({ backgroundColor: '#0369a1' }));
    closeBtn.on('pointerout', () => closeBtn.setStyle({ backgroundColor: '#0284c7' }));
    closeBtn.on('pointerdown', () => {
      this.scene.stop('LeaderboardScene');
    });
  }
}
