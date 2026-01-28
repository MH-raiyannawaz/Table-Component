import { useMemo, useState, type ReactNode } from "react";
import AppContext from "./AppContext";
import { type ColumnPinningState, type Row, type SortingState, type Table, type VisibilityState } from "@tanstack/react-table";
import type { FilterData, Pagination } from "./types";
import { arrayMove } from "@dnd-kit/sortable";
import { KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import type { Data } from "@/lib/types";

const AppContextState = ({ children }: { children: ReactNode }) => {

  const [data, setData] = useState<Record<string, unknown>[]>([])

  const [globalFilter, setGlobalFilter] = useState('')

  const [total, setTotal] = useState(0)

  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 100
  })

  const [sorting, setSorting] = useState<SortingState>([])

  const fields = useMemo(() => data.length > 0 ? Object.keys(data[0]) : [], [data])

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    select: false
  })

  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: [],
    right: ['actions']
  })

  const [rowSelection, setRowSelection] = useState({})

  const [columnOrder, setColumnOrder] = useState<string[]>([])

  const [columnSizing, setColumnSizing] = useState({})
  
  const [ filterData, setFilterData ] = useState<FilterData[]>([
    // {range: {min: }}
  ])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isNaN(parseInt(e.target.value)) && parseInt(e.target.value) >= 0) {
      setPagination({ ...pagination, pageSize: parseInt(e.target.value) })
    }
  }

  const handleSelectData = (table: Table<Data>) => {
    let selectedRows = table.getSelectedRowModel().rows.map((row: Row<Data>) => row.original)
    if (selectedRows.length > 0) {
      table.resetRowSelection()
    }
    table.getColumn('select')?.toggleVisibility()
  }

  const handleResetFilters = (table: Table<Data>) => {
    table.resetRowSelection()
    table.resetColumnVisibility()
    setPagination({ pageIndex: 0, pageSize: 10 })
    setFilterData([])
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string)
        const newIndex = columnOrder.indexOf(over.id as string)
        const newOrder = arrayMove(columnOrder, oldIndex, newIndex)
        return newOrder
      })
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  )

  return <AppContext.Provider value={{
    state: {
      data,
      globalFilter,
      total,
      pagination,
      sorting,
      fields,
      columnVisibility,
      columnPinning,
      rowSelection,
      columnOrder,
      columnSizing,
      sensors,
      filterData
    },
    actions: {
      setData,
      setGlobalFilter,
      setTotal,
      setPagination,
      setSorting,
      setColumnVisibility,
      setColumnPinning,
      setRowSelection,
      setColumnOrder,
      setColumnSizing,
      handleChange,
      handleSelectData,
      handleResetFilters,
      handleDragEnd,
      setFilterData
    },
  }}>
    {children}
  </AppContext.Provider>
}

export default AppContextState