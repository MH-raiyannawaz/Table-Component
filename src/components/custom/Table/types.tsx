import type { LucideIcon } from "lucide-react";

type MenuSubItem = {
  id?: string
  label?: string,
  checked?: boolean,
  toggleVisibility?: (value?: boolean) => void
}

type Range = {
  min: number | Date, 
  max: number | Date
}

type MenuItem = {
  id: string,
  label: string,
  type: string,
  onClick?: () => void,
  subItems?: MenuSubItem[] | null,
  range?: Range | null,
  filterType?: string,
  onlySM?: boolean
  icon?: LucideIcon
}

export type { MenuItem, MenuSubItem, Range }