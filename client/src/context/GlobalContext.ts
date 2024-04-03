import { createContext } from "react";
import { ActionType, InitialState } from "./types";
import { defaultInitialState } from "@/constants";

export const GlobalStateContext = createContext<InitialState>(defaultInitialState);

export const GlobalDispatchContext = createContext<React.Dispatch<ActionType> | null>(null);
