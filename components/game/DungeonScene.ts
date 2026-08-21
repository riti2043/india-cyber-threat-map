import Phaser from 'phaser';

const TILE_SIZE = 40;
const GRID_WIDTH = 20;
const GRID_HEIGHT = 15;

export class DungeonScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;

  private interactable!: Phaser.GameObjects.Rectangle;
  private exitDoor!: Phaser.GameObjects.Rectangle;

  private levelConfig: any;
  private onInteract!: () => void;
  private onExit!: () => void;
  private doorUnlocked: boolean = false;

  private isInteracting: boolean = false;
  private walls!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super('DungeonScene');
  }

  preload() {
    // Generate basic textures programmatically
    const graphics = this.make.graphics({ x: 0, y: 0 });

    // Player texture (blue square)
    graphics.fillStyle(0x3b82f6);
    graphics.fillRect(0, 0, TILE_SIZE - 4, TILE_SIZE - 4);
    graphics.generateTexture('player', TILE_SIZE - 4, TILE_SIZE - 4);
    graphics.clear();

    // Wall texture (gray)
    graphics.fillStyle(0x475569);
    graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    graphics.generateTexture('wall', TILE_SIZE, TILE_SIZE);
    graphics.clear();

    // Floor texture (darker gray)
    graphics.fillStyle(0x1e293b);
    graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    graphics.lineStyle(1, 0x0f172a, 0.5);
    graphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
    graphics.generateTexture('floor', TILE_SIZE, TILE_SIZE);
    graphics.clear();

    // Interactable texture (yellow)
    graphics.fillStyle(0xeab308);
    graphics.fillRect(0, 0, TILE_SIZE - 8, TILE_SIZE - 8);
    graphics.generateTexture('interactable', TILE_SIZE - 8, TILE_SIZE - 8);
    graphics.clear();

    // Exit Locked texture (red)
    graphics.fillStyle(0xef4444);
    graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    graphics.generateTexture('exit_locked', TILE_SIZE, TILE_SIZE);
    graphics.clear();

    // Exit Unlocked texture (green)
    graphics.fillStyle(0x22c55e);
    graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    graphics.generateTexture('exit_unlocked', TILE_SIZE, TILE_SIZE);
    graphics.clear();
  }

  create() {
    if (this.input.keyboard) {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
    }

    // Floor
    for (let x = 0; x < GRID_WIDTH; x++) {
      for (let y = 0; y < GRID_HEIGHT; y++) {
        this.add.image(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 'floor');
      }
    }

    this.walls = this.physics.add.staticGroup();
    // Build walls around the edges
    for (let x = 0; x < GRID_WIDTH; x++) {
      this.walls.create(x * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 2, 'wall');
      this.walls.create(x * TILE_SIZE + TILE_SIZE / 2, (GRID_HEIGHT - 1) * TILE_SIZE + TILE_SIZE / 2, 'wall');
    }
    for (let y = 1; y < GRID_HEIGHT - 1; y++) {
      this.walls.create(TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 'wall');
      this.walls.create((GRID_WIDTH - 1) * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 'wall');
    }

    // Create objects (but hide/disable them until level is set)
    this.interactable = this.physics.add.sprite(-100, -100, 'interactable') as any;

    this.exitDoor = this.physics.add.sprite(-100, -100, 'exit_locked') as any;

    this.player = this.physics.add.sprite(-100, -100, 'player') as any;

    this.physics.add.collider(this.player, this.walls);

    // We'll set up overlaps when we get the config
  }

  setLevel(levelConfig: any, onInteract: () => void, onExit: () => void, doorUnlocked: boolean) {
    this.levelConfig = levelConfig;
    this.onInteract = onInteract;
    this.onExit = onExit;
    this.doorUnlocked = doorUnlocked;
    this.isInteracting = false;

    // Reset physics callbacks
    this.physics.world.removeAllListeners();

    if (this.player && this.player.body) {
      this.player.setPosition(
        levelConfig.startPos.x * TILE_SIZE + TILE_SIZE / 2,
        levelConfig.startPos.y * TILE_SIZE + TILE_SIZE / 2
      );
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    }

    if (this.interactable) {
      this.interactable.setPosition(
        levelConfig.interactablePos.x * TILE_SIZE + TILE_SIZE / 2,
        levelConfig.interactablePos.y * TILE_SIZE + TILE_SIZE / 2
      );
    }

    if (this.exitDoor) {
      this.exitDoor.setPosition(
        levelConfig.exitPos.x * TILE_SIZE + TILE_SIZE / 2,
        levelConfig.exitPos.y * TILE_SIZE + TILE_SIZE / 2
      );
      (this.exitDoor as any).setTexture(doorUnlocked ? 'exit_unlocked' : 'exit_locked');
    }
  }

  update() {
    if (!this.player || !this.player.body) return;

    if (this.doorUnlocked && (this.exitDoor as any).texture.key !== 'exit_unlocked') {
        (this.exitDoor as any).setTexture('exit_unlocked');
    }

    // Overlap checks
    const playerBounds = this.player.getBounds();
    const interactableBounds = this.interactable.getBounds();
    const exitBounds = this.exitDoor.getBounds();

    if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, interactableBounds)) {
       if (!this.isInteracting) {
         this.isInteracting = true;
         if (this.onInteract) this.onInteract();
       }
    } else {
        this.isInteracting = false;
    }

    if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, exitBounds)) {
       if (this.doorUnlocked) {
         // Prevent multiple triggers
         this.doorUnlocked = false;
         if (this.onExit) this.onExit();
       }
    }


    const speed = 200;
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    body.setVelocity(0);

    // Stop movement if scene is paused or something
    if (!this.cursors) return;

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      body.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      body.setVelocityY(speed);
    }
  }
}
