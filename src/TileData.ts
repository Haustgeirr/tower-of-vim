export type TileChar = "." | ":";

export class TileData {
  char: TileChar;
  text: Phaser.GameObjects.Text;
  tileType: any;
  tileBackgroundColour: string;
  tileForegroundColour: string;
  walkable: boolean;

  constructor(tileChar: TileChar, scene: Phaser.Scene, x: number, y: number) {
    this.char = tileChar;

    switch (tileChar) {
      case ".":
      case ":":
        this.tileType = "grass";
        this.tileBackgroundColour = "#14300C";
        this.tileForegroundColour = "#285E1B";
        this.walkable = true;
        break;
      default:
        throw new Error(`Invalid tile character: ${tileChar}`);
    }

    this.text = scene.add.text(x, y, this.char, {
      fontFamily: "Input Mono",
      fontSize: "42px",
      color: this.tileForegroundColour,
      backgroundColor: this.tileBackgroundColour,
    });
  }

  public highlight() {
    this.text.setBackgroundColor("#FFFFFF");
    this.text.setColor("#000000");
  }

  public unhighlight() {
    this.text.setBackgroundColor(this.tileBackgroundColour);
    this.text.setColor(this.tileForegroundColour);
  }
}
