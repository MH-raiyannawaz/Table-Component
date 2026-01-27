import type { HTMLProps } from "react";

export type StateSetter<T> = React.Dispatch<React.SetStateAction<T>>;
export type Data = Record<string, unknown>;

export type IndeterminateCheckboxProps = {
  indeterminate?: boolean
  onChange?: (checked: boolean) => void
  className?: string
} & Omit<HTMLProps<HTMLInputElement>, "onChange">

export type TableProp = {
  url: string,
  setUrl: StateSetter<string>
}