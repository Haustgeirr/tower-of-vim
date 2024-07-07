export class LevelData {
  public height: number;
  public width: number;

  map: string;
  rows: string[];

  constructor(map: string) {
    if (!this.areMapDimensionsValid(map)) {
      throw new Error("Invalid map dimensions.");
    }

    this.map = map;

    const dimensions = this.getDimensions();

    this.width = dimensions.width;
    this.height = dimensions.height;
  }

  getDimensions(): { width: number; height: number } {
    const rows = this.getRows();
    return { width: rows[0].length, height: rows.length };
  }

  public getRows(): string[] {
    if (!this.rows) {
      this.rows = this.map.split("\n").filter((row) => row.length > 0);
    }

    return this.rows;
  }

  areMapDimensionsValid(map: string): boolean {
    const rows = map.split("\n").filter((row) => row.length > 0);

    const width = rows[0].length;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].length !== width) {
        return false;
      }
    }
    return true;
  }
}
