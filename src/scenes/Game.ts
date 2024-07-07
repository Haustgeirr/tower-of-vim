import { Scene } from "phaser";

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
  private gridWidth: number;
  private gridHeight: number;
  private cellSize: number;
  private cellWidth: number;
  private fontSize: string;
  private grid: Phaser.GameObjects.Text[];
  private selectedCell: { x: number; y: number };
  private keys: KeyMap;
  private pressedKey: Phaser.Input.Keyboard.Key | null;

  constructor() {
    super("Game");

    // get the game window size
    this.cellSize = 48;
    this.cellWidth = 26;
    this.fontSize = `${this.cellSize - 6}px`;
    this.grid = [];
    this.selectedCell = { x: 0, y: 0 };
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x000000);

    // Initialize the grid with random characters
    this.gridWidth = Math.floor(+this.game.config.width / this.cellWidth);
    this.gridHeight = Math.floor(+this.game.config.height / this.cellSize);

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const char = String.fromCharCode(33 + Math.floor(Math.random() * 94)); // ASCII 33-126
        // box characters
        // const char = String.fromCharCode(
        //   0x2500 + Math.floor(Math.random() * 96),
        // );
        // const char = String.fromCharCode(0x2588); // █
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
      }
    }

    this.keys = this.input.keyboard!.addKeys({
      h: Phaser.Input.Keyboard.KeyCodes.H,
      j: Phaser.Input.Keyboard.KeyCodes.J,
      k: Phaser.Input.Keyboard.KeyCodes.K,
      l: Phaser.Input.Keyboard.KeyCodes.L,
    }) as KeyMap;
  }

  update() {
    const prevText =
      this.grid[this.selectedCell.y * this.gridWidth + this.selectedCell.x];

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
      this.grid[this.selectedCell.y * this.gridWidth + this.selectedCell.x];
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
    switch (key.keyCode) {
      case this.keys.h.keyCode:
        this.selectedCell.x = Math.max(0, this.selectedCell.x - 1);
        break;
      case this.keys.j.keyCode:
        this.selectedCell.y = Math.min(
          this.gridHeight - 1,
          this.selectedCell.y + 1,
        );
        break;
      case this.keys.k.keyCode:
        this.selectedCell.y = Math.max(0, this.selectedCell.y - 1);
        break;
      case this.keys.l.keyCode:
        this.selectedCell.x = Math.min(
          this.gridWidth - 1,
          this.selectedCell.x + 1,
        );
        break;
    }
  }
}
