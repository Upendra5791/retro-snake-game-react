import { AppState, Actions } from "./app.model";

export const initialState: AppState = {
  cells: [],
  board: [],
  game: false,
  meal: null,
  score: 0,
  breakpoints: [],
};
export const reducer = (state: AppState, action: any): AppState => {
  switch (action.type) {
    case Actions.UPDATECELL:
      return {
        ...state,
        cells: [...action.payload],
      };
    case Actions.UPDATEBOARD:
      return {
        ...state,
        board: [...action.payload],
      };
    case Actions.UPDATEMEAL:
      return {
        ...state,
        meal: action.payload,
      };
    case Actions.UPDATEGAME:
      return {
        ...state,
        game: action.payload,
      };
    case Actions.UPDATESCORE:
      return {
        ...state,
        score: action.payload,
      };
    case Actions.UPDATEBREAKPOINT:
      return {
        ...state,
        breakpoints: [...action.payload],
      };
    default:
      return state;
  }
};
