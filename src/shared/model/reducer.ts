import { type State, initialState } from "./state";

export type Action = { type: "RESET" };

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "RESET":
      return initialState;
    default:
      return state;
  }
};
