export enum Direction {
  UP = 1,
  RIGHT = 2,
  DOWN = 3,
  LEFT = 4,
}

export enum KeyboardCode {
  UP = 'ArrowUp',
  DOWN = 'ArrowDown',
  LEFT = 'ArrowLeft',
  RIGHT = 'ArrowRight',
  SPACE = ' ',
}

export interface BoardCell {
  id: number;
  position: Position;
  breakpoint?: Breakpoint;
  hasSnake: boolean;
  hasMeal?: boolean;
}

export interface Cell {
  id: number;
  direction: Direction;
  position: Position;
}

export interface Position {
  x: number;
  y: number;
}

export interface Breakpoint {
  direction: Direction;
  hitCount: number;
  position: Position;
}

export interface AppState {
  cells: Cell[];
  board: BoardCell[];
  game: boolean;
  meal: BoardCell | null;
  score: number;
  breakpoints: Breakpoint[]
}

export enum Actions {
  UPDATECELL,
  UPDATEBOARD,
  UPDATEMEAL,
  UPDATEGAME,
  UPDATESCORE,
  UPDATEBREAKPOINT
}

// const initialState: AppState = {
//   cells: [],
//   board: [],
//   game: false,
//   meal: null,
// };

// const reducer = (state: AppState, action: any): AppState => {
//   switch (action.type) {
//     case Actions.UPDATECELL:
//       return {
//         ...state,
//         cells: [...action.payload],
//       };
//     case Actions.UPDATEBOARD:
//       return {
//         ...state,
//         board: [...action.payload],
//       };
//     case Actions.UPDATEMEAL:
//       return {
//         ...state,
//         meal: action.payload,
//       };
//     case Actions.UPDATEGAME:
//       return {
//         ...state,
//         game: action.payload,
//       };
//   }
// };
