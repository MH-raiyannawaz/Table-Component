import type { LucideIcon } from "lucide-react";

type StateSetter<T> = React.Dispatch<React.SetStateAction<T>>;

type TableProp = {
  url: string,
  setUrl: StateSetter<string>
}

type MenuSubItem = {
  id: string
  label: string
  checked: boolean
  toggleVisibility: (value?: boolean) => void
}

type MenuItem = {
  label: string
  onClick?: () => void,
  subItems?: MenuSubItem[]
  onlySM?: boolean
  icon?: LucideIcon
}

export type { StateSetter, TableProp, MenuItem, MenuSubItem }