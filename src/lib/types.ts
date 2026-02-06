import type { LucideIcon } from "lucide-react";
import type { HTMLProps } from "react";

export type StateSetter<T> = React.Dispatch<React.SetStateAction<T>>;
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

export type ItemType = 'action' | 'menu' | 'input'

export type Item = {
  id: string,
  type: ItemType,
  label?: string,
  side?: 'left' | 'right',
  icon?: LucideIcon,
  searchable?: boolean,
  menuType?: 'filter' | 'action' | 'priority'
  onClick?: ()=> void
}