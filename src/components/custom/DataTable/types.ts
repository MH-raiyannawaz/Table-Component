import type { DragEndEvent, SensorDescriptor, SensorOptions } from "@dnd-kit/core"
import type { ColumnDef, ColumnPinningState, SortingState, Table, VisibilityState } from "@tanstack/react-table"
import type { LucideIcon } from "lucide-react";
import type { HTMLProps } from "react";

export type StateSetter<T> = React.Dispatch<React.SetStateAction<T>>;
export type Data = Record<string, unknown>;

export interface TopHeaderChildProps {
    filterItems?: MenuItem[];
    actionItemsHeader?: MenuItem[],
    actionSubItemsHeader?: MenuSubItem[]
}

export type IndeterminateCheckboxProps = {
  indeterminate?: boolean
  isHeader?: boolean
  onCheck?:(checked: boolean | React.ChangeEvent<HTMLInputElement>) => void
  className?: string
} & Omit<HTMLProps<HTMLInputElement>, "onChange">

export type Pagination = {
  pageIndex: number
  pageSize: number
}

export type RowSelection = Record<string, boolean>
export type ColumnSizing = Record<string, number>

export type MenuSubItem = {
  id?: string
  label?: string,
  checked?: boolean,
  onCheck?: (value?: boolean) => void
}

export type Range = {
  min?: number | Date,
  max?: number | Date,
  currMin?: number,
  currMax?: number,
  from?: Date,
  to?: Date
}

export type MenuItem = {
  id: string,
  label: string,
  type: string,
  filterType?: FilterType,
  onClick?:  (row?: Data) => void | null,
  onCommit?: (e: Number[]) => void | null,
  onSelect?: (e: {from: Date, to: Date}) => void | null,
  onChange?: (id: string, label: string, active?: boolean) => void
  subItems?: MenuSubItem[] | null,
  range?: Range | null,
  custom?: boolean,
  required?: boolean,
  onlySM?: boolean
  icon?: LucideIcon
}

export type FilterType = 'date' | 'number' | 'string' | 'boolean'

export type FilterData = {
  id: string,
  order: Number,
  filterType?: FilterType,
  labels?: string[]
  range?: Range
}

export type DataTableContextType = {
  state: {
    data: Data[],
    table: Table<Data>,
    columns: ColumnDef<Data>[]
    globalFilter: string
    total?: number
    pagination?: Pagination
    sorting: SortingState
    fields: string[]
    columnVisibility: VisibilityState
    columnPinning: ColumnPinningState
    rowSelection: RowSelection
    columnOrder: string[]
    columnSizing: ColumnSizing,
    sensors: SensorDescriptor<SensorOptions>[],
    filterData: FilterData[]
  }
  actions: {
    setData?: StateSetter<Data[]>
    setGlobalFilter: StateSetter<string>
    setTotal?: StateSetter<number>
    setPagination?: StateSetter<Pagination>
    setSorting: StateSetter<SortingState>
    setColumnVisibility: StateSetter<VisibilityState>
    setColumnPinning: StateSetter<ColumnPinningState>
    setRowSelection: StateSetter<RowSelection>
    setColumnOrder: StateSetter<string[]>
    setColumnSizing: StateSetter<ColumnSizing>
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleSelectData: () => void,
    handleResetFilters: () => void,
    handleDragEnd: (event: DragEndEvent) => void,
    handleDragEndMenu: (event: DragEndEvent) => void,
    setFilterData: StateSetter<FilterData[]>
  }
}