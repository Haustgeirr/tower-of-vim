import { Scene } from "phaser";
import { LevelData } from "../LevelData";
import { TileChar, TileData } from "../TileData";

enum vimMode {
  NORMAL,
  INSERT,
  VISUAL,
}

interface KeyMap {
  h: Phaser.Input.Keyboard.Key;
  j: Phaser.Input.Keyboard.Key;
  k: Phaser.Input.Keyboard.Key;
  i: Phaser.Input.Keyboard.Key;
  l: Phaser.Input.Keyboard.Key;
  esc: Phaser.Input.Keyboard.Key;
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
  grid: TileData[];
  selectedCell: { x: number; y: number };
  keys: KeyMap;
  pressedKey: Phaser.Input.Keyboard.Key | null;
  levelData: LevelData;
  mode: vimMode;

  constructor() {
    super("Game");

    // get the game window size
    this.cellSize = 48;
    this.cellWidth = 26;
    this.fontSize = `${this.cellSize - 6}px`;
    this.grid = [];
    this.selectedCell = { x: 0, y: 0 };
    this.mode = vimMode.NORMAL;
  }

  init() {
    const element = document.createElement("style");
    document.head.appendChild(element);
    const sheet = element.sheet;
    const styles =
      '@font-face { font-family: "IBMVGA8"; src: url("public/assets/font/Web437_IBM_VGA_8x16.woff") format("woff"); }';
    sheet!.insertRule(styles, 0);
    console.log(sheet);
  }

  preload() {
    this.load.text("map", "src/maps/field.txt");
    this.load.script(
      "webfont",
      "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js",
    );
  }

  create() {
    const _this = this;
    WebFont.load({
      custom: {
        families: ["IBMVGA8", "Caroni"],
      },
      active: function () {
        console.log("fonts loaded");
        console.log(this);
        _this.add
          .text(32, 32, "The face of the\nmoon was in\nshadow.", {
            fontFamily: "IBMVGA8",
            fontSize: 80,
            color: "#ff0000",
          })
          .setShadow(2, 2, "#333333", 2, false, true);

        _this.add.text(
          150,
          350,
          "Waves flung themselves\nat the blue evening.",
          {
            fontFamily: "IBMVGA8",
            fontSize: 64,
            color: "#5656ee",
          },
        );
      },
    });
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x000000);

    // this.add
    //   .text(32, 32, "The face of the\nmoon was in\nshadow.", {
    //     fontFamily: "IBMVGA8",
    //     fontSize: 80,
    //     color: "#ff0000",
    //   })
    //   .setShadow(2, 2, "#333333", 2, false, true);

    // Initialize the grid with random characters
    this.gridWidth = Math.floor(+this.game.config.width / this.cellWidth);
    this.gridHeight = Math.floor(+this.game.config.height / this.cellSize);

    // Load the map
    this.levelData = new LevelData(this.cache.text.get("map") as string);

    const xOffset = Math.floor((this.gridWidth - this.levelData.width) / 2);
    const yOffset = Math.floor((this.gridHeight - this.levelData.height) / 2);

    this.levelData.getRows().forEach((row, y) => {
      row.split("").forEach((char, x) => {
        const text = new TileData(
          char as TileChar,
          this,
          xOffset * this.cellWidth + x * this.cellWidth,
          yOffset * this.cellSize + y * this.cellSize,
        );

        this.grid.push(text);
      });
    });

    this.keys = this.input.keyboard!.addKeys({
      h: Phaser.Input.Keyboard.KeyCodes.H,
      j: Phaser.Input.Keyboard.KeyCodes.J,
      k: Phaser.Input.Keyboard.KeyCodes.K,
      l: Phaser.Input.Keyboard.KeyCodes.L,
      i: Phaser.Input.Keyboard.KeyCodes.I,
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
    }) as KeyMap;
  }

  update() {
    const mapWidth = this.levelData.width;
    const prevText =
      this.grid[this.selectedCell.y * mapWidth + this.selectedCell.x];

    // Check for key presses
    if (this.keys.h.isDown) {
      if (this.mode === vimMode.NORMAL) {
        this.pressKey(this.keys.h);
      }
      if (this.mode === vimMode.INSERT) {
        this.grid[
          this.selectedCell.y * mapWidth + this.selectedCell.x
        ].changeTile(":");
      }
    } else if (this.keys.j.isDown) {
      if (this.mode === vimMode.NORMAL) {
        this.pressKey(this.keys.j);
      }
    } else if (this.keys.k.isDown) {
      if (this.mode === vimMode.NORMAL) {
        this.pressKey(this.keys.k);
      }
    } else if (this.keys.l.isDown) {
      if (this.mode === vimMode.NORMAL) {
        this.pressKey(this.keys.l);
      }
    } else if (this.keys.i.isDown) {
      if (this.mode === vimMode.NORMAL) {
        this.mode = vimMode.INSERT;
      }
    } else if (this.keys.esc.isDown) {
      if (this.mode !== vimMode.NORMAL) {
        this.mode = vimMode.NORMAL;
      }
    } else {
      this.pressedKey = null;
    }

    const text =
      this.grid[this.selectedCell.y * mapWidth + this.selectedCell.x];
    prevText.unhighlight();

    text.highlight();
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

    let nextCell = { x: this.selectedCell.x, y: this.selectedCell.y };

    switch (key.keyCode) {
      case this.keys.h.keyCode:
        nextCell.x = Math.max(0, this.selectedCell.x - 1);
        break;
      case this.keys.j.keyCode:
        nextCell.y = Math.min(mapHeight - 1, this.selectedCell.y + 1);
        break;
      case this.keys.k.keyCode:
        nextCell.y = Math.max(0, this.selectedCell.y - 1);
        break;
      case this.keys.l.keyCode:
        nextCell.x = Math.min(mapWidth - 1, this.selectedCell.x + 1);
        break;
    }

    const nextTile = this.grid[nextCell.y * mapWidth + nextCell.x];

    if (nextTile.walkable) {
      this.selectedCell = nextCell;
    }
  }
}
