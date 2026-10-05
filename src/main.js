// ============================================================
// main.js — Ponto de entrada do BlobSling Shenanigans
// Vite + Phaser 3 + Matter.js
// ============================================================
import Phaser from 'phaser';
import FluidClebScene from './scenes/FluidClebScene.js';
import LoreScene from './scenes/LoreScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import LeaderboardScene from './scenes/LeaderboardScene.js';
import { initCrazyGames } from './sdk/CrazyGamesSDK.js';

const getSize = () => {
  const W = window.innerWidth;
  const H = window.innerHeight;
  // Aspect ratio 16:9 com letterbox
  const targetRatio = 16 / 9;
  const currentRatio = W / H;
  if (currentRatio > targetRatio) {
    return { width: Math.round(H * targetRatio), height: H };
  }
  return { width: W, height: Math.round(W / targetRatio) };
};

const { width, height } = getSize();

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width,
  height,
  backgroundColor: '#020617',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 1.2 },
      debug: false,
      setBounds: true
    }
  },
  fps: {
    target: 60,
    forceSetTimeOut: false
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false
  },
  scene: [
    FluidClebScene,
    LoreScene,
    MenuScene,
    GameScene,
    LeaderboardScene
  ]
};

// Inicializar SDK antes de criar o jogo
initCrazyGames().then(() => {
  const game = new Phaser.Game(config);
  window.__BLOBSLING_GAME__ = game;
});

// Responsividade ao redimensionar
window.addEventListener('resize', () => {
  if (window.__BLOBSLING_GAME__) {
    window.__BLOBSLING_GAME__.scale.refresh();
  }
});
