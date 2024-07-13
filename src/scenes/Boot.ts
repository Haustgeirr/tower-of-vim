import { Scene } from "phaser";

export class Boot extends Scene {
  constructor() {
    super("Boot");
  }

  init() {
    const element = document.createElement("style");
    document.head.appendChild(element);
    const sheet = element.sheet;
    const styles =
      '@font-face { font-family: "IBMVGA8"; src: url("assets/fonts/ttf/Web437_IBM_VGA_8x16.woff") format("woff"); }';
    sheet!.insertRule(styles, 0);
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

    this.load.image("background", "assets/bg.png");
  }

  create() {
    this.scene.start("Preloader");
  }
}
