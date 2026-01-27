import type { LucideIcon } from "lucide-react";

type MenuSubItem = {
  id?: string
  label?: string,
  checked?: boolean,
  onChange?: (value?: boolean) => void
}


type Range = {
  min: number | Date, 
  max: number | Date,
  currMin: number, 
  currMax: number,
  onCommit: (value: boolean) => void
}

type FilterType = 'date' | 'range' | 'select'
// categorical

type MenuItem = {
  id: string,
  label: string,
  type: string,
  onClick?: () => void,
  subItems?: MenuSubItem[] | null,
  range?: Range | null,
  filterType?: FilterType,
  onlySM?: boolean
  icon?: LucideIcon
}

export type { MenuItem, MenuSubItem, Range, FilterType }