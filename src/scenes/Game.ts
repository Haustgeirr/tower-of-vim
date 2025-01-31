import { Scene } from "phaser";
import { LevelData } from "../LevelData";
import { TileChar, TileData } from "../TileData";

enum vimMode {
  NORMAL,
  INSERT,
  VISUAL,
  VISUAL_LINE,
  VISUAL_BLOCK,
}

interface KeyMap {
  [key: string]: Phaser.Input.Keyboard.Key;
}

interface Range {
  start: { x: number; y: number };
  end: { x: number; y: number };
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
  selectedRange: Range;
  prevSelectedRange: Range;
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
    this.selectedRange = { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };
    this.prevSelectedRange = { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };
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
      v: Phaser.Input.Keyboard.KeyCodes.V,
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
      ctrl: Phaser.Input.Keyboard.KeyCodes.CTRL,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    }) as KeyMap;
  }

  handleNormalMode(keysDown: string[]) {
    switch (keysDown[0]) {
      case "i":
        this.mode = vimMode.INSERT;
        break;
      case "v":
        if (this.keys.ctrl.isDown) {
          this.mode = vimMode.VISUAL_BLOCK;
        } else if (this.keys.shift.isDown) {
          this.mode = vimMode.VISUAL_LINE;
        } else {
          this.mode = vimMode.VISUAL;
          this.selectedRange = {
            start: { x: this.selectedCell.x, y: this.selectedCell.y },
            end: { x: this.selectedCell.x, y: this.selectedCell.y },
          };
        }
        break;
      case "h":
        this.pressKey(this.keys.h);
        break;
      case "j":
        this.pressKey(this.keys.j);
        break;
      case "k":
        this.pressKey(this.keys.k);
        break;
      case "l":
        this.pressKey(this.keys.l);
        break;
      default:
        this.pressedKey = null;
    }
  }

  handleInsertMode(keysDown: string[]) {
    switch (keysDown[0]) {
      case "esc":
        this.mode = vimMode.NORMAL;
        break;
      default:
        this.pressedKey = null;
    }
  }

  handleVisualMode(keysDown: string[]) {
    switch (keysDown[0]) {
      case "esc":
        this.mode = vimMode.NORMAL;
        break;
      case "h":
        this.pressKey(this.keys.h);
        this.selectedRange.end = {
          x: this.selectedCell.x,
          y: this.selectedCell.y,
        };
        break;
      case "j":
        this.pressKey(this.keys.j);
        this.selectedRange.end = {
          x: this.selectedCell.x,
          y: this.selectedCell.y,
        };
        break;
      case "k":
        this.pressKey(this.keys.k);
        this.selectedRange.end = {
          x: this.selectedCell.x,
          y: this.selectedCell.y,
        };
        break;
      case "l":
        this.pressKey(this.keys.l);
        this.selectedRange.end = {
          x: this.selectedCell.x,
          y: this.selectedCell.y,
        };
        break;
      default:
        this.pressedKey = null;
    }
  }

  handleVisualLineMode(keysDown: string[]) {
    switch (keysDown[0]) {
      case "esc":
        this.mode = vimMode.NORMAL;
        break;
      default:
        this.pressedKey = null;
    }
  }

  handleVisualBlockMode(keysDown: string[]) {
    switch (keysDown[0]) {
      case "esc":
        this.mode = vimMode.NORMAL;
        break;
      default:
        this.pressedKey = null;
    }
  }

  handleInput() {
    const keysDown = Object.keys(this.keys).filter(
      (key) => this.keys[key].isDown,
    );

    if (keysDown.length === 0) {
      this.pressedKey = null;
      return;
    }

    if (this.pressedKey === this.keys[keysDown[0]]) {
      return;
    }

    switch (this.mode) {
      case vimMode.NORMAL:
        this.handleNormalMode(keysDown);
        break;
      case vimMode.INSERT:
        this.handleInsertMode(keysDown);
        break;
      case vimMode.VISUAL:
        this.handleVisualMode(keysDown);
        break;
      case vimMode.VISUAL_LINE:
        this.handleVisualLineMode(keysDown);
        break;
      case vimMode.VISUAL_BLOCK:
        this.handleVisualBlockMode(keysDown);
        break;
    }
  }

  update() {
    const mapWidth = this.levelData.width;
    const prevText =
      this.grid[this.selectedCell.y * mapWidth + this.selectedCell.x];

    prevText.unhighlight();

    this.prevSelectedRange = this.selectedRange;

    const rangeToUnhighlight = this.calculateVisualRange(
      this.prevSelectedRange,
    );

    rangeToUnhighlight.forEach((tile) => {
      tile.unhighlight();
    });

    this.handleInput();

    const text =
      this.grid[this.selectedCell.y * mapWidth + this.selectedCell.x];

    if (this.mode === vimMode.VISUAL_BLOCK) {
      const rangeToHighlight = this.calculateVisualRange(this.selectedRange);

      rangeToHighlight.forEach((tile) => {
        tile.selectHighlight();
      });
    }

    text.highlight();
  }

  calculateVisualRange(selectedRange: {
    start: { x: number; y: number };
    end: { x: number; y: number };
  }) {
    const mapWidth = this.levelData.width;
    const start = selectedRange.start;
    const end = selectedRange.end;

    if (!start || !end) {
      return [];
    }

    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    const range = [];
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        range.push(this.grid[y * mapWidth + x]);
      }
    }
    return range;
  }

  pressKey(key: Phaser.Input.Keyboard.Key) {
    // if (this.pressedKey === key) {
    //   return;
    // }
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
