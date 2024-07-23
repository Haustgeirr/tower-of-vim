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
  selectedRange: {
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
  prevSelectedRange: {
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
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

  update() {
    const mapWidth = this.levelData.width;
    const prevText =
      this.grid[this.selectedCell.y * mapWidth + this.selectedCell.x];

    // const prevSelectedRange = this.selectedRange;
    const newStart = this.prevSelectedRange
      ? this.prevSelectedRange.start
      : this.selectedCell;

    let newSelectedRange = {
      start: newStart,
      end: { x: this.selectedCell.x, y: this.selectedCell.y },
    };

    // Check for key presses
    if (this.keys.h.isDown) {
      if (this.mode === vimMode.NORMAL) {
        this.pressKey(this.keys.h);
      }
      if (
        this.mode === vimMode.VISUAL_BLOCK ||
        this.mode === vimMode.VISUAL_LINE
      ) {
        this.pressKey(this.keys.h);
        this.prevSelectedRange = this.selectedRange;
        newSelectedRange.end = {
          x: this.selectedCell.x,
          y: this.selectedCell.y,
        };
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
      if (
        this.mode === vimMode.VISUAL_BLOCK ||
        this.mode === vimMode.VISUAL_LINE
      ) {
        this.pressKey(this.keys.j);
        this.prevSelectedRange = this.selectedRange;
        newSelectedRange.end = {
          x: this.selectedCell.x,
          y: this.selectedCell.y,
        };
      }
    } else if (this.keys.k.isDown) {
      if (this.mode === vimMode.NORMAL) {
        this.pressKey(this.keys.k);
      }
      if (this.mode === vimMode.VISUAL_BLOCK) {
        this.pressKey(this.keys.k);
        this.prevSelectedRange = this.selectedRange;
        newSelectedRange.end = {
          x: this.selectedCell.x,
          y: this.selectedCell.y,
        };
      } else if (this.mode === vimMode.VISUAL_LINE) {
        this.pressKey(this.keys.k);
        this.prevSelectedRange = this.selectedRange;
        newSelectedRange = {
          start: { x: 0, y: this.prevSelectedRange.start.y },
          end: { x: this.levelData.width - 1, y: this.selectedCell.y },
        };
      }
    } else if (this.keys.l.isDown) {
      if (this.mode === vimMode.NORMAL) {
        this.pressKey(this.keys.l);
      }
      if (
        this.mode === vimMode.VISUAL_BLOCK ||
        this.mode === vimMode.VISUAL_LINE
      ) {
        this.pressKey(this.keys.l);
        this.prevSelectedRange = this.selectedRange;
        newSelectedRange.end = {
          x: this.selectedCell.x,
          y: this.selectedCell.y,
        };
      }
    } else if (this.keys.i.isDown) {
      if (this.mode === vimMode.NORMAL) {
        this.mode = vimMode.INSERT;
      }
    } else if (this.keys.v.isDown) {
      if (this.mode === vimMode.NORMAL) {
        if (this.keys.ctrl.isDown) {
          this.mode = vimMode.VISUAL_BLOCK;

          newSelectedRange = {
            start: { x: this.selectedCell.x, y: this.selectedCell.y },
            end: { x: this.selectedCell.x, y: this.selectedCell.y },
          };
        } else if (this.keys.shift.isDown) {
          this.mode = vimMode.VISUAL_LINE;
          // slect xmin on start range, and xmax on end rangeToUnhighlight
          newSelectedRange = {
            start: { x: 0, y: this.selectedCell.y },
            end: { x: this.levelData.width - 1, y: this.selectedCell.y },
          };
        }
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
