import { createContext } from "react";
import  type { AppContextType } from "./types";

const AppContext = createContext<AppContextType | null>(null)

export default AppContext