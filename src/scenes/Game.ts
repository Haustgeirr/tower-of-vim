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
  h: Phaser.Input.Keyboard.Key;
  j: Phaser.Input.Keyboard.Key;
  k: Phaser.Input.Keyboard.Key;
  i: Phaser.Input.Keyboard.Key;
  l: Phaser.Input.Keyboard.Key;
  v: Phaser.Input.Keyboard.Key;
  esc: Phaser.Input.Keyboard.Key;
  ctrl: Phaser.Input.Keyboard.Key;
  shift: Phaser.Input.Keyboard.Key;
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

  handleNormalMode() {
    if (this.keys.i.isDown) {
      this.mode = vimMode.INSERT;
    }

    if (this.keys.v.isDown) {
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
    }

    if (this.keys.h.isDown) {
      this.pressKey(this.keys.h);
    }

    if (this.keys.j.isDown) {
      this.pressKey(this.keys.j);
    }

    if (this.keys.k.isDown) {
      this.pressKey(this.keys.k);
    }

    if (this.keys.l.isDown) {
      console.log("l");
      this.pressKey(this.keys.l);
    }
  }

  handleInsertMode() {
    if (this.keys.esc.isDown) {
      this.mode = vimMode.NORMAL;
    }
  }

  handleVisualMode() {
    if (this.keys.esc.isDown) {
      this.mode = vimMode.NORMAL;
    }

    if (this.keys.h.isDown) {
      this.pressKey(this.keys.h);
      this.selectedRange.end = {
        x: this.selectedCell.x,
        y: this.selectedCell.y,
      };
    }
  }

  handleVisualLineMode() {
    if (this.keys.esc.isDown) {
      this.mode = vimMode.NORMAL;
    }
  }

  handleVisualBlockMode() {
    if (this.keys.esc.isDown) {
      this.mode = vimMode.NORMAL;
    }
  }

  handleInput() {
    switch (this.mode) {
      case vimMode.NORMAL:
        this.handleNormalMode();
        break;
      case vimMode.INSERT:
        this.handleInsertMode();
        break;
      case vimMode.VISUAL:
        this.handleVisualMode();
        break;
      case vimMode.VISUAL_LINE:
        this.handleVisualLineMode();
        break;
      case vimMode.VISUAL_BLOCK:
        this.handleVisualBlockMode();
        break;
    }
  }

  update() {
    this.pressedKey = null;

    const mapWidth = this.levelData.width;
    const prevText =
      this.grid[this.selectedCell.y * mapWidth + this.selectedCell.x];
    const text =
      this.grid[this.selectedCell.y * mapWidth + this.selectedCell.x];
    prevText.unhighlight();

    this.handleInput();

    const newSelectedRange = this.selectedRange;

    if (newSelectedRange) {
      const rangeToUnhighlight = this.prevSelectedRange
        ? this.calculateVisualRange(this.prevSelectedRange)
        : [];
      const rangeToHighlight = this.calculateVisualRange(newSelectedRange);

      rangeToUnhighlight.forEach((tile) => {
        tile.unhighlight();
      });

      rangeToHighlight.forEach((tile) => {
        if (
          this.mode === vimMode.VISUAL_BLOCK ||
          this.mode === vimMode.VISUAL_LINE
        ) {
          tile.highlight();
        }
      });
    }

    this.selectedRange = newSelectedRange;

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
