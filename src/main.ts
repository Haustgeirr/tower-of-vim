import { Boot } from "./scenes/Boot";
import { Game as MainGame } from "./scenes/Game";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";

import { Game, Types } from "phaser";

const graphicsSettings = { best: 1, medium: 0.75, low: 0.5 };
const DPR = window.devicePixelRatio * graphicsSettings.best;
const { width, height } = window.screen;

// Set width and height.
const WIDTH = Math.round(Math.max(width, height) * DPR);
const HEIGHT = Math.round(Math.min(width, height) * DPR);

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  parent: "game-container",
  backgroundColor: "#028af8",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Boot, Preloader, MainMenu, MainGame, GameOver],
  input: {
    keyboard: true,
  },
  // zoom: 4,
  // pixelArt: true,
  // roundPixels: true,
};

export default new Game(config);
