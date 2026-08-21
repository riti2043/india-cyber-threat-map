import Phaser from 'phaser';

const TILE_SIZE = 40;
const GRID_WIDTH = 20; // 800px
const GRID_HEIGHT = 15; // 600px

export type LocationId = 'bank' | 'postoffice' | 'shop' | 'hospital' | 'gov' | 'bus';

interface LocationDef {
  id: LocationId;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: number;
  type: 'building' | 'open';
}

export const LOCATIONS: LocationDef[] = [
  // 4 left side
  { id: 'bank', name: 'Bank', x: 2, y: 1, w: 4, h: 3, color: 0x64748b, type: 'building' }, // grey
  { id: 'postoffice', name: 'Post Office', x: 2, y: 5, w: 4, h: 3, color: 0xef4444, type: 'building' }, // red
  { id: 'hospital', name: 'Hospital', x: 2, y: 9, w: 4, h: 3, color: 0xbae6fd, type: 'building' }, // light blue

  // Right side
  { id: 'shop', name: 'Kirana Shop', x: 14, y: 2, w: 4, h: 3, color: 0xeab308, type: 'building' }, // yellow
  { id: 'gov', name: 'Government Office', x: 14, y: 7, w: 4, h: 3, color: 0xd4d4d8, type: 'building' }, // beige/tan

  // Separate open area at bottom right
  { id: 'bus', name: 'Bus Stand', x: 14, y: 12, w: 4, h: 2, color: 0x3b82f6, type: 'open' }, // Open air, blue roof hint
];

export class VillageScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private triggers!: Phaser.Physics.Arcade.StaticGroup;

  private onTrigger!: (locId: LocationId) => void;
  private activeTrigger: LocationId | null = null;
  private taskOpen: boolean = false;

  constructor() {
    super('VillageScene');
  }

  preload() {
    // Grass
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x4ade80);
    graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    // Add some texture to grass
    graphics.fillStyle(0x22c55e);
    graphics.fillRect(5, 5, 4, 4);
    graphics.fillRect(25, 20, 4, 4);
    graphics.generateTexture('grass', TILE_SIZE, TILE_SIZE);
    graphics.clear();

    // Road (Center)
    graphics.fillStyle(0x94a3b8);
    graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    graphics.generateTexture('road', TILE_SIZE, TILE_SIZE);
    graphics.clear();

    // Player
    graphics.fillStyle(0x1e3a8a); // dark blue character
    graphics.fillRect(0, 0, TILE_SIZE - 10, TILE_SIZE - 10);
    graphics.generateTexture('player', TILE_SIZE - 10, TILE_SIZE - 10);
    graphics.clear();

    // Trigger zone (invisible, but we might draw a mat)
    graphics.fillStyle(0xfde047, 0.5);
    graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    graphics.generateTexture('trigger', TILE_SIZE, TILE_SIZE);
    graphics.clear();
  }

  create() {
    if (this.input.keyboard) {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
    }

    this.walls = this.physics.add.staticGroup();
    this.triggers = this.physics.add.staticGroup();

    // Draw Ground
    for (let x = 0; x < GRID_WIDTH; x++) {
      for (let y = 0; y < GRID_HEIGHT; y++) {
        // Road in the middle (x = 8, 9, 10, 11)
        if (x >= 8 && x <= 11) {
            this.add.image(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 'road');
        } else {
            this.add.image(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 'grass');
        }
      }
    }

    // Build Locations
    LOCATIONS.forEach(loc => {
        const cx = loc.x * TILE_SIZE + (loc.w * TILE_SIZE) / 2;
        const cy = loc.y * TILE_SIZE + (loc.h * TILE_SIZE) / 2;

        // Base structure
        const bldg = this.add.rectangle(cx, cy, loc.w * TILE_SIZE, loc.h * TILE_SIZE, loc.color);
        bldg.setStrokeStyle(2, 0x000000);

        // Add Label
        const txt = this.add.text(cx, cy - 10, loc.name, { color: '#000', fontSize: '14px', fontStyle: 'bold' }).setOrigin(0.5);

        // Entrance / Trigger logic
        if (loc.type === 'building') {
            // Walls around the building so player can't walk through it
            const wall = this.walls.create(cx, cy, undefined) as Phaser.Physics.Arcade.Sprite;
            wall.setSize(loc.w * TILE_SIZE, loc.h * TILE_SIZE);
            wall.setVisible(false);

            // Door / Trigger Mat (always on the side facing the road)
            let tx, ty;
            if (loc.x < 8) {
                // Left side building, door on right
                tx = (loc.x + loc.w) * TILE_SIZE + TILE_SIZE/2;
                ty = cy;
            } else {
                // Right side building, door on left
                tx = (loc.x - 1) * TILE_SIZE + TILE_SIZE/2;
                ty = cy;
            }

            // Draw a little door mat
            this.add.rectangle(tx, ty, TILE_SIZE, TILE_SIZE, 0xfde047).setAlpha(0.5);

            const trigger = this.triggers.create(tx, ty, undefined) as Phaser.Physics.Arcade.Sprite;
            trigger.setSize(TILE_SIZE, TILE_SIZE);
            trigger.setVisible(false);
            trigger.setData('locId', loc.id);

        } else if (loc.type === 'open') {
            // Bus stand - open air. Add a little bench
            this.add.rectangle(cx, cy + 10, loc.w * TILE_SIZE - 20, 10, 0x8b5cf6);
            // It doesn't have walls blocking you, the whole thing is a trigger
            const trigger = this.triggers.create(cx, cy, undefined) as Phaser.Physics.Arcade.Sprite;
            trigger.setSize(loc.w * TILE_SIZE, loc.h * TILE_SIZE);
            trigger.setVisible(false);
            trigger.setData('locId', loc.id);
        }
    });

    // Player starts on the road at the bottom
    this.player = this.physics.add.sprite(10 * TILE_SIZE + TILE_SIZE/2, 14 * TILE_SIZE + TILE_SIZE/2, 'player') as any;

    this.physics.add.collider(this.player, this.walls);

    // We will check overlaps manually in update so we can fire event once
  }

  setCallbacks(onTrigger: (locId: LocationId) => void) {
    this.onTrigger = onTrigger;
  }

  setTaskOpen(isOpen: boolean) {
    this.taskOpen = isOpen;
    // Do not reset activeTrigger here, let the update loop reset it
    // when the player physically walks out of the trigger zone.
  }

  update() {
    if (!this.player || !this.player.body || this.taskOpen) {
        if (this.player && this.player.body) {
            (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0);
        }
        return;
    }

    const speed = 200;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    if (this.cursors) {
        if (this.cursors.left.isDown || this.wasd.A.isDown) body.setVelocityX(-speed);
        else if (this.cursors.right.isDown || this.wasd.D.isDown) body.setVelocityX(speed);

        if (this.cursors.up.isDown || this.wasd.W.isDown) body.setVelocityY(-speed);
        else if (this.cursors.down.isDown || this.wasd.S.isDown) body.setVelocityY(speed);
    }

    // World bounds
    this.player.x = Phaser.Math.Clamp(this.player.x, TILE_SIZE/2, 800 - TILE_SIZE/2);
    this.player.y = Phaser.Math.Clamp(this.player.y, TILE_SIZE/2, 600 - TILE_SIZE/2);

    // Overlap checks
    let overlappingAny = false;
    this.triggers.getChildren().forEach((child) => {
        const trigger = child as Phaser.Physics.Arcade.Sprite;
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), trigger.getBounds())) {
            overlappingAny = true;
            const locId = trigger.getData('locId');

            // Only trigger if we aren't already actively triggering this one
            if (this.activeTrigger !== locId) {
                this.activeTrigger = locId;
                if (this.onTrigger) this.onTrigger(locId);
            }
        }
    });

    if (!overlappingAny) {
        this.activeTrigger = null;
    }
  }
}
