
export type FilterState = {
  search: string;
  category: string;
  tenant: string;
  sortBy: string;
};

export type FilterAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_CATEGORY"; payload: string }
  | { type: "SET_TENANT"; payload: string }
  | { type: "SET_SORT"; payload: string }
  | { type: "RESET" };

export const initialFilterState: FilterState = {
  search: "",
  category: "",
  tenant: "",
  sortBy: "",
};

export function filterReducer(
  state: FilterState,
  action: FilterAction
): FilterState {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload };

    case "SET_CATEGORY":
      return { ...state, category: action.payload };

    case "SET_TENANT":
      return { ...state, tenant: action.payload };

    case "SET_SORT":
      return { ...state, sortBy: action.payload };

    case "RESET":
      return initialFilterState;

    default:
      return state;
  }
}
