export type TileChar = "." | ":" | "≈";

export class TileData {
  scene: Phaser.Scene;
  char: TileChar;
  text: Phaser.GameObjects.Text;
  type: any;
  backgroundColour: string;
  foregroundColour: string;
  walkable: boolean;

  constructor(tileChar: TileChar, scene: Phaser.Scene, x: number, y: number) {
    this.char = tileChar;
    this.scene = scene;

    this.setTileData(tileChar);

    this.text = scene.add.text(x, y, this.char, {
      fontFamily: "Input Mono",
      fontSize: "42px",
      color: this.foregroundColour,
      backgroundColor: this.backgroundColour,
    });
  }

  public highlight() {
    this.text.setBackgroundColor("#FFFFFF");
    this.text.setColor("#000000");
  }

  public unhighlight() {
    this.text.setBackgroundColor(this.backgroundColour);
    this.text.setColor(this.foregroundColour);
  }

  public changeTile(tileChar: TileChar) {
    this.setTileData(tileChar);

    this.text.destroy();
    this.text = this.scene.add.text(this.text.x, this.text.y, this.char, {
      fontFamily: "Input Mono",
      fontSize: "42px",
      color: this.foregroundColour,
      backgroundColor: this.backgroundColour,
    });
  }

  getTileData(tileChar: TileChar) {
    const tileData = {
      type: "",
      backgroundColour: "",
      foregroundColour: "",
      walkable: false,
    };

    switch (tileChar) {
      case ".":
      case ":":
        tileData.type = "grass";
        tileData.backgroundColour = "#14300C";
        tileData.foregroundColour = "#285E1B";
        tileData.walkable = true;
        break;
      case "≈":
        tileData.type = "water";
        tileData.backgroundColour = "#0C2A3A";
        tileData.foregroundColour = "#1A4B6B";
        tileData.walkable = false;
        break;
      default:
        throw new Error(`Invalid tile character: ${tileChar}`);
    }

    return tileData;
  }

  setTileData(tileChar: TileChar) {
    const tileData = this.getTileData(tileChar);

    this.char = tileChar;
    this.type = tileData.type;
    this.backgroundColour = tileData.backgroundColour;
    this.foregroundColour = tileData.foregroundColour;
    this.walkable = tileData.walkable;
  }
}
