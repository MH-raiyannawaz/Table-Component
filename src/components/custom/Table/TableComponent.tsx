import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { useEffect, useMemo, useRef, useState, type CSSProperties, type HTMLProps } from "react";
import type { Column, ColumnDef, SortingState, VisibilityState } from '@tanstack/react-table'
import getData from "../../../utils/getData";
import { exportToExcel } from "../../../utils/exportToExcel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TableProp, MenuItem, MenuSubItem } from './types'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronsUpDown, ChevronUp, Download, EllipsisVertical, FunnelIcon, ListChecks, PinIcon, PinOff, PlusCircle, SlidersVertical, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DropdownMenuDemo from '../Dropdown/DropdownMenuDemo'

const CHAR_WIDTH = 10;
const MIN_COL_WIDTH = 100;
const MAX_COL_WIDTH = 400;

type TableRow = Record<string, unknown>


function getColumnWidthFromData<T>(
  data: T[],
  field: keyof T
) {
  const maxLength = Math.max(
    ...data.map((row) => String(row[field] ?? "").length),
    String(field).length
  );

  return Math.min(
    Math.max(maxLength * CHAR_WIDTH, MIN_COL_WIDTH),
    MAX_COL_WIDTH
  );
}

export default function DataTable(props: TableProp) {

  const [data, setData] = useState<Record<string, unknown>[]>([])

  const [globalFilter, setGlobalFilter] = useState('')

  const [total, setTotal] = useState(0)

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })

  const { url } = props

  const [sorting, setSorting] = useState<SortingState>([])

  const fields = data.length > 0 ? Object.keys(data[0]) : []

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    select: false
  })

  const [rowSelection, setRowSelection] = useState({})

  const getPinnedColumnStyle = <TData, TValue>(column: Column<TData, TValue>, tableType: string): CSSProperties => {
    return {
      position: column.getIsPinned() ? 'sticky' : 'relative',
      left: column.getIsPinned() === 'left' ? column.getStart('left') : undefined,
      zIndex: column.getIsPinned() ? 3 : 0,
      width: '100%',
      background: tableType === 'row' && column.getIsPinned() ? 'white' : ''
    }
  }

  function IndeterminateCheckbox({
    indeterminate,
    className = '',
    ...rest
  }: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
    const ref = useRef<HTMLInputElement>(null!)

    useEffect(() => {
      if (typeof indeterminate === 'boolean') {
        ref.current.indeterminate = !rest.checked && indeterminate
      }
    }, [ref, indeterminate])

    return (
      <input
        type="checkbox"
        ref={ref}
        className={className + ' cursor-pointer'}
        {...rest}
      />
    )
  }

  const columns = useMemo<ColumnDef<TableRow>[]>(
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
      },
      ...fields.map(field => (
        {
          accessorKey: field,
          ceil: field.charAt(0).toUpperCase() + field.slice(1),
          header: field.charAt(0).toUpperCase() + field.slice(1),
          size: getColumnWidthFromData(data, field),
          minSize: 100,
          maxSize: 400
        }
      )),
      {
        id: 'actions',
        header: 'Actions',
        cell: () => (
          <div className="text-center">
            <DropdownMenuDemo items={actionItemsRow}>
              <Button variant="outline" size="icon">
                <EllipsisVertical />
              </Button>
            </DropdownMenuDemo>
          </div>
        ),
        size: 64,
        enablePinning: true,
      }
    ],
    [fields, data]
  )

  let table = useReactTable({
    data, columns,
    state: {
      sorting, pagination,
      globalFilter, rowSelection,
      columnVisibility, 
    },
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    enableRowSelection: true,
    enableColumnPinning: true,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isNaN(parseInt(e.target.value)) && parseInt(e.target.value) >= 0) {
      setPagination({ ...pagination, pageSize: parseInt(e.target.value) })
    }
  }

  const handleSelectData = () => {
    let selectedRows = table.getSelectedRowModel().rows.map(row => row.original)
    if (selectedRows.length > 0) {
      table.resetRowSelection()
    }
    table.getColumn('select')?.toggleVisibility()
  }

  const handleResetFilters = () => {
    table.resetRowSelection()
    table.resetColumnVisibility()
    setPagination({ pageIndex: 0, pageSize: 10 })
  }

  const handleCopyDataID = async (id: string) => {
    await navigator.clipboard.writeText(id)
  }

  const handleDownloadExcel = () => {
    let selectedRows = table.getSelectedRowModel().rows.map(row => row.original)
    let filteredRows = table.getFilteredRowModel().rows.map(row => row.original)

    let excelData = selectedRows.length > 0 ? selectedRows : filteredRows
    exportToExcel<TableRow>(excelData, 'filtered-data')
  }

  const subItems: MenuSubItem[] = table
    .getAllLeafColumns()
    .filter(column => column.id !== "select")
    .map(column => ({
      id: column.id,
      label:
        typeof column.columnDef.header === "string"
          ? column.columnDef.header
          : column.id,
      checked: column.getIsVisible(),
      toggleVisibility: (value?: boolean) => {
        column.toggleVisibility(value)
      }
    }))

  const actionItemsHeader: MenuItem[] = [
    { label: 'Select Data', onClick: handleSelectData, onlySM: false, icon: ListChecks },
    { label: 'Views', subItems, onlySM: false, icon: SlidersVertical },
    { label: 'Create Data', onlySM: true },
    { label: 'Download Excel', onClick: handleDownloadExcel, onlySM: false, icon: Download }
  ]

  const actionItemsRow: MenuItem[] = [
    { label: 'Copy ID', onClick: ()=> handleCopyDataID},
    { label: 'Edit Data', onClick: () => { } },
    { label: 'Delete Data', onClick: () => { } },
  ]

  useEffect(() => {
    const fetchData = async () => {
      const skip = pagination.pageIndex * pagination.pageSize;
      let response = await getData(`${url}?skip=${skip}&limit=${pagination.pageSize}`)
      setData(response.data)
      setTotal(response.total)
    }
    fetchData()
  }, [url, pagination.pageIndex, pagination.pageSize])

  return (
    <div className="table-parent h-[92.5svh] lg:h-[85svh] w-[90svw] lg:w-[85svw] mx-auto bg-white shadow-lg flex flex-col">
      <div className="table-header w-full relative flex justify-between items-center h-18 lg:h-16 shrink-0 px-3.5 lg:px-5">
        <div className="lg:w-1/3 flex items-center space-x-2.5">
          <Input type="text" placeholder="Search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="h-9 w-1/2 bg-slate-400! placeholder:text-white focus:bg-slate-500! text-white rounded-lg outline-none! p-2.5" />
          <p>Page No: {pagination.pageIndex + 1}</p>
        </div>
        <div className="flex items-center space-x-2.5">
          <Button variant={'outline'} className="hidden md:flex bg-slate-400! hover:bg-slate-500! text-white hover:text-white">
            Create Data
            <PlusCircle />
          </Button>
          <Button variant={'outline'} className="hidden md:flex bg-slate-400! hover:bg-slate-500! text-white hover:text-white">
            <FunnelIcon />
          </Button>
          <DropdownMenuDemo items={actionItemsHeader}>
            <Button variant={'outline'} className="h-9 flex items-center bg-slate-400! hover:bg-slate-500! text-white hover:text-white outline-none">
              <EllipsisVertical />
            </Button>
          </DropdownMenuDemo>
        </div>
      </div>
      <div className="table-wrapper flex-1 flex overflow-auto 
  scrollbar-none -ms-overflow-style-none scroll-hide relative">
        <Table className="border-collapse h-full w-full">
          <TableHeader className="bg-white z-10 h-14">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    style={{ minWidth: header.getSize(), ...getPinnedColumnStyle(header.column, 'header') }}
                    className="px-2 pb-2 border bg-slate-100 text-left"
                  >
                    <div className="flex justify-between items-center space-x-5">
                      <span>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </span>
                      <div className="flex">
                        {header.column.id !== 'select' && header.column.id !== 'actions' &&
                          <span>
                            {header.column.getIsSorted() === 'asc' && (
                              <ChevronDown cursor={'pointer'} className="h-5"
                                onClick={header.column.getToggleSortingHandler()}
                              />
                            )}
                            {header.column.getIsSorted() === 'desc' && (
                              <ChevronUp cursor={'pointer'} className="h-5"
                                onClick={header.column.getToggleSortingHandler()}
                              />
                            )}
                            {header.column.getIsSorted() === false && (
                              <ChevronsUpDown cursor={'pointer'} className="h-5"
                                onClick={header.column.getToggleSortingHandler()}
                              />
                            )}
                          </span>
                        }
                        {header.column.id !== 'select' && header.column.id !== 'actions' && <span>
                          {header.column.getIsPinned() ? (
                            <PinOff
                              className="h-5 cursor-pointer"
                              onClick={() => header.column.pin(false)}
                            />
                          ) : (
                            <PinIcon
                              className="h-5 cursor-pointer"
                              onClick={() => header.column.pin('left')}
                            />
                          )}
                        </span>}
                      </div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell
                    key={cell.id}
                    style={{ ...getPinnedColumnStyle(cell.column, 'row') }}
                    className={`px-2 py-1`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {table.getSelectedRowModel().rows.length > 0 && <div className="fixed left-[50%] bottom-30 -translate-x-[50%] z-30 flex bg-white p-2 shadow-lg rounded-lg space-x-2">
          <Button className="bg-slate-400! hover:bg-slate-500! text-white hover:text-white outline-none h-9 flex items-center" onClick={handleResetFilters} variant="outline">Clear Selection</Button>
          <Button className="bg-slate-400! hover:bg-slate-500! text-white hover:text-white outline-none h-9 flex items-center" variant="outline">
            <Download />
          </Button>
          <Button className="bg-slate-400! hover:bg-slate-500! text-white hover:text-white outline-none h-9 flex items-center" variant="outline">
            <Trash />
          </Button>
        </div>}
      </div>
      <div className="table-footer relative flex items-center justify-around lg:justify-evenly h-20 lg:h-16 shrink-0 px-5">
        <div className="btn-group flex items-center space-x-2.5">
          <Button variant={'outline'} className="h-7 w-7 lg:h-9 lg:w-12 bg-slate-400! focus:ring-0 active:ring-0 hover:bg-slate-500! text-white hover:text-white cursor-pointer outline-none active:outline-none focus:outline-none" disabled={!table.getCanPreviousPage()} onClick={() => table.firstPage()}>
            <ChevronsLeft />
          </Button>
          <Button variant={'outline'} className="h-7 w-7 lg:h-9 lg:w-12 bg-slate-400! focus:ring-0 active:ring-0 hover:bg-slate-500! text-white hover:text-white cursor-pointer outline-none active:outline-none focus:outline-none" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            <ChevronLeft />
          </Button>
          <Button variant={'outline'} className="h-7 w-7 lg:h-9 lg:w-12 bg-slate-400! focus:ring-0 active:ring-0 hover:bg-slate-500! text-white hover:text-white cursor-pointer outline-none active:outline-none focus:outline-none" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            <ChevronRight />
          </Button>
          <Button variant={'outline'} className="h-7 w-7 lg:h-9 lg:w-12 bg-slate-400! focus:ring-0 active:ring-0 hover:bg-slate-500! text-white hover:text-white cursor-pointer outline-none active:outline-none focus:outline-none" disabled={!table.getCanNextPage()} onClick={() => table.lastPage()}>
            <ChevronsRight />
          </Button>
        </div>
        <div className="per-page flex flex-col lg:flex-row items-center space-y-1.5 space-x-0 lg:space-y-0 lg:space-x-2.5">
          <span>Per Page: </span>
          <Input value={pagination.pageSize} onChange={handleChange} className="scroll-hide h-7 lg:h-9 w-15 lg:w-20 outline-none bg-slate-400 focus:bg-slate-400 rounded-md text-white px-3" />
        </div>
      </div>
    </div>
  )
}
