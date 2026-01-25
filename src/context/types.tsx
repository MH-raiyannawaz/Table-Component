import type { Data, StateSetter } from "@/lib/types"
import type { DragEndEvent, SensorDescriptor, SensorOptions } from "@dnd-kit/core"
import type { SortingState, VisibilityState, ColumnPinningState, Table } from "@tanstack/react-table"

export type Pagination = {
  pageIndex: number
  pageSize: number
}

export type RowSelection = Record<string, boolean>
export type ColumnSizing = Record<string, number>

export type AppContextType<T = Data> = {
  state: {
    data: T[]
    globalFilter: string
    total: number
    pagination: Pagination
    sorting: SortingState
    fields: string[]
    columnVisibility: VisibilityState
    columnPinning: ColumnPinningState
    rowSelection: RowSelection
    columnOrder: string[]
    columnSizing: ColumnSizing,
    sensors: SensorDescriptor<SensorOptions>[]
  }
  actions: {
    setData: StateSetter<Data[]>
    setGlobalFilter: StateSetter<string>
    setTotal: StateSetter<number>
    setPagination: StateSetter<Pagination>
    setSorting: StateSetter<SortingState>
    setColumnVisibility: StateSetter<VisibilityState>
    setColumnPinning: StateSetter<ColumnPinningState>
    setRowSelection: StateSetter<RowSelection>
    setColumnOrder: StateSetter<string[]>
    setColumnSizing: StateSetter<ColumnSizing>
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleSelectData: (table: Table<Data>) => void,
    handleResetFilters: (table: Table<Data>) => void,
    handleDragEnd: (event: DragEndEvent) => void
  }
}