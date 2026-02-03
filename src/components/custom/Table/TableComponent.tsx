import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { useEffect, useMemo } from "react";
import type { ColumnDef } from '@tanstack/react-table'
import { handleDownloadExcel, getData, handleCopyDataID } from "../../../lib/utils";
import type { MenuItem, MenuSubItem } from './types'
import { ChevronDown, Download, EllipsisVertical, ListChecks, SlidersVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import Dropdown from "../Dropdown/Dropdown";
import type { Data, TableProp } from "@/lib/types";
import TableFooterComp from "./subcomponents/TableFooterComp";
import TableHeaderComp from "./subcomponents/TableHeaderComp";
import useAppContext from "@/context/useAppContext";
import IndeterminateCheckbox from "./mincomponents/IndeterminateCheckbox";
import TableBodyComp from "./subcomponents/TableBodyComp";
import { getFilterData, getFilterType } from "./utils";

const MIN_COL_WIDTH = 200;

export default function TableComponent(props: TableProp) {

  const {
    state: { data, globalFilter, total, pagination, sorting, rowSelection,
      columnVisibility, columnPinning, columnOrder, columnSizing, filterData },
    actions: { setData, setGlobalFilter, setTotal, setPagination, setSorting,
      setRowSelection, setColumnVisibility, setColumnPinning, setColumnOrder,
      setColumnSizing, handleSelectData, setFilterData } } = useAppContext()

  const { url } = props

  const fields = useMemo(() => data.length > 0 ? Object.keys(data[0]) : [], [data])

  const columnSizes = useMemo(() => {
    const sizes: Record<string, number> = {}
    fields.forEach(field => {
      sizes[field] = MIN_COL_WIDTH
    })
    return sizes
  }, [fields])

  const columns = useMemo<ColumnDef<Data>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => {
          return <IndeterminateCheckbox
            {...{
              size: 40,
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        },
        cell: ({ row }) => (
          <div className="px-1">
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
        enablePinning: true
      },
      ...fields.map(field => (
        {

          id: field,
          accessorKey: field,
          filterFn: (row, id, value) => {
            if (!value) return true

            const cellValue = row.getValue(id)
            const { labels, dateRange, numberRange } = value

            // labels (string)
            if (labels?.length) {
              if (!labels.includes(String(cellValue))) return false
            }

            // date range
            if (dateRange) {
              const { from, to } = dateRange
              const d = new Date(cellValue)
              if (from && d < new Date(from)) return false
              if (to && d > new Date(to)) return false
            }

            // number range
            if (numberRange) {
              const num = Number(cellValue)
              const { currMin, currMax } = numberRange

              if (currMin != null && num < currMin) return false
              if (currMax != null && num > currMax) return false
            }

            return true
          },
          ceil: field.charAt(0).toUpperCase() + field.slice(1),
          header: field.charAt(0).toUpperCase() + field.slice(1),
          size: columnSizes[field] || MIN_COL_WIDTH,
          minSize: 100,
          maxSize: 400,
          enablePinning: true,
        }
      )),
      {
        id: 'actions',
        header: 'Actions',
        cell: () => (
          <div className="text-center">
            <Dropdown label="Actions" isDraggableComponent={false} menuItems={actionItemsRow}>
              <Button variant="outline" className="cursor-pointer" size="icon">
                <EllipsisVertical />
              </Button>
            </Dropdown>
          </div>
        ),
        size: 64,
        enablePinning: true,
      }
    ],
    [fields, columnSizes]
  )

  let table = useReactTable({
    data, columns,
    state: {
      sorting, pagination,
      globalFilter, rowSelection,
      columnVisibility, columnPinning,
      columnOrder, columnSizing
    },
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    enableRowSelection: true,
    enableColumnPinning: true,
    enableColumnResizing: true,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    onColumnPinningChange: setColumnPinning,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: 'onChange',
  })

  const actionSubItemsHeader: MenuSubItem[] = table
    .getAllLeafColumns()
    .filter(column => column.id !== "select")
    .map(column => ({
      id: column.id,
      label:
        typeof column.columnDef.header === "string"
          ? column.columnDef.header
          : column.id,
      checked: column.getIsVisible(),
      onCheck: (value?: boolean) => {
        column.toggleVisibility(value)
      }
    }))

  const handleFilterSelect = (id: string, label: string) => {
    const existing = filterData.find(f => f.id === id)

    if (existing) {
      const labelExists = existing.labels?.includes(label)

      const updatedLabels = labelExists
        ? existing.labels?.filter(l => l !== label)
        : [...(existing.labels ?? []), label]

      const updated = updatedLabels?.length === 0
        ? filterData.filter(f => f.id !== id)
        : filterData.map(f =>
          f.id === id
            ? { ...f, labels: updatedLabels }
            : f
        )

      setFilterData(updated)
    } else {
      const newField = {
        id,
        labels: [label],
        order: filterData.length + 1,
        filterType: 'string'
      }

      setFilterData([...filterData, newField])
    }
  }

  const handleFilterNumber = (e: Number[], id: string) => {
    let [currMin, currMax] = e
    let fieldExist = filterData.find(data => data.id === id)

    if (fieldExist) {
      let mappedRangeData = filterData.map(data => {
        if (data.id === id) {
          return {
            ...data,
            filterType: "range",
            range: {
              ...data.range,
              currMin,
              currMax
            }
          }
        }
        else return data
      })
      setFilterData(mappedRangeData)
    }
    else {
      const defaultRange = filterItems.find(item => item.id === id)?.range

      let mappedRangeData = [...filterData, {
        id,
        order: filterData.length + 1,
        filterType: "range",
        range: {
          min: defaultRange?.min,
          max: defaultRange?.max,
          currMin,
          currMax
        }
      }]
      setFilterData(mappedRangeData)
    }
  }

  const handleFilterDate = (e: {from: Date, to: Date}, id: string) => {
    let fieldExist = filterData.find(data => data.id === id)

    let range = {
      from: new Date(e.from),
      to: new Date(e.to)
    }

    if (fieldExist) {
      let mappedRangeData = filterData.map(data => {
        if (data.id === id) {
          return { ...data, range }
        }
        else {
          return data
        }
      })
      setFilterData(mappedRangeData)
    }
    else {
      setFilterData([...filterData, { id, order: filterData.length+1, filterType: 'date', range }])
    }
  }


  const actionItemsHeader: MenuItem[] = [
    { id: 'select-data', type: 'action', label: 'Select Data', onClick: () => handleSelectData(table), onlySM: false, icon: ListChecks },
    { id: 'views-data', type: 'filter', label: 'Views', subItems: actionSubItemsHeader, onlySM: false, icon: SlidersVertical },
    { id: 'create-data', type: 'action', label: 'Create Data', onlySM: true },
    { id: 'download-data', type: 'action', label: 'Download Excel', onClick: () => handleDownloadExcel(table, data), onlySM: false, icon: Download }
  ]

  const actionItemsRow: MenuItem[] = [
    { id: 'copy-id', type: 'action', label: 'Copy ID', onClick: () => handleCopyDataID },
    { id: 'edit-data', type: 'action', label: 'Edit Data', onClick: () => { } },
    { id: 'delete-data', type: 'action', label: 'Delete Data', onClick: () => { } },
  ]

  let filterItems: MenuItem[] = columns.filter(column => column.id !== 'select')
    .map(column => {
      let filterSubItems: MenuSubItem[] = table.getCoreRowModel().rows.map((row) => ({
        id: row.id as string, label: row.getValue(column.id as string),
        checked: filterData.some(d =>
          d.id === column.id &&
          d.labels?.includes(row.getValue(column.id as string))
        ),
        onCheck: () => handleFilterSelect(column.id as string, String(row.original[column.id as string]))
      }))

      const storedFilter = filterData.find(d => d.id === column.id)
      const defaultRange = getFilterData(filterSubItems).range

      return {
        id: column.id as string, label: column.header as string,
        icon: ChevronDown, type: 'filter', range: {
          min: defaultRange?.min,
          max: defaultRange?.max,
          from: storedFilter?.range?.from,
          to: storedFilter?.range?.to,
          currMin: storedFilter?.range?.currMin ?? defaultRange?.min,
          currMax: storedFilter?.range?.currMax ?? defaultRange?.max,
        },
        subItems: getFilterData(filterSubItems.filter(filterSubItem => filterSubItem.label)).subItems,
        filterType: getFilterType(filterSubItems.find(filterSubItem => filterSubItem.label !== '')?.label),
        onCommit: (e: Number[]) => handleFilterNumber(e, column.id as string),
        onSelect: (e: {from: Date, to: Date}) => handleFilterDate(e, column.id as string),
      }
    })

  useEffect(() => {
    const fetchData = async () => {
      const skip = pagination.pageIndex * pagination.pageSize;
      let response = await getData(`${url}?skip=${skip}&limit=${pagination.pageSize}`)
      setData(response.data)
      setTotal(response.total)
    }

    fetchData()
  }, [url, pagination.pageIndex, pagination.pageSize])

  useEffect(() => {
    if (columns.length > 2) {
      setColumnOrder(columns.map(c => c.id!))
    }
  }, [columns])

  useEffect(() => {
    if(filterData.length > 0){

      const sorted = [...filterData].sort((a,b) => Number(a.order) - Number(b.order));

      sorted.forEach(data => {
        table.getColumn(data.id)?.setFilterValue(prev => {
          const prevLabels = prev?.labels ?? []
          const prevDateRange = prev?.dateRange ?? null
          const prevNumberRange = prev?.numberRange ?? null
  
          let next = {
            labels: prevLabels,
            dateRange: prevDateRange,
            numberRange: prevNumberRange
          }
  
          // labels filter
          if (data.labels) {
            next.labels = data.labels
          }
  
          // date filter
          if (data.filterType === "date" && data.range) {
            next.dateRange = data.range // { from, to }
          }
  
          // number range filter
          if (data.filterType === "range" && data.range) {
            const { currMin, currMax } = data.range
            next.numberRange = {
              currMin: currMin ?? prevNumberRange?.currMin ?? null,
              currMax: currMax ?? prevNumberRange?.currMax ?? null
            }
          }
  
          return next
        })
      })
    }
  }, [filterData])

  return (
    <div className="table-parent h-[92.5svh] lg:h-[90svh] w-[90svw] lg:w-[85svw] mx-auto flex flex-col">
      <TableHeaderComp filterItems={filterItems} actionItemsHeader={actionItemsHeader}/>
      <TableBodyComp table={table} />
      <TableFooterComp table={table} />
    </div>
  )
}
