import Phaser from 'phaser';

const TILE_SIZE = 40;
const GRID_WIDTH = 60; // 2400px
const GRID_HEIGHT = 60; // 2400px

export type LocationId = 'bank' | 'postoffice' | 'shop' | 'hospital' | 'gov' | 'bus';

interface LocationDef {
  id: LocationId;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  floor: string;
  type: 'building' | 'open';
}

export const LOCATIONS: LocationDef[] = [
  // Expanded map layout
  { id: 'bank', name: 'Bank', x: 10, y: 10, w: 8, h: 6, floor: 'marble', type: 'building' },
  { id: 'postoffice', name: 'Post Office', x: 10, y: 25, w: 8, h: 6, floor: 'wood', type: 'building' },
  { id: 'hospital', name: 'Hospital', x: 10, y: 40, w: 10, h: 8, floor: 'linoleum', type: 'building' },

  { id: 'shop', name: 'Kirana Shop', x: 40, y: 12, w: 6, h: 6, floor: 'wood', type: 'building' },
  { id: 'gov', name: 'Gov Office', x: 40, y: 30, w: 8, h: 6, floor: 'marble', type: 'building' },
  { id: 'bus', name: 'Bus Stand', x: 38, y: 45, w: 12, h: 4, floor: 'paving', type: 'open' },
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
    this.load.image('grass', bp + '/assets/grass_hd.png');
    this.load.image('road', bp + '/assets/paving.png');
    this.load.image('doormat', bp + '/assets/doormat.png');
    this.load.image('tree', bp + '/assets/tree.png');
    this.load.image('bench', bp + '/assets/bench.png');

    // Walls and Floors
    this.load.image('wall_gray', bp + '/assets/wall_gray.png');
    this.load.image('wall_red', bp + '/assets/wall_red.png');
    this.load.image('floor_marble', bp + '/assets/floor_marble.png');
    this.load.image('floor_wood', bp + '/assets/floor_wood.png');
    this.load.image('floor_linoleum', bp + '/assets/floor_linoleum.png');
    this.load.image('floor_paving', bp + '/assets/paving.png'); // reuse paving for bus stand

    this.load.image('prop_vending', bp + '/assets/prop_vending.png');
    this.load.image('prop_sign', bp + '/assets/prop_sign.png');

    // Player Walk Cycle (HD)
    this.load.image('player_0', bp + '/assets/hero_0.png');
    this.load.image('player_1', bp + '/assets/hero_1.png');
    this.load.image('player_2', bp + '/assets/hero_2.png');
    this.load.image('player_3', bp + '/assets/hero_3.png');
  }

  create() {
    if (this.input.keyboard) {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
    }

    this.walls = this.physics.add.staticGroup();
    this.triggers = this.physics.add.staticGroup();

    // Set bounds
    this.physics.world.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);

    // Draw Ground
    for (let x = 0; x < GRID_WIDTH; x++) {
      for (let y = 0; y < GRID_HEIGHT; y++) {
        // Main Road in the middle (x = 24 to 34)
        if (x >= 24 && x <= 34) {
            this.add.image(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 'road').setDisplaySize(TILE_SIZE, TILE_SIZE);
        } else {
            this.add.image(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 'grass').setDisplaySize(TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // Add Ambient Scenery (Trees, Benches, Props)
    const sceneryCoords = [
        { x: 5, y: 5, type: 'tree' }, { x: 8, y: 8, type: 'tree' }, { x: 50, y: 5, type: 'tree' },
        { x: 20, y: 20, type: 'tree' }, { x: 22, y: 40, type: 'tree' }, { x: 45, y: 50, type: 'tree' },
        { x: 15, y: 55, type: 'tree' }, { x: 55, y: 25, type: 'tree' }, { x: 55, y: 35, type: 'tree' },
        { x: 22, y: 12, type: 'bench' }, { x: 36, y: 32, type: 'bench' }, { x: 36, y: 15, type: 'prop_vending' },
    ];
    sceneryCoords.forEach(s => {
        const cx = s.x * TILE_SIZE + TILE_SIZE/2;
        const cy = s.y * TILE_SIZE + TILE_SIZE/2;
        if (s.type === 'tree') {
            this.add.image(cx, cy - 20, 'tree').setDepth(10);
        } else {
            this.add.image(cx, cy, s.type).setDepth(2);
        }
    });

    // Build Locations (Open Interiors with tile walls and floors)
    LOCATIONS.forEach(loc => {
        const cx = loc.x * TILE_SIZE + (loc.w * TILE_SIZE) / 2;
        const cy = loc.y * TILE_SIZE + (loc.h * TILE_SIZE) / 2;

        // Pick wall tile
        const wallTex = (loc.id === 'postoffice' || loc.id === 'hospital') ? 'wall_red' : 'wall_gray';

        if (loc.type === 'building') {
            // Draw Floors
            for (let i = 0; i < loc.w; i++) {
                for (let j = 0; j < loc.h; j++) {
                    const fx = (loc.x + i) * TILE_SIZE + TILE_SIZE / 2;
                    const fy = (loc.y + j) * TILE_SIZE + TILE_SIZE / 2;
                    this.add.image(fx, fy, `floor_${loc.floor}`).setDepth(0);
                }
            }

            // Determine door position (middle of the wall facing the road)
            // If building is on the left (x < 24), door is on the right wall.
            // If building is on the right (x > 34), door is on the left wall.
            const doorY = loc.y + Math.floor(loc.h / 2);
            let doorX = -1;
            if (loc.x < 24) {
                doorX = loc.x + loc.w - 1; // Right wall
            } else {
                doorX = loc.x; // Left wall
            }

            // Draw Walls & Colliders
            for (let i = 0; i < loc.w; i++) {
                for (let j = 0; j < loc.h; j++) {
                    // Only draw perimeter
                    if (i === 0 || i === loc.w - 1 || j === 0 || j === loc.h - 1) {
                        const wx = loc.x + i;
                        const wy = loc.y + j;

                        // Leave doorway open
                        if (wx === doorX && wy === doorY) continue;

                        const wxPx = wx * TILE_SIZE + TILE_SIZE / 2;
                        const wyPx = wy * TILE_SIZE + TILE_SIZE / 2;

                        this.add.image(wxPx, wyPx, wallTex).setDepth(2);

                        const wallCol = this.walls.create(wxPx, wyPx, undefined) as Phaser.Physics.Arcade.Sprite;
                        wallCol.setSize(TILE_SIZE, TILE_SIZE);
                        wallCol.setVisible(false);
                    }
                }
            }

            // Trigger Mat inside the door
            let txPx = doorX * TILE_SIZE + TILE_SIZE / 2;
            let tyPx = doorY * TILE_SIZE + TILE_SIZE / 2;
            this.add.image(txPx, tyPx, 'doormat').setDepth(1);

            const trigger = this.triggers.create(txPx, tyPx, undefined) as Phaser.Physics.Arcade.Sprite;
            trigger.setSize(TILE_SIZE, TILE_SIZE);
            trigger.setVisible(false);
            trigger.setData('locId', loc.id);

        } else if (loc.type === 'open') {
             // Draw Floors
             for (let i = 0; i < loc.w; i++) {
                for (let j = 0; j < loc.h; j++) {
                    const fx = (loc.x + i) * TILE_SIZE + TILE_SIZE / 2;
                    const fy = (loc.y + j) * TILE_SIZE + TILE_SIZE / 2;
                    this.add.image(fx, fy, `floor_${loc.floor}`).setDepth(0);
                }
            }

            const trigger = this.triggers.create(cx, cy, undefined) as Phaser.Physics.Arcade.Sprite;
            trigger.setSize(loc.w * TILE_SIZE, loc.h * TILE_SIZE);
            trigger.setVisible(false);
            trigger.setData('locId', loc.id);
        }

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
        const labelY = (loc.y * TILE_SIZE) - 15;
        // Pixel style banner background for text readability
        const textBg = this.add.rectangle(cx, labelY, loc.w * TILE_SIZE, 24, 0x1a1a24, 0.9).setDepth(4);
        textBg.setStrokeStyle(2, 0xffffff);
        this.add.text(cx, labelY, `${iconChar} ${loc.name}`, {
            color: '#fff',
            fontSize: '16px',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(5);
    });

    // Player starts on the road at the bottom (or near bank for testing)
    this.player = this.physics.add.sprite(28 * TILE_SIZE + TILE_SIZE/2, 55 * TILE_SIZE + TILE_SIZE/2, 'player_0') as any;
    this.player.setDepth(5);

    // Camera setup for massive map
    this.cameras.main.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.5); // Retro RPG feel

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

    // World bounds (now handles massive map)
    this.player.x = Phaser.Math.Clamp(this.player.x, TILE_SIZE/2, GRID_WIDTH * TILE_SIZE - TILE_SIZE/2);
    this.player.y = Phaser.Math.Clamp(this.player.y, TILE_SIZE/2, GRID_HEIGHT * TILE_SIZE - TILE_SIZE/2);

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
