import type { MenuItem } from "@/components/custom/DataTable/types";
import type { LucideIcon } from "lucide-react";
import type { HTMLProps } from "react";

export type StateSetter<T> = React.Dispatch<React.SetStateAction<T>>;
/** Row data: values can be primitives or React nodes (e.g. <Button />, <Input />) for component cells */
export type Data = Record<string, unknown>;

export type IndeterminateCheckboxProps = {
  indeterminate?: boolean
  isHeader?: boolean
  onCheck?:(checked: boolean | React.ChangeEvent<HTMLInputElement>) => void
  className?: string
} & Omit<HTMLProps<HTMLInputElement>, "onChange">

export type TableProp = {
  url: string,
  setUrl: StateSetter<string>
}

export type ItemType = 'action' | 'menu' | 'select' | 'filter'

export type Item = {
  id: string,
  type: ItemType,
  label?: string,
  side?: 'left' | 'right',
  icon?: LucideIcon,
  searchable?: boolean,
  menuType?: 'filter' | 'action' | 'priority' | 'reset-filters'
  selectType?: 'header' | 'row'
  /** When true, behavior comes from DataTable built-ins for this `id` (filter-data, priority-data, select-data, view-data, reset-filters-data) */
  builtIn?: boolean,
  onClick?: ()=> void,
  menuItems?: MenuItem[]
}