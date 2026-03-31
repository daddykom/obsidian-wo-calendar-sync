export const Notice = jest.fn();

export class TFile {
  path: string;

  constructor(path: string) {
    this.path = path;
  }
}
