export interface Position {
  x: number;
  z: number;
}

export interface Piece {
  color: 'black' | 'white';
  isKing: boolean;
}

export type GameState = {
  [x: number]: {
    [z: number]: Piece;
  };
};