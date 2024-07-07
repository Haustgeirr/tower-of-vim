import { Scene } from "phaser";
import { LevelData } from "../LevelData";

interface KeyMap {
  h: Phaser.Input.Keyboard.Key;
  j: Phaser.Input.Keyboard.Key;
  k: Phaser.Input.Keyboard.Key;
  l: Phaser.Input.Keyboard.Key;
}

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;
  gridWidth: number;
  gridHeight: number;
  cellSize: number;
  cellWidth: number;
  fontSize: string;
  grid: Phaser.GameObjects.Text[];
  selectedCell: { x: number; y: number };
  keys: KeyMap;
  pressedKey: Phaser.Input.Keyboard.Key | null;
  levelData: LevelData;

  constructor() {
    super("Game");

    // get the game window size
    this.cellSize = 48;
    this.cellWidth = 26;
    this.fontSize = `${this.cellSize - 6}px`;
    this.grid = [];
    this.selectedCell = { x: 0, y: 0 };
  }

  preload() {
    this.load.text("map", "src/maps/field.txt");
  }
  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x000000);

    // Initialize the grid with random characters
    this.gridWidth = Math.floor(+this.game.config.width / this.cellWidth);
    this.gridHeight = Math.floor(+this.game.config.height / this.cellSize);

    // Load the map
    this.levelData = new LevelData(this.cache.text.get("map") as string);
    this.levelData.getRows().forEach((row, y) => {
      row.split("").forEach((char, x) => {
        const text = this.add.text(
          x * this.cellWidth,
          y * this.cellSize,
          char,
          {
            fontFamily: "Input Mono",
            fontSize: this.fontSize,
            color: "rgb(255,255,255)",
            fixedWidth: this.cellWidth,
          },
        );
        this.grid.push(text);
      });
    });

    this.keys = this.input.keyboard!.addKeys({
      h: Phaser.Input.Keyboard.KeyCodes.H,
      j: Phaser.Input.Keyboard.KeyCodes.J,
      k: Phaser.Input.Keyboard.KeyCodes.K,
      l: Phaser.Input.Keyboard.KeyCodes.L,
    }) as KeyMap;
  }

  update() {
    const mapWidth = this.levelData.width;
    const prevText =
      this.grid[this.selectedCell.y * mapWidth + this.selectedCell.x];

    // Check for key presses
    if (this.keys.h.isDown) {
      this.pressKey(this.keys.h);
    } else if (this.keys.j.isDown) {
      this.pressKey(this.keys.j);
    } else if (this.keys.k.isDown) {
      this.pressKey(this.keys.k);
    } else if (this.keys.l.isDown) {
      this.pressKey(this.keys.l);
    } else {
      this.pressedKey = null;
    }

    const text =
      this.grid[this.selectedCell.y * mapWidth + this.selectedCell.x];
    prevText.setBackgroundColor("rgb(0,0,0)");
    prevText.setColor("rgb(255,255,255)");

    text.setBackgroundColor("rgb(255,255,255)");
    text.setColor("rgb(0,0,0)");
  }

  pressKey(key: Phaser.Input.Keyboard.Key) {
    if (this.pressedKey === key) {
      return;
    }
    this.pressedKey = key;
    this.movePlayer(key);
  }

  movePlayer(key: Phaser.Input.Keyboard.Key) {
    const mapWidth = this.levelData.width;
    const mapHeight = this.levelData.height;

    switch (key.keyCode) {
      case this.keys.h.keyCode:
        this.selectedCell.x = Math.max(0, this.selectedCell.x - 1);
        break;
      case this.keys.j.keyCode:
        this.selectedCell.y = Math.min(mapHeight - 1, this.selectedCell.y + 1);
        break;
      case this.keys.k.keyCode:
        this.selectedCell.y = Math.max(0, this.selectedCell.y - 1);
        break;
      case this.keys.l.keyCode:
        this.selectedCell.x = Math.min(mapWidth - 1, this.selectedCell.x + 1);
        break;
    }
  }
}
