import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { useEffect, useMemo, type ChangeEvent } from "react";
import type { ColumnDef } from '@tanstack/react-table'
import { handleDownloadExcel, getData, handleCopyDataID } from "../../../lib/utils";
import type { MenuItem, MenuSubItem } from './types'
import { ChevronDown, Download, EllipsisVertical, ListChecks, SlidersVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import Dropdown from "../Dropdown/DropdownComponent";
import type { Data, TableProp } from "@/lib/types";
import TableFooterComp from "./subcomponents/TableFooterComp";
import TableHeaderComp from "./subcomponents/TableHeaderComp";
import useAppContext from "@/context/useAppContext";
import IndeterminateCheckbox from "./mincomponents/IndeterminateCheckbox";
import TableBodyComp from "./subcomponents/TableBodyComp";
import { getFilterData, getFilterType } from "./utils";
import type { FilterData } from "@/context/types";

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
            <Dropdown label="Actions" menuItems={actionItemsRow}>
              <Button variant="outline" size="icon">
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
      onChange: (value?: boolean) => {
        column.toggleVisibility(value)
      }
    }))

  const handleFilterState = (id: string, label: string) => {
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
        filterType: getFilterType(label)
      }

      setFilterData([...filterData, newField])
    }
  }

  const handleFilterRange = (e, id: string) => {
    let [currMin, currMax] = e
    let fieldExist = filterData.find(data => data.id === id)

    if (fieldExist) {
      let mappedRangeData = filterData.map(data => {
        if (data.id === id) {
          return {
            ...data,
            filterType: "range",
            range: {
              ...data.range,  // Keep min/max bounds
              currMin,
              currMax
            }
          }
        }
        return data
      })
      setFilterData(mappedRangeData)
    }
    else {
      // Get the default range for this column
      const defaultRange = filterItems.find(item => item.id === id)?.range

      let mappedRangeData = [...filterData, {
        id,
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
        id: row.id, label: row.getValue(column.id as string),
        checked: filterData.some(d =>
          d.id === column.id &&
          d.labels?.includes(row.getValue(column.id as string))
        ),
        onChange: () => handleFilterState(column.id as string, String(row.original[column.id as string]))
      }))


      // Get stored filter for this column
      const storedFilter = filterData.find(d => d.id === column.id)

      // Get default range from data
      const defaultRange = getFilterData(filterSubItems).range

      return {
        id: column.id as string, label: column.header as string,
        icon: ChevronDown, type: 'filter', range: {
          min: defaultRange?.min, 
          max: defaultRange?.max,
          currMin: storedFilter?.range?.currMin ?? defaultRange?.min,
          currMax: storedFilter?.range?.currMax ?? defaultRange?.max,
        },
          subItems: getFilterData(filterSubItems.filter(filterSubItem => filterSubItem.label)).subItems,
          filterType: getFilterType(filterSubItems.find(filterSubItem => filterSubItem.label !== '')?.label),
          onClick: (e) => handleFilterRange(e, column.id)
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
    // filterData.forEach(data => {
    //   table.getColumn(data.id)?.setFilterValue(data.labels)
    // })
    console.log(filterData)
  }, [filterData])

  return (
    <div className="table-parent h-[92.5svh] lg:h-[90svh] w-[90svw] lg:w-[85svw] mx-auto flex flex-col">
      <TableHeaderComp filterItems={filterItems} actionItemsHeader={actionItemsHeader} />
      <TableBodyComp table={table} />
      <TableFooterComp table={table} />
    </div>
  )
}
