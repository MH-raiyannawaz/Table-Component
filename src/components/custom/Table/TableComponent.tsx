import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { useEffect, useMemo, useRef, useState, type HTMLProps } from "react";
import type { ColumnDef, SortingState, VisibilityState } from '@tanstack/react-table'
import getData from "../../../utils/getData";
import { exportToExcel } from "../../../utils/exportToExcel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronsUpDown, ChevronUp, EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DropdownMenuDemo from '../Dropdown/DropdownMenuDemo'
import { DropdownMenuGroup, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { DropdownMenuShortcut } from "@/components/ui/dropdown-menu";

type TableRow = Record<string, unknown>

type StateSetter<T> = React.Dispatch<React.SetStateAction<T>>;

type TableProp = {
  url: string,
  setUrl: StateSetter<string>
}

const CHAR_WIDTH = 10; // px per character (tweak)
const MIN_COL_WIDTH = 100;
const MAX_COL_WIDTH = 400;

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

  const [columnsSelection, setColumnsSelection] = useState(false)

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
        header: ({ table, column }) => {
          console.log(column)
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
      ))],
    [fields, data]
  )

  let table = useReactTable({
    data, columns,
    state: { sorting, pagination, globalFilter, rowSelection, columnVisibility },
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    enableRowSelection: true,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel()
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

  const handleDownloadExcel = () => {
    let selectedRows = table.getSelectedRowModel().rows.map(row => row.original)
    let filteredRows = table.getFilteredRowModel().rows.map(row => row.original)

    let excelData = selectedRows.length > 0 ? selectedRows : filteredRows
    exportToExcel<TableRow>(excelData, 'filtered-data')
  }

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
    <div className="table-parent h-[85svh] w-[85svw] mx-auto bg-white shadow-lg flex flex-col">
      <div className="table-header relative flex justify-between items-center h-16 shrink-0 px-5">
        {columnsSelection && <div className="h-65 w-40 shadow-lg bg-slate-400 z-100 absolute right-5 top-15 rounded-md p-2.5 space-y-2.5 scroll-hide overflow-y-scroll text-white">
          {table.getAllLeafColumns().filter(column => column.id !== 'select').map((column => (
            <div className="px-1" key={column.id}>
              <label>
                <input
                  {...{
                    type: 'checkbox',
                    checked: column.getIsVisible(),
                    onChange: column.getToggleVisibilityHandler()
                  }}
                />{' '}
                {column.id.charAt(0).toUpperCase() + column.id.slice(1)}
              </label>
            </div>
          )))}
        </div>}
        <div className="flex items-center space-x-2.5">
          <label>Search</label>
          <Input type="text" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="h-9 bg-slate-400! focus:bg-slate-500! text-white rounded-lg outline-none! p-2.5" />
          <p className="pr-2.5">Page No: {pagination.pageIndex + 1}</p>
        </div>
        <div className="flex items-center space-x-2.5">
          <Button variant={'outline'} className="h-9 flex items-center bg-slate-400! hover:bg-slate-500! text-white hover:text-white outline-none"
            onClick={handleSelectData}
          >Select Data</Button>
          <Button variant={'outline'} className="h-9 flex items-center bg-slate-400! hover:bg-slate-500! text-white hover:text-white outline-none"
            onClick={() => setColumnsSelection(!columnsSelection)}
          >Select Field</Button>
          <DropdownMenuDemo>
            <Button variant={'outline'} className="h-9 flex items-center bg-slate-400! hover:bg-slate-500! text-white hover:text-white outline-none"
              onClick={() => setColumnsSelection(!columnsSelection)}
            ><EllipsisVertical/></Button>
          </DropdownMenuDemo>
        </div>
      </div>
      <div className="table-wrapper flex-1 flex overflow-auto border-gray-200
  scrollbar-none -ms-overflow-style-none scroll-hide">
        <Table className="border-collapse h-full w-full">
          <TableHeader className="sticky top-0 bg-white z-10 h-14">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    style={{ minWidth: header.getSize() }}
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
                      {header.column.id !== 'select' &&
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
                    className="border px-2 py-1"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="table-footer relative flex items-center justify-evenly h-16 shrink-0 px-5">
        <div className="btn-group flex items-center space-x-2.5">
          <Button variant={'outline'} className="h-9 bg-slate-400! focus:ring-0 active:ring-0 hover:bg-slate-500! text-white cursor-pointer outline-none active:outline-none focus:outline-none" disabled={!table.getCanPreviousPage()} onClick={() => table.firstPage()}>
            <ChevronsLeft />
          </Button>
          <Button variant={'outline'} className="h-9 bg-slate-400! focus:ring-0 active:ring-0 hover:bg-slate-500! text-white cursor-pointer outline-none active:outline-none focus:outline-none" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            <ChevronLeft />
          </Button>
          <Button variant={'outline'} className="h-9 bg-slate-400! focus:ring-0 active:ring-0 hover:bg-slate-500! text-white cursor-pointer outline-none active:outline-none focus:outline-none" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            <ChevronRight />
          </Button>
          <Button variant={'outline'} className="h-9 bg-slate-400! focus:ring-0 active:ring-0 hover:bg-slate-500! text-white cursor-pointer outline-none active:outline-none focus:outline-none" disabled={!table.getCanNextPage()} onClick={() => table.lastPage()}>
            <ChevronsRight />
          </Button>
        </div>
        <div className="per-page flex items-center space-x-2.5">
          <span>Per Page: </span>
          <Input value={pagination.pageSize} onChange={handleChange} className="scroll-hide h-9 w-20 outline-none bg-slate-400 focus:bg-slate-400 rounded-md text-white px-3" />
          <Button className="bg-slate-400! hover:bg-slate-500! text-white hover:text-white outline-none h-9 flex items-center" onClick={handleDownloadExcel} variant="ghost">Download Excel</Button>
          <Button className="bg-slate-400! hover:bg-slate-500! text-white hover:text-white outline-none h-9 flex items-center" onClick={handleResetFilters} variant="outline">Reset</Button>
        </div>
      </div>
    </div>
  )
}
