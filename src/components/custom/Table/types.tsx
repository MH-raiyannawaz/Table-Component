import type { LucideIcon } from "lucide-react";

type MenuSubItem = {
  id?: string
  label?: string,
  checked?: boolean,
  onChange?: (value?: boolean) => void
}


type Range = {
  min?: number, 
  max?: number ,
  currMin?: number, 
  currMax?: number,
  from?: Date,
  to?: Date
}

type FilterType = 'date' | 'range' | 'select'
// categorical

type MenuItem = {
  id: string,
  label: string,
  type: string,
  onClick?: () => void,
  onCommit?: () => void,
  onSelect?: () => void,
  subItems?: MenuSubItem[] | null,
  range?: Range | null,
  filterType?: FilterType,
  onlySM?: boolean
  icon?: LucideIcon
}

export type { MenuItem, MenuSubItem, Range, FilterType }