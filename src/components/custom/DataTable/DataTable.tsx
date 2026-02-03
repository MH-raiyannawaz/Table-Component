import './datatable.css'
import React, { createContext, useContext, useEffect, type CSSProperties } from "react";
import { useMemo, useState, type ReactNode } from "react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type Cell, type ColumnDef, type ColumnPinningState, type Header, type Row, type SortingState, type Table as TableT, type VisibilityState } from "@tanstack/react-table";
import type { FilterData, FilterType, Pagination } from "./types.ts";
import { arrayMove, horizontalListSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import type { Data, StateSetter, MenuItem, DataTableContextType } from "./types.ts";
import IndeterminateCheckbox from "../Table/mincomponents/IndeterminateCheckbox.tsx";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronsUpDown, ChevronUp, Download, EllipsisVertical, GripVertical, ListChecks, PinIcon, PinOff, SlidersVertical, Trash } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import Dropdown from "../Dropdown/Dropdown.tsx";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { CSS } from '@dnd-kit/utilities';
import { getFilterData, getFilterType, getPinnedColumnStyle } from './utils.ts';
import type { Item } from '@/lib/types.ts';
import { handleDownloadExcel } from '@/lib/utils.ts';
import type { MenuSubItem } from '../Table/types.tsx';

const MIN_COL_WIDTH = 200;

const DataTableContext = createContext<DataTableContextType | null>(null)

export const useDataTableContext = () => {
    const ctx = useContext(DataTableContext)
    if (!ctx) throw new Error("useAppContext must be used inside AppProvider")
    return ctx
}

const DragAlongCell = ({ cell }: { cell: Cell<Data, unknown> }) => {
    const { isDragging, setNodeRef, transform } = useSortable({
        id: cell.column.id,
    })

    const pinnedStyle = getPinnedColumnStyle(cell.column, 'row')
    const isPinnedLeft = cell.column.getIsPinned?.() === "left"
    const nextCol = cell.row.getVisibleCells()[cell.row.getVisibleCells().indexOf(cell) + 1]?.column
    const nextIsPinnedLeft = nextCol?.getIsPinned?.() === "left"
    const isLastLeftPinned = isPinnedLeft && !nextIsPinnedLeft

    // const isPinnedRight = cell.column.getIsPinned?.() === "right"
    // const prevCol = cell.row.getVisibleCells()[cell.row.getVisibleCells().indexOf(cell) - 1]?.column
    // const prevIsPinnedRight = prevCol?.getIsPinned?.() === "right"
    // const isLastRightPinned = isPinnedRight && !prevIsPinnedRight

    const style: CSSProperties = {
        ...pinnedStyle,
        opacity: isDragging ? 0.8 : 1,
        transform: CSS.Translate.toString(transform),
        transition: 'width transform 0.2s ease-in-out',
        width: cell.column.getSize(),
        zIndex: isDragging ? 1 : pinnedStyle.zIndex,
    }

    return (
        <TableCell
            ref={setNodeRef}
            key={cell.id}
            style={style}
            className={`px-2 py-1`}
        >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
            {isLastLeftPinned && (
                <div className="absolute top-0 h-full w-full pointer-events-none shadow-pinned-left" />
            )}
            {/* {isLastRightPinned && (
                <div className="absolute top-0 h-full w-full pointer-events-none shadow-pinned-right" />
            )} */}
        </TableCell>
    )
}

const DraggableTableHeader = ({
    table, header,
}: {
    table: TableT<Data>, header: Header<Data, unknown>
}) => {
    const { attributes, isDragging, listeners, setNodeRef, transform } =
        useSortable({
            id: header.column.id,

        })
    const pinnedLeft = table.getState().columnPinning.left || []
    const isLastLeftPinned =
        pinnedLeft.length > 0 &&
        pinnedLeft[pinnedLeft.length - 1] === header.column.id

    // const pinnedRight = table.getState().columnPinning.right || []
    // const isLastRightPinned =
    //     pinnedRight.length > 0 &&
    //     pinnedRight[pinnedRight.length - 1] === header.column.id

    const pinnedStyle = getPinnedColumnStyle(header.column, 'header')

    const style: CSSProperties = {
        ...pinnedStyle,
        opacity: isDragging ? 0.8 : 1,
        transform: CSS.Translate.toString(transform),
        transition: 'width transform 0.2s ease-in-out',
        whiteSpace: 'nowrap',
        width: header.column.getSize(),
        zIndex: isDragging ? 1 : pinnedStyle.zIndex,
    }

    return (
        <TableHead
            ref={setNodeRef}
            key={header.id}
            style={{ minWidth: header.getSize(), ...style }}
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
                                className="h-5"
                                cursor={'pointer'}
                                onClick={() => header.column.pin(false)}
                            />
                        ) : (
                            <PinIcon
                                className="h-5"
                                cursor={'pointer'}
                                onClick={() => header.column.pin('left')}
                            />
                        )}
                    </span>}
                    {header.column.id !== 'select' && header.column.id !== 'actions' &&
                        <span>
                            <GripVertical cursor={'grab'} {...listeners} {...attributes} />
                        </span>
                    }
                    {header.column.getCanResize() && (
                        <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none ${header.column.getIsResizing() ? 'bg-blue-500' : 'hover:bg-blue-400'
                                }`}
                        />
                    )}
                </div>
            </div>
            {isLastLeftPinned && (
                <div className="absolute top-0 h-full w-full pointer-events-none shadow-pinned-left" />
            )}
            {/* {isLastRightPinned && (
                <div className="absolute top-0 h-full w-full pointer-events-none shadow-pinned-right" />
            )} */}
        </TableHead>
    )
}

export const DataTable = ({ children, data, total, setTotal, pagination, setPagination }:
    {
        children: ReactNode, data: Data[], setData: StateSetter<Data[]>,
        pagination?: Pagination, setPagination?: StateSetter<Pagination>,
        total?: number, setTotal?: StateSetter<number>
    }
) => {

    const [globalFilter, setGlobalFilter] = useState('')

    const [sorting, setSorting] = useState<SortingState>([])

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

    const [filterData, setFilterData] = useState<FilterData[]>([
        // {range: {min: }}
    ])

    const fields = useMemo(() => data.length > 0 ? Object.keys(data[0]) : [], [data])

    const actionItemsRow: MenuItem[] = [
        { id: 'copy-id', type: 'action', label: 'Copy ID', onClick: () => { } },
        { id: 'edit-data', type: 'action', label: 'Edit Data', onClick: () => { } },
        { id: 'delete-data', type: 'action', label: 'Delete Data', onClick: () => { } },
    ]


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
                            onCheck: table.getToggleAllRowsSelectedHandler(),
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
                                onCheck: row.getToggleSelectedHandler(),
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
                        <Dropdown label="Actions" menuItems={actionItemsRow}>
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


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isNaN(parseInt(e.target.value)) && parseInt(e.target.value) >= 0) {
            setPagination({ ...pagination, pageSize: parseInt(e.target.value) })
        }
    }

    const handleSelectData = () => {
        let selectedRows = table.getSelectedRowModel().rows.map((row: Row<Data>) => row.original)
        if (selectedRows.length > 0) {
            table.resetRowSelection()
        }
        table.getColumn('select')?.toggleVisibility()
    }

    const handleResetFilters = () => {
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
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        if (fields.length > 0 && columnOrder.length === 0) {
            setColumnOrder(['select', ...fields, 'actions'])
        }
    }, [fields])

    return <DataTableContext.Provider value={{
        state: {
            data,
            table,
            columns,
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
        <div className="table-parent h-[92.5svh] lg:h-[90svh] w-[90svw] lg:w-[85svw] mx-auto flex flex-col">
            {children}
        </div>
    </DataTableContext.Provider>
}


DataTable.TopHeader = ({
    children, items, searchable = true }:
    { children?: ReactNode, items: Item[], searchable?: boolean }) => {

    const { state: { data, table, columns, filterData, globalFilter, pagination },
        actions: { setGlobalFilter, setFilterData, handleSelectData } } = useDataTableContext()

    const handleFilterMultipleSelect = (id: string, label: string) => {
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
            const newField: FilterData = {
                id,
                labels: [label],
                order: filterData.length + 1,
                filterType: 'string'
            }

            setFilterData([...filterData, newField])
        }
    }

    const handleFilterSelect = (
        id: string,
        label: string,
        isActive: boolean,
        filterType: FilterType = 'string'
    ) => {
        setFilterData(prev => {
            const existing = prev.find(f => f.id === id)

            if (existing) {
                const currentLabel = existing.labels?.[0]

                if (currentLabel === label) {
                    return prev.filter(f => f.id !== id)
                }

                return prev.map(f =>
                    f.id === id
                        ? {
                            ...f,
                            labels: [label],
                            filterType
                        }
                        : f
                )
            }

            return [
                ...prev,
                {
                    id,
                    order: prev.length + 1,
                    labels: [label],
                    filterType
                }
            ]
        })
    }

    const handleFilterNumber = (e: Number[], id: string) => {
        let [currMin, currMax] = e
        let fieldExist = filterData.find(data => data.id === id)

        if (fieldExist) {
            const mappedRangeData: FilterData[] = filterData.map(data => {
                if (data.id !== id) return data

                const updated: FilterData = {
                    ...data,
                    filterType: 'number',
                    range: {
                        ...data.range,
                        currMin: Number(currMin),
                        currMax: Number(currMax),
                    },
                }

                return updated
            })

            setFilterData(mappedRangeData)
        }
        else {
            const defaultRange = filterItems.find(item => item.id === id)?.range

            const newField: FilterData = {
                id,
                order: filterData.length + 1,
                filterType: 'number',
                range: {
                    min: defaultRange?.min,
                    max: defaultRange?.max,
                    currMin: Number(currMin),
                    currMax: Number(currMax),
                },
            }

            setFilterData([...filterData, newField])
        }
    }

    const handleFilterDate = (e: { from: Date, to: Date } | undefined, id: string) => {
        // ✅ If undefined (cleared), remove the filter
        if (!e || !e.from || !e.to) {
            setFilterData(prev => prev.filter(data => data.id !== id))
            return
        }

        let fieldExist = filterData.find(data => data.id === id)

        let range = {
            from: new Date(e.from),
            to: new Date(e.to)
        }

        if (fieldExist) {
            let mappedRangeData = filterData.map(data => {
                if (data.id === id) {
                    return { ...data, filterType: 'date', range }
                }
                else {
                    return data
                }
            })
            setFilterData(mappedRangeData)
        }
        else {
            setFilterData([...filterData, { id, order: filterData.length + 1, filterType: 'date', range }])
        }
    }

    // In your DataTable.TopHeader component, replace the filterItems generation:

    let filterItems: MenuItem[]
    filterItems = columns
        .filter(column => column.id !== 'select')
        .map(column => {
            // ✅ FIX: Check if this column already has a stored filter with a filterType
            const storedFilter = filterData.find(d => d.id === column.id)

            // ✅ If stored filter exists, use its filterType (this preserves 'date' type)
            let filterType = storedFilter?.filterType || getFilterType(
                table.getCoreRowModel().rows  // ✅ Use getCoreRowModel() not getRowModel()
                    .filter(row => row)
                    .map(row => row.original[column.id as string])
                    .find(label => label !== '')
            )

            let filterItem: MenuItem = {
                id: column.id as string,
                label: column.header as string,
                type: 'filter',
                filterType,
            }

            if (filterType === 'number') {
                let { range } = getFilterData(
                    table.getCoreRowModel().rows.map((row) => row.original[column.id as string]) as []
                )
                const currMin = typeof storedFilter?.range?.currMin === "number"
                    ? storedFilter.range.currMin
                    : range?.min
                const currMax = typeof storedFilter?.range?.currMax === "number"
                    ? storedFilter.range.currMax
                    : range?.max

                filterItem = {
                    ...filterItem,
                    range: {
                        min: range?.min,
                        max: range?.max,
                        currMin: Number(currMin),
                        currMax: Number(currMax),
                    },
                    onCommit: (e: Number[]) => handleFilterNumber(e, column.id as string)
                }
            }

            if (filterType === 'boolean') {
                let { subItems } = getFilterData(
                    table.getCoreRowModel().rows.map((row) => row.original[column.id as string]) as []
                )
                const activeFilter = filterData.find(d => d.id === column.id)
                const activeLabel = activeFilter?.labels?.[0]
                const updatedSubItems = subItems?.map(item => ({
                    ...item,
                    isActive: item.label === activeLabel
                }))

                filterItem = {
                    ...filterItem,
                    subItems: updatedSubItems,
                    onChange: (e: { id: String, label: String, isActive: boolean }) =>
                        handleFilterSelect(String(e.id), String(e.label), Boolean(e.isActive))
                }
            }

            if (filterType === 'date') {
                filterItem = {
                    ...filterItem,
                    range: {
                        from: storedFilter?.range?.from ?? "",
                        to: storedFilter?.range?.to ?? "",
                    },
                    onSelect: (e: { from: Date; to: Date } | undefined) => {
                        if (e?.from && e?.to) {
                            handleFilterDate({ from: e.from, to: e.to }, column.id as string)
                        } else {
                            handleFilterDate(undefined, column.id as string)
                        }
                    },
                }
            }

            if (filterType === 'string') {
                let filterSubItems: MenuSubItem[] = [
                    ...new Map(
                        table.getCoreRowModel().rows.map(row => {
                            const value = String(row.original[column.id as string])
                            return [
                                value,
                                {
                                    id: value,
                                    label: value,
                                    checked: filterData.some(d =>
                                        d.id === column.id && d.labels?.includes(value)
                                    ),
                                    onCheck: () => handleFilterMultipleSelect(column.id as string, value),
                                }
                            ]
                        })
                    ).values()
                ]
                filterItem = {
                    ...filterItem,
                    subItems: filterSubItems
                }
            }

            return filterItem
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

    const actionItemsHeader: MenuItem[] = [
        { id: 'select-data', type: 'action', label: 'Select Data', onClick: () => handleSelectData(table), onlySM: false, icon: ListChecks },
        { id: 'views-data', type: 'filter', label: 'Views', onlySM: false, icon: SlidersVertical, subItems: actionSubItemsHeader },
        { id: 'create-data', type: 'action', label: 'Create Data', onlySM: true },
        { id: 'download-data', type: 'action', label: 'Download Excel', onClick: () => handleDownloadExcel(table, data), onlySM: false, icon: Download }
    ]

    function handleDragEndMenu(event: DragEndEvent) {
        const { active, over } = event;

        if (!over) return;

        if (active.id !== over.id) {
            setFilterData((filterData) => {

                const oldIdx = filterData.findIndex((item) => item.id === active.id);
                const newIdx = filterData.findIndex((item) => item.id === over.id);

                if (oldIdx === -1 || newIdx === -1) return filterData;

                const moved = arrayMove(filterData, oldIdx, newIdx);

                return moved.map((item, index) => ({
                    ...item,
                    order: index + 1
                }));
            });
        }

    }

    return (
        children ? children : <div className={`table-header w-full relative flex justify-between items-center h-18 lg:h-16 shrink-0 px-3.5 lg:px-5`}>
            <div className="flex items-center w-full space-x-2.5">
                {searchable && <div className="flex items-center space-x-2.5">
                    <p className='w-20'>Page No: {pagination.pageIndex + 1}</p>
                    <Input type="text" placeholder={'Search'} value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="h-9 w-48 bg-slate-400! placeholder:text-white focus:bg-slate-500! text-white rounded-lg outline-none! p-2.5" />
                </div>}
                <div className="flex w-full space-x-2.5">
                    {items.filter(item => item.side === 'left').map(item => {
                        let Icon = item.icon;
                        return item.type === 'menu' ?
                            <Dropdown label={item.label || ""} draggable={item.menuType === 'priority'}
                                menuItems={item.menuType === 'action' ? actionItemsHeader :
                                    filterItems}
                                filterData={filterData} handleDragEnd={handleDragEndMenu}
                            >
                                <Button variant={'outline'} className="hidden md:flex bg-slate-400! hover:bg-slate-500! text-white hover:text-white">
                                    {Icon && <Icon />}
                                </Button>
                            </Dropdown> :
                            item.type === 'action' ?
                                <Button variant={'outline'} onClick={item.onClick} className="hidden md:flex bg-slate-400! hover:bg-slate-500! text-white hover:text-white">
                                    {item.label || ''}
                                    {Icon && <Icon />}
                                </Button>
                                : <></>
                    })}
                </div>
                <div className="flex space-x-2.5">
                    {items.filter(item => item.side === 'right').map(item => {
                        let Icon = item.icon;
                        return item.type === 'menu' ?
                            <Dropdown label={item.label || ""} draggable={item.menuType === 'priority'}
                                menuItems={item.menuType === 'action' ? actionItemsHeader : filterItems}
                                filterData={filterData}
                                handleDragEnd={handleDragEndMenu}
                            >
                                <Button variant={'outline'} className="hidden md:flex bg-slate-400! hover:bg-slate-500! text-white hover:text-white">
                                    {Icon && <Icon />}
                                </Button>
                            </Dropdown> :
                            item.type === 'action' ?
                                <Button variant={'outline'} onClick={item.onClick} className="hidden md:flex bg-slate-400! hover:bg-slate-500! text-white hover:text-white">
                                    {item.label || ''}
                                    {Icon && <Icon />}
                                </Button>
                                : <></>
                    })}
                </div>
            </div>
        </div>
    )
}

DataTable.PopUp = ({ children }: { children: ReactNode }) => {
    return { children }
}

const Body = ({ children }: { children?: ReactNode }) => {

    let { state: { table, filterData, sensors }, actions: { handleResetFilters, handleDragEnd } } = useDataTableContext()

    useEffect(() => {
        if (filterData.length > 0) {

            const sorted = [...filterData].sort((a, b) => Number(a.order) - Number(b.order));

            sorted.forEach(data => {
                table.getColumn(data.id)?.setFilterValue((prev: any) => {
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
                    if (data.filterType === "number" && data.range) {
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
        <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToHorizontalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
        >
            <div className="table-wrapper flex-1 flex overflow-auto 
  scrollbar-none -ms-overflow-style-none scroll-hide relative bg-white shadow-lg">
                <Table className="border-collapse h-full w-full">
                    {children}
                </Table>
                {table.getSelectedRowModel().rows.length > 0 && <div className="fixed left-[50%] bottom-30 -translate-x-[50%] z-30 flex bg-white p-2 shadow-lg rounded-lg space-x-2">
                    <Button className="bg-slate-400! hover:bg-slate-500! text-white hover:text-white outline-none h-9 flex items-center" onClick={() => handleResetFilters()} variant="outline">Clear Selection</Button>
                    <Button className="bg-slate-400! hover:bg-slate-500! text-white hover:text-white outline-none h-9 flex items-center" variant="outline">
                        <Download />
                    </Button>
                    <Button className="bg-slate-400! hover:bg-slate-500! text-white hover:text-white outline-none h-9 flex items-center" variant="outline">
                        <Trash />
                    </Button>
                </div>}
            </div>
        </DndContext>
    )
}

DataTable.Body = Body;

Body.Header = () => {
    let { state: { table, columnOrder } } = useDataTableContext();

    return <TableHeader className="bg-white z-10 h-14">
        {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
                <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                >
                    {headerGroup.headers.map(header => (
                        <DraggableTableHeader table={table} key={header.id} header={header} />
                    ))}
                </SortableContext>
            </TableRow>
        ))}
    </TableHeader>
}

Body.Rows = () => {
    const { state: { table, columnOrder } } = useDataTableContext()
    return <TableBody>
        {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                    <SortableContext
                        key={cell.id}
                        items={columnOrder}
                        strategy={horizontalListSortingStrategy}
                    >
                        <DragAlongCell cell={cell} />
                    </SortableContext>
                ))}
            </TableRow>
        ))}
    </TableBody>
}

DataTable.Paginations = ({ extendedPaginations = false }: { extendedPaginations?: Boolean }) => {

    const { state: { table } } = useDataTableContext()

    return <div className="btn-group flex items-center space-x-2.5">
        {extendedPaginations && <Button variant={'outline'} className="h-7 w-7 lg:h-9 lg:w-12 bg-slate-400! focus:ring-0 active:ring-0 hover:bg-slate-500! text-white hover:text-white cursor-pointer outline-none active:outline-none focus:outline-none" disabled={!table.getCanPreviousPage()} onClick={() => table.firstPage()}>
            <ChevronsLeft />
        </Button>}
        <Button variant={'outline'} className="h-7 w-7 lg:h-9 lg:w-12 bg-slate-400! focus:ring-0 active:ring-0 hover:bg-slate-500! text-white hover:text-white cursor-pointer outline-none active:outline-none focus:outline-none" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            <ChevronLeft />
        </Button>
        <Button variant={'outline'} className="h-7 w-7 lg:h-9 lg:w-12 bg-slate-400! focus:ring-0 active:ring-0 hover:bg-slate-500! text-white hover:text-white cursor-pointer outline-none active:outline-none focus:outline-none" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            <ChevronRight />
        </Button>
        {extendedPaginations && <Button variant={'outline'} className="h-7 w-7 lg:h-9 lg:w-12 bg-slate-400! focus:ring-0 active:ring-0 hover:bg-slate-500! text-white hover:text-white cursor-pointer outline-none active:outline-none focus:outline-none" disabled={!table.getCanNextPage()} onClick={() => table.lastPage()}>
            <ChevronsRight />
        </Button>}
    </div>
}

DataTable.PerPage = () => {
    const { state: { pagination }, actions: { handleChange } } = useDataTableContext()

    return <div className="per-page flex flex-col lg:flex-row items-center space-y-1.5 space-x-0 lg:space-y-0 lg:space-x-2.5">
        <span>Per Page: </span>
        <Input value={pagination.pageSize} onChange={handleChange} className="scroll-hide h-7 lg:h-9 w-15 lg:w-20 outline-none bg-slate-400 focus:bg-slate-400 rounded-md text-white px-3" />
    </div>
}

DataTable.Footer = ({ children }: { children: ReactNode }) => {
    return (
        <div className="table-footer flex items-center justify-around lg:justify-evenly h-20 lg:h-16 shrink-0 ">
            {children}
        </div>
    )
}