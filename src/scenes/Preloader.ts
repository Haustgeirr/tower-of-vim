import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    const element = document.createElement("style");
    document.head.appendChild(element);
    const sheet = element.sheet;
    const styles =
      '@font-face { font-family: "IBMVGA8"; src: url("public/assets/font/Web437_IBM_VGA_8x16.woff") format("woff"); }';
    sheet!.insertRule(styles, 0);

    //  We loaded this image in our Boot Scene, so we can display it here
    this.add.image(512, 384, "background");

    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    this.load.script(
      "webfont",
      "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js",
    );

    //  Load the assets for the game
    this.load.setPath("assets");
    this.load.image("logo", "logo.png");
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    const _this = this;

    const loadFonts = (families: string[]): Promise<void> => {
      return new Promise((resolve, reject) => {
        // @ts-ignore: ignore WebFont undefined error
        WebFont.load({
          custom: {
            families: families,
          },
          active: resolve,
          inactive: reject,
        });
      });
    };

    loadFonts(["IBMVGA8"])
      .then(() => {
        _this.scene.start("Game"); // Start the main game scene
      })
      .catch((err) => {
        console.error("Error loading fonts", err);
      });
  }
}
