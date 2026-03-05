import type { Button } from "@/components/ui/button";
import type { DragEndEvent, SensorDescriptor, SensorOptions } from "@dnd-kit/core"
import type { ColumnDef, ColumnPinningState, Row, SortingState, Table, VisibilityState } from "@tanstack/react-table"
import type { LucideIcon } from "lucide-react";
import type { HTMLProps } from "react";

/** Optional meta for column def: custom header/cell and span (rowSpan, colSpan) */
export type DataTableColumnMeta = {
  headerColSpan?: number;
  headerRowSpan?: number;
  /** Fixed colSpan for every cell in this column */
  cellColSpan?: number;
  /** Fixed rowSpan for every cell in this column */
  cellRowSpan?: number;
  /** Dynamic span per row; return rowSpan: 0 to hide cell (covered by a rowSpan above) */
  getCellSpan?: (row: Row<Data>) => { rowSpan?: number; colSpan?: number };
  /** Custom header render (overrides default header for this column) */
  header?: ColumnDef<Data>['header'];
  /** Custom cell render (overrides default cell for this column) */
  cell?: ColumnDef<Data>['cell'];
};

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

export type ButtonProps = React.ComponentProps<typeof Button>

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
  builtIn?: boolean,
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

export type HeaderFunctionType = {
  sortable: Boolean,
  draggable: Boolean,
  resizable: Boolean,
  canPin: Boolean,
}

export type RowActionType = {
  label?: string,
  headerLabel?: string,
  icon?: LucideIcon,
  rowItems: MenuItem[],
  buttonClassName: string,
  buttonVariant: ButtonProps['variant']
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
    fields: string[],
    isRowActions: RowActionType | null,
    columnVisibility: VisibilityState
    columnPinning: ColumnPinningState
    rowSelection: RowSelection
    columnOrder: string[]
    columnSizing: ColumnSizing,
    sensors: SensorDescriptor<SensorOptions>[],
    filterData: FilterData[], 
    headerFunctions: HeaderFunctionType
  }
  actions: {
    setData?: StateSetter<Data[]>
    setGlobalFilter: StateSetter<string>
    setTotal?: StateSetter<number>
    setPagination?: StateSetter<Pagination>
    setSorting: StateSetter<SortingState>
    setIsRowActions: StateSetter<RowActionType | null>
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
    setFilterData: StateSetter<FilterData[]>,
    setHeaderFunctions: StateSetter<HeaderFunctionType>
  }
}