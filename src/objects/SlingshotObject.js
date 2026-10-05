// ============================================================
// SlingshotObject — Estilingue místico visual + mecânica drag
// ============================================================
import Phaser from 'phaser';

export default class SlingshotObject {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.dragX = 0;
    this.dragY = 0;

    this.gfx = scene.add.graphics();
    this.bandLeft = scene.add.graphics();
    this.bandRight = scene.add.graphics();
    this.blobPreview = scene.add.graphics();

    this._draw();
  }

  setDrag(dx, dy) {
    this.dragX = dx;
    this.dragY = dy;
    this._drawBands();
    this._drawBlobPreview();
  }

  _draw() {
    const g = this.gfx;
    const x = this.x;
    const y = this.y;

    g.clear();

    // Cabo do estilingue (Y invertido)
    g.fillStyle(0x92400e, 1);
    g.fillRect(x - 5, y, 10, 55);

    // Fork esquerda
    g.fillStyle(0x78350f, 1);
    g.fillRect(x - 20, y - 10, 12, 36);
    g.fillStyle(0xa16207, 1);
    g.fillRect(x - 20, y - 20, 12, 12);

    // Fork direita
    g.fillStyle(0x78350f, 1);
    g.fillRect(x + 8, y - 10, 12, 36);
    g.fillStyle(0xa16207, 1);
    g.fillRect(x + 8, y - 20, 12, 12);

    // Decoração mística
    g.fillStyle(0x6d28d9, 0.8);
    g.fillCircle(x - 14, y - 20, 5);
    g.fillCircle(x + 14, y - 20, 5);

    // Runa no cabo
    g.lineStyle(1, 0xa855f7, 0.6);
    g.strokeCircle(x, y + 28, 8);
    g.lineBetween(x, y + 20, x, y + 36);
    g.lineBetween(x - 8, y + 28, x + 8, y + 28);
  }

  _drawBands() {
    const x = this.x;
    const y = this.y;
    const bx = x + this.dragX;
    const by = y + this.dragY;

    const power = Math.sqrt(this.dragX ** 2 + this.dragY ** 2) / 80;
    const tension = Math.min(1, power);
    const bandColor = tension > 0.7 ? 0xef4444 : tension > 0.4 ? 0xf59e0b : 0x92400e;

    this.bandLeft.clear();
    this.bandLeft.lineStyle(3, bandColor, 0.9);
    this.bandLeft.beginPath();
    this.bandLeft.moveTo(x - 14, y - 22);
    this.bandLeft.lineTo(bx, by);
    this.bandLeft.strokePath();

    this.bandRight.clear();
    this.bandRight.lineStyle(3, bandColor, 0.9);
    this.bandRight.beginPath();
    this.bandRight.moveTo(x + 14, y - 22);
    this.bandRight.lineTo(bx, by);
    this.bandRight.strokePath();
  }

  _drawBlobPreview() {
    const bx = this.x + this.dragX;
    const by = this.y + this.dragY;
    this.blobPreview.clear();
    this.blobPreview.fillStyle(0x22c55e, 0.5);
    this.blobPreview.fillCircle(bx, by, 14);
    this.blobPreview.lineStyle(2, 0x00f5ff, 0.7);
    this.blobPreview.strokeCircle(bx, by, 18);
  }

  update() {
    // Redraw estático (bands já atualizados via setDrag)
  }

  destroy() {
    this.gfx.destroy();
    this.bandLeft.destroy();
    this.bandRight.destroy();
    this.blobPreview.destroy();
  }
}
