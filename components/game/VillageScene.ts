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
  private player!: Phaser.Physics.Arcade.Sprite;
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
    const bp = process.env.NEXT_PUBLIC_BASE_PATH || '';
    this.load.image('grass', bp + '/assets/grass_tile.png');
    this.load.image('road', bp + '/assets/road_tile.png');
    this.load.image('doormat', bp + '/assets/doormat.png');
    this.load.image('tree', bp + '/assets/tree.png');
    this.load.image('bench', bp + '/assets/bench.png');

    // Buildings
    this.load.image('bldg_bank', bp + '/assets/bldg_bank.png');
    this.load.image('bldg_postoffice', bp + '/assets/bldg_postoffice.png');
    this.load.image('bldg_shop', bp + '/assets/bldg_shop.png');
    this.load.image('bldg_hospital', bp + '/assets/bldg_hospital.png');
    this.load.image('bldg_gov', bp + '/assets/bldg_gov.png');
    this.load.image('bldg_bus', bp + '/assets/bldg_bus.png');

    // Player Walk Cycle
    this.load.image('player_0', bp + '/assets/player_walk_0.png');
    this.load.image('player_1', bp + '/assets/player_walk_1.png');
    this.load.image('player_2', bp + '/assets/player_walk_2.png');
    this.load.image('player_3', bp + '/assets/player_walk_3.png');
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
            this.add.image(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 'road').setDisplaySize(TILE_SIZE, TILE_SIZE);
        } else {
            this.add.image(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 'grass').setDisplaySize(TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // Add Ambient Scenery (Trees and Benches)
    const sceneryCoords = [
        { x: 1, y: 14, type: 'tree' },
        { x: 1, y: 0, type: 'tree' },
        { x: 7, y: 3, type: 'tree' },
        { x: 7, y: 11, type: 'tree' },
        { x: 12, y: 1, type: 'tree' },
        { x: 18, y: 5, type: 'tree' },
        { x: 18, y: 10, type: 'tree' },
        { x: 12, y: 14, type: 'bench' },
        { x: 7, y: 14, type: 'bench' },
    ];
    sceneryCoords.forEach(s => {
        const cx = s.x * TILE_SIZE + TILE_SIZE/2;
        const cy = s.y * TILE_SIZE + TILE_SIZE/2;
        if (s.type === 'tree') {
            this.add.image(cx, cy - 20, 'tree').setDepth(10); // draw above player
        } else {
            this.add.image(cx, cy, 'bench');
        }
    });

    // Build Locations
    LOCATIONS.forEach(loc => {
        const cx = loc.x * TILE_SIZE + (loc.w * TILE_SIZE) / 2;
        const cy = loc.y * TILE_SIZE + (loc.h * TILE_SIZE) / 2;

        // Base structure (Sprite instead of rectangle)
        this.add.image(cx, cy, `bldg_${loc.id}`).setDepth(1);

        // Icon label setup based on building type
        const icons: Record<string, string> = {
            'bank': '₹',
            'postoffice': '✉',
            'shop': '🛒',
            'hospital': '✚',
            'gov': '🏛',
            'bus': '🚌'
        };
        const iconChar = icons[loc.id] || '🏠';

        // Add Label & Icon above building
        const labelY = cy - (loc.h * TILE_SIZE) / 2 - 15;
        // White banner background for text readability
        const textBg = this.add.rectangle(cx, labelY, loc.w * TILE_SIZE, 24, 0xffffff, 0.8).setDepth(2);
        textBg.setStrokeStyle(2, 0x000000);
        this.add.text(cx, labelY, `${iconChar} ${loc.name}`, { color: '#000', fontSize: '14px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(2);

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

            // Draw Doormat Sprite
            this.add.image(tx, ty, 'doormat');

            const trigger = this.triggers.create(tx, ty, undefined) as Phaser.Physics.Arcade.Sprite;
            trigger.setSize(TILE_SIZE, TILE_SIZE);
            trigger.setVisible(false);
            trigger.setData('locId', loc.id);

        } else if (loc.type === 'open') {
            // It doesn't have walls blocking you, the whole thing is a trigger
            const trigger = this.triggers.create(cx, cy, undefined) as Phaser.Physics.Arcade.Sprite;
            trigger.setSize(loc.w * TILE_SIZE, loc.h * TILE_SIZE);
            trigger.setVisible(false);
            trigger.setData('locId', loc.id);
        }
    });

    // Player starts on the road at the bottom
    this.player = this.physics.add.sprite(10 * TILE_SIZE + TILE_SIZE/2, 14 * TILE_SIZE + TILE_SIZE/2, 'player_0') as any;
    this.player.setDepth(5);

    // Create walk animation
    this.anims.create({
        key: 'walk',
        frames: [
            { key: 'player_0' },
            { key: 'player_1' },
            { key: 'player_2' },
            { key: 'player_3' }
        ],
        frameRate: 8,
        repeat: -1
    });

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
        let isMoving = false;

        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            body.setVelocityX(-speed);
            isMoving = true;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            body.setVelocityX(speed);
            isMoving = true;
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            body.setVelocityY(-speed);
            isMoving = true;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            body.setVelocityY(speed);
            isMoving = true;
        }

        if (isMoving) {
            if (!this.player.anims.isPlaying) {
                this.player.play('walk');
            }
        } else {
            this.player.stop();
            this.player.setTexture('player_0');
        }
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
