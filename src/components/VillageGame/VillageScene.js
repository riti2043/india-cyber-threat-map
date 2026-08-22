import Phaser from 'phaser';

const TILE_SIZE = 40;
const GRID_WIDTH = 20;
const GRID_HEIGHT = 15;

export const LOCATIONS = [
  { id: 'bank',       name: 'Bank',              x: 2,  y: 1,  w: 4, h: 3, color: 0x475569, type: 'building', icon: '₹' },
  { id: 'postoffice', name: 'Post Office',        x: 2,  y: 5,  w: 4, h: 3, color: 0xdc2626, type: 'building', icon: '✉' },
  { id: 'hospital',   name: 'Hospital',           x: 2,  y: 9,  w: 4, h: 3, color: 0x0ea5e9, type: 'building', icon: '✚' },
  { id: 'shop',       name: 'Kirana Shop',        x: 14, y: 2,  w: 4, h: 3, color: 0xca8a04, type: 'building', icon: '🛒' },
  { id: 'gov',        name: 'Govt Office',        x: 14, y: 7,  w: 4, h: 3, color: 0x7c3aed, type: 'building', icon: '🏛' },
  { id: 'bus',        name: 'Bus Stand',          x: 14, y: 12, w: 4, h: 2, color: 0x2563eb, type: 'open',     icon: '🚌' },
];

export class VillageScene extends Phaser.Scene {
  constructor() {
    super('VillageScene');
    this.player = null;
    this.cursors = null;
    this.wasd = null;
    this.walls = null;
    this.triggers = null;
    this.onTrigger = null;
    this.activeTrigger = null;
    this.taskOpen = false;
    this.promptText = null;
    this.playerGfx = null;
    this.playerDir = 'down';
    this.walkFrame = 0;
    this.walkTimer = 0;
  }

  preload() {}

  _createPlayerTexture() {
    // Draw a cute top-down character as a generated texture
    const dirs = ['down', 'up', 'left', 'right'];
    dirs.forEach((dir, di) => {
      for (let frame = 0; frame < 4; frame++) {
        const key = `player_${dir}_${frame}`;
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        const legOff = frame % 2 === 0 ? 0 : 2;

        // Shadow
        g.fillStyle(0x000000, 0.15);
        g.fillEllipse(16, 30, 20, 6);

        // Body
        g.fillStyle(0x3b82f6); // blue shirt
        g.fillRoundedRect(8, 14, 16, 14, 3);

        // Head
        g.fillStyle(0xfbbf24); // skin
        g.fillCircle(16, 11, 9);

        // Hair
        g.fillStyle(0x1e293b);
        g.fillEllipse(16, 5, 16, 8);

        // Eyes
        g.fillStyle(0xffffff);
        if (dir === 'down') {
          g.fillCircle(12, 11, 2.5); g.fillCircle(20, 11, 2.5);
          g.fillStyle(0x1e293b); g.fillCircle(12, 12, 1.5); g.fillCircle(20, 12, 1.5);
        } else if (dir === 'up') {
          // back of head, no eyes
        } else {
          g.fillCircle(dir === 'left' ? 11 : 21, 11, 2); g.fillStyle(0x1e293b); g.fillCircle(dir === 'left' ? 11 : 21, 12, 1);
        }

        // Legs
        g.fillStyle(0x1e40af);
        if (frame % 2 === 0) {
          g.fillRect(9, 28, 7, 8); g.fillRect(18, 28, 7, 8);
        } else {
          g.fillRect(9, 26, 7, 10); g.fillRect(18, 30, 7, 6);
        }

        // Shoes
        g.fillStyle(0x422006);
        g.fillRect(8, 35, 8, 4); g.fillRect(17, 35, 8, 4);

        g.generateTexture(key, 32, 40);
        g.destroy();
      }
    });
  }

  create() {
    this._createPlayerTexture();

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys('W,S,A,D');
    }

    this.walls = this.physics.add.staticGroup();
    this.triggers = this.physics.add.staticGroup();

    // === GROUND ===
    const groundGfx = this.add.graphics();
    for (let x = 0; x < GRID_WIDTH; x++) {
      for (let y = 0; y < GRID_HEIGHT; y++) {
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        if (x >= 8 && x <= 11) {
          // Road
          groundGfx.fillStyle(0x374151);
          groundGfx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          // Road markings
          if (x === 9 || x === 10) {
            groundGfx.fillStyle(0xfbbf24, 0.3);
            groundGfx.fillRect(px + 18, py + 2, 4, 16);
            groundGfx.fillRect(px + 18, py + 22, 4, 16);
          }
        } else {
          // Grass
          const shade = (x + y) % 2 === 0 ? 0x16a34a : 0x15803d;
          groundGfx.fillStyle(shade);
          groundGfx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // Sidewalk edges alongside road
    groundGfx.fillStyle(0x9ca3af, 0.5);
    for (let y = 0; y < GRID_HEIGHT; y++) {
      groundGfx.fillRect(7 * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      groundGfx.fillRect(12 * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
    groundGfx.setDepth(0);

    // === TREES & SCENERY ===
    const scenery = [
      { x: 1, y: 0, type: 'tree' }, { x: 1, y: 14, type: 'tree' },
      { x: 7, y: 3, type: 'tree' }, { x: 7, y: 11, type: 'tree' },
      { x: 12, y: 1, type: 'tree' }, { x: 18, y: 5, type: 'tree' },
      { x: 18, y: 10, type: 'tree' },
      { x: 12, y: 14, type: 'bench' }, { x: 7, y: 14, type: 'bench' },
      { x: 12, y: 6, type: 'bench' },
    ];
    scenery.forEach(s => {
      const cx = s.x * TILE_SIZE + TILE_SIZE / 2;
      const cy = s.y * TILE_SIZE + TILE_SIZE / 2;
      const sg = this.add.graphics();
      if (s.type === 'tree') {
        // Trunk
        sg.fillStyle(0x78350f); sg.fillRect(cx - 4, cy + 4, 8, 14);
        // Canopy
        sg.fillStyle(0x166534); sg.fillCircle(cx, cy - 8, 18);
        sg.fillStyle(0x15803d); sg.fillCircle(cx - 6, cy - 4, 12);
        sg.fillStyle(0x22c55e, 0.6); sg.fillCircle(cx + 4, cy - 12, 10);
        sg.setDepth(10);
        // Invisible wall for tree
        const tw = this.walls.create(cx, cy, undefined);
        tw.setSize(20, 20); tw.setVisible(false); tw.refreshBody();
      } else {
        // Bench
        sg.fillStyle(0x92400e); sg.fillRect(cx - 14, cy - 4, 28, 6);
        sg.fillStyle(0x78350f); sg.fillRect(cx - 12, cy + 2, 6, 8); sg.fillRect(cx + 6, cy + 2, 6, 8);
        sg.fillStyle(0xa3a3a3, 0.7); sg.fillRect(cx - 14, cy - 8, 28, 4);
        sg.setDepth(2);
      }
    });

    // === BUILDINGS ===
    LOCATIONS.forEach(loc => {
      const bx = loc.x * TILE_SIZE;
      const by = loc.y * TILE_SIZE;
      const bw = loc.w * TILE_SIZE;
      const bh = loc.h * TILE_SIZE;
      const cx = bx + bw / 2;
      const cy = by + bh / 2;

      const bg = this.add.graphics();

      // Building shadow
      bg.fillStyle(0x000000, 0.2);
      bg.fillRect(bx + 4, by + 4, bw, bh);

      // Main building body
      bg.fillStyle(loc.color);
      bg.fillRect(bx, by, bw, bh);

      // Roof accent
      bg.fillStyle(Phaser.Display.Color.IntegerToColor(loc.color).lighten(20).color);
      bg.fillRect(bx, by, bw, 8);

      // Windows
      bg.fillStyle(0xbae6fd, 0.85);
      for (let wx = bx + 8; wx < bx + bw - 10; wx += 18) {
        for (let wy = by + 14; wy < by + bh - 10; wy += 18) {
          bg.fillRect(wx, wy, 10, 10);
        }
      }

      // Border
      bg.lineStyle(2, 0x000000, 0.4);
      bg.strokeRect(bx, by, bw, bh);
      bg.setDepth(1);

      // Label banner
      const labelBg = this.add.graphics();
      labelBg.fillStyle(0x000000, 0.7);
      labelBg.fillRoundedRect(cx - bw / 2, by - 22, bw, 20, 4);
      labelBg.setDepth(3);

      this.add.text(cx, by - 12, `${loc.icon} ${loc.name}`, {
        fontSize: '11px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(4);

      // Wall collision
      if (loc.type === 'building') {
        const wall = this.walls.create(cx, cy, undefined);
        wall.setSize(bw, bh); wall.setVisible(false); wall.refreshBody();

        // Doormat
        let tx, ty;
        if (loc.x < 8) { tx = (loc.x + loc.w) * TILE_SIZE + TILE_SIZE / 2; ty = cy; }
        else { tx = (loc.x - 1) * TILE_SIZE + TILE_SIZE / 2; ty = cy; }

        const dg = this.add.graphics();
        dg.fillStyle(0xa16207, 0.9);
        dg.fillRect(tx - 14, ty - 8, 28, 16);
        dg.lineStyle(1, 0xfbbf24, 0.8);
        dg.strokeRect(tx - 14, ty - 8, 28, 16);
        dg.setDepth(2);

        this.add.text(tx, ty, '▶ ENTER', {
          fontSize: '7px', fontFamily: 'Arial', color: '#fbbf24'
        }).setOrigin(0.5).setDepth(3);

        const trigger = this.triggers.create(tx, ty, undefined);
        trigger.setSize(TILE_SIZE * 1.2, TILE_SIZE * 1.2); trigger.setVisible(false);
        trigger.setData('locId', loc.id); trigger.refreshBody();

      } else {
        // Open area trigger (bus stand)
        const trigger = this.triggers.create(cx, cy, undefined);
        trigger.setSize(bw, bh); trigger.setVisible(false);
        trigger.setData('locId', loc.id); trigger.refreshBody();
      }
    });

    // === PLAYER ===
    this.player = this.physics.add.sprite(
      10 * TILE_SIZE + TILE_SIZE / 2,
      13 * TILE_SIZE + TILE_SIZE / 2,
      'player_down_0'
    );
    this.player.setDepth(5);
    this.player.setCollideWorldBounds(true);
    this.physics.world.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);

    // Walk animations for all 4 directions
    ['down', 'up', 'left', 'right'].forEach(dir => {
      this.anims.create({
        key: `walk_${dir}`,
        frames: [0, 1, 2, 3].map(f => ({ key: `player_${dir}_${f}` })),
        frameRate: 8,
        repeat: -1
      });
    });

    this.physics.add.collider(this.player, this.walls);

    // === PROMPT TEXT ===
    this.promptText = this.add.text(
      GRID_WIDTH * TILE_SIZE / 2, GRID_HEIGHT * TILE_SIZE - 14,
      '', { fontSize: '13px', fontFamily: 'Arial', color: '#fbbf24',
        backgroundColor: '#000000cc', padding: { x: 10, y: 4 }
      }
    ).setOrigin(0.5).setDepth(20);
  }

  setCallbacks(onTrigger) {
    this.onTrigger = onTrigger;
  }

  setTaskOpen(isOpen) {
    this.taskOpen = isOpen;
  }

  update() {
    if (!this.player || !this.player.body) return;

    if (this.taskOpen) {
      this.player.body.setVelocity(0);
      this.player.anims.stop();
      return;
    }

    const speed = 180;
    const body = this.player.body;
    body.setVelocity(0);
    let moving = false;
    let newDir = this.playerDir;

    const left  = this.cursors?.left?.isDown  || this.wasd?.A?.isDown;
    const right = this.cursors?.right?.isDown || this.wasd?.D?.isDown;
    const up    = this.cursors?.up?.isDown    || this.wasd?.W?.isDown;
    const down  = this.cursors?.down?.isDown  || this.wasd?.S?.isDown;

    if (left)  { body.setVelocityX(-speed); newDir = 'left';  moving = true; }
    if (right) { body.setVelocityX(speed);  newDir = 'right'; moving = true; }
    if (up)    { body.setVelocityY(-speed); newDir = 'up';    moving = true; }
    if (down)  { body.setVelocityY(speed);  newDir = 'down';  moving = true; }

    // Normalize diagonal
    if ((left || right) && (up || down)) {
      body.velocity.normalize().scale(speed);
    }

    if (moving) {
      if (this.playerDir !== newDir || !this.player.anims.isPlaying) {
        this.playerDir = newDir;
        this.player.play(`walk_${newDir}`, true);
      }
    } else {
      this.player.anims.stop();
      this.player.setTexture(`player_${this.playerDir}_0`);
    }

    // Proximity prompt
    let nearAny = false;
    let nearName = '';
    this.triggers.getChildren().forEach(child => {
      const bounds = child.getBounds();
      // Expand bounds slightly for proximity hint
      const expanded = new Phaser.Geom.Rectangle(bounds.x - 20, bounds.y - 20, bounds.width + 40, bounds.height + 40);
      if (Phaser.Geom.Rectangle.Contains(expanded, this.player.x, this.player.y)) {
        nearAny = true;
        nearName = child.getData('locId');
      }
    });

    // Overlap trigger
    let overlappingAny = false;
    this.triggers.getChildren().forEach(child => {
      if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), child.getBounds())) {
        overlappingAny = true;
        const locId = child.getData('locId');
        if (this.activeTrigger !== locId) {
          this.activeTrigger = locId;
          if (this.onTrigger) this.onTrigger(locId);
        }
      }
    });

    if (!overlappingAny) {
      this.activeTrigger = null;
      if (nearAny && this.promptText) {
        this.promptText.setText(`Walk to the ${nearName} entrance to interact`);
      } else if (this.promptText) {
        this.promptText.setText('Use WASD or Arrow Keys to move');
      }
    } else {
      if (this.promptText) this.promptText.setText('');
    }
  }
}
