import './datatable.css'
import React, { createContext, useContext, useEffect, type CSSProperties } from "react";
import { useMemo, useState, type ReactNode } from "react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type Cell, type ColumnDef, type ColumnPinningState, type Header, type Row, type SortingState, type Table as TableT, type VisibilityState } from "@tanstack/react-table";
import { type FilterData, type HeaderFunctionType, type Pagination, type TopHeaderChildProps } from "./types.ts";
import { arrayMove, horizontalListSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import type { Data, StateSetter, MenuItem, MenuSubItem, DataTableContextType, RowActionType, ButtonProps } from "./types.ts";
import IndeterminateCheckbox from "../../custom/IndeterminateCheckbox/IndeterminateCheckbox.tsx";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronsUpDown, ChevronUp, Download, EllipsisVertical, GripVertical, ListChecks, PinIcon, PinOff, SlidersVertical, Star, Trash } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import Dropdown from "../Dropdown/Dropdown.tsx";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { CSS } from '@dnd-kit/utilities';
import { getFilterData, getFilterType, getPinnedColumnStyle } from './utils.ts';
import type { Item } from '@/lib/types.ts';
import type { DataTableColumnMeta } from './types.ts';

const MIN_COL_WIDTH = 200;

const DataTableContext = createContext<DataTableContextType | null>(null)

export const useDataTableContext = () => {
    const ctx = useContext(DataTableContext)
    if (!ctx) throw new Error("useAppContext must be used inside AppProvider")
    return ctx
}

const DragAlongCell = ({
    cell,
    className,
    colSpan = 1,
    rowSpan = 1,
}: {
    cell: Cell<Data, unknown>;
    className?: string;
    colSpan?: number;
    rowSpan?: number;
}) => {
    const { isDragging, setNodeRef, transform } = useSortable({
        id: cell.column.id,
    })

    const pinnedStyle = getPinnedColumnStyle(cell.column, 'row')
    const isPinnedLeft = cell.column.getIsPinned?.() === "left"
    const nextCol = cell.row.getVisibleCells()[cell.row.getVisibleCells().indexOf(cell) + 1]?.column
    const nextIsPinnedLeft = nextCol?.getIsPinned?.() === "left"
    const isLastLeftPinned = isPinnedLeft && !nextIsPinnedLeft

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
            colSpan={colSpan}
            rowSpan={rowSpan}
            style={style}
            className={`px-2 py-1 ${className}`}
        >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
            {isLastLeftPinned && (
                <div className="absolute top-0 h-full w-full pointer-events-none shadow-pinned-left" />
            )}
        </TableCell>
    )
}

const DraggableTableHeader = ({
    table, header, className, colSpan = 1, rowSpan = 1
}: {
    table: TableT<Data>, header: Header<Data, unknown>, className: string, colSpan?: number, rowSpan?: number
}) => {
    const { attributes, isDragging, listeners, setNodeRef, transform } =
        useSortable({
            id: header.column.id,

        })

    const { state: { headerFunctions } } = useDataTableContext()
    let { sortable, draggable, resizable, canPin } = headerFunctions

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
            colSpan={colSpan}
            rowSpan={rowSpan}
            style={{ minWidth: header.getSize(), ...style }}
            className={`px-2 pb-2 text-left ${className}`}
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
                    {sortable && header.column.id !== 'select' && header.column.id !== 'actions' &&
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
                    {canPin && header.column.id !== 'select' && header.column.id !== 'actions' && <span>
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
                    {draggable && header.column.id !== 'select' && header.column.id !== 'actions' &&
                        <span>
                            <GripVertical cursor={'grab'} {...listeners} {...attributes} />
                        </span>
                    }
                    {resizable && header.column.getCanResize() && (
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

export const DataTable = ({ children, className, data, total,
     setTotal, pagination, setPagination, columnMeta, multiValueColumnId = 'email' }:
    {
        children: ReactNode, className: string, data: Data[], setData: StateSetter<Data[]>,
        pagination?: Pagination, setPagination?: StateSetter<Pagination>,
        total?: number, setTotal?: StateSetter<number>,
        /** Per-column meta for header/cell rowSpan and colSpan (key = column id) */
        columnMeta?: Record<string, DataTableColumnMeta>,
        /** Column id that has one value per physical row when rows are expanded for multi-value (e.g. emails). Others get rowSpan. */
        multiValueColumnId?: string
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

    const [isRowActions, setIsRowActions] = useState<RowActionType | null>(null)

    const [headerFunctions, setHeaderFunctions] = useState<HeaderFunctionType>({
        canPin: false,
        resizable: false,
        sortable: false,
        draggable: false,
    })

    const fields = useMemo(() => data.length > 0
        ? Object.keys(data[0]).filter((k) => !String(k).startsWith('__'))
        : [], [data])

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
                            isHeader: true,
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
            ...fields.map(field => ({
                    id: field,
                    accessorKey: field,
                    filterFn: (row: Row<Data>, id: string, value: any) => {
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
                            const d = new Date(cellValue as string | number | Date)
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
                    header: columnMeta?.[field]?.header ?? (field.charAt(0).toUpperCase() + field.slice(1)),
                    cell: columnMeta?.[field]?.cell ?? (({ getValue }) => getValue() ?? null),
                    size: columnSizes[field] || MIN_COL_WIDTH,
                    minSize: 100,
                    maxSize: 400,
                    enablePinning: true,
                    ...(columnMeta?.[field] && { meta: columnMeta[field] }),
                }
            )),
            ...(isRowActions ? [{
                id: 'actions',
                header: isRowActions.headerLabel || 'Actions',
                cell: ({ row }) => {
                    let { label } = isRowActions
                    return <div className="text-center">
                        <Dropdown label={label || 'Actions'} menuItems={isRowActions?.rowItems} data={row.original}>
                            <Button className={isRowActions.buttonClassName} variant={isRowActions.buttonVariant} size="icon">
                                <EllipsisVertical />
                            </Button>
                        </Dropdown>
                    </div>
                },
                size: 64,
                enablePinning: true,
            }] : [])
        ],
        [fields, columnSizes, columnMeta]
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
        pageCount: Math.max(1, Math.ceil((total ?? 0) / Math.max(1, pagination?.pageSize ?? 10))),
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
        if (setPagination && pagination) {
            const nextSize = parseInt(e.target.value, 10)
            if (!isNaN(nextSize) && nextSize >= 1) {
                setPagination({ ...pagination, pageSize: nextSize, pageIndex: 0 })
            }
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
        if (setPagination) {
            setPagination({ pageIndex: 0, pageSize: 10 })
        }
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
            headerFunctions,
            multiValueColumnId,
            isRowActions,
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
            setIsRowActions,
            setColumnVisibility,
            setColumnPinning,
            setRowSelection,
            setColumnOrder,
            setHeaderFunctions,
            setColumnSizing,
            handleChange,
            handleSelectData,
            handleResetFilters,
            handleDragEnd,
            handleDragEndMenu,
            setFilterData
        },
    }}>
        <div className={`table-parent ${className} mx-auto flex flex-col`}>
            {children}
        </div>
    </DataTableContext.Provider>
}

DataTable.TopHeader = ({ children, className }: { children?: React.ReactNode, className?: string }) => {

    const { state: { table, columns, filterData },
        actions: { setFilterData, handleSelectData } } = useDataTableContext()

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

    const handleFilterSelect = (selectedId: string, columnId: string) => {
        setFilterData(prev => {
            const existing = prev.find(f => f.id === columnId)

            if (existing) {
                // Update existing filter - replace with new single value
                return prev.map(f =>
                    f.id === columnId
                        ? { ...f, labels: [selectedId] }
                        : f
                )
            } else {
                // Add new filter with order property
                return [...prev, {
                    id: columnId,
                    labels: [selectedId],
                    order: prev.length // or use whatever order logic you have
                }]
            }
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
                    return { ...data, filterType: 'date' as const, range }
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

    let filterItems: MenuItem[]
    filterItems = columns
        .filter(column => column.id !== 'select')
        .map(column => {
            const storedFilter = filterData.find(d => d.id === column.id)

            let filterType = storedFilter?.filterType || getFilterType(
                table.getCoreRowModel().rows
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

                const booleanSubItems = subItems?.map(item => ({
                    ...item,
                    checked: storedFilter?.labels?.includes(item.id as string) || false
                }))

                filterItem = {
                    ...filterItem,
                    subItems: booleanSubItems,
                    onChange: (id: string) => {
                        handleFilterSelect(id, column.id as string)
                    }
                }
            }

            if (filterType === 'date') {
                filterItem = {
                    ...filterItem,
                    range: {
                        from: storedFilter?.range?.from,
                        to: storedFilter?.range?.to,
                    },
                    onSelect: (e?: { from: Date; to: Date } | undefined) => {
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
        { id: 'select-data', type: 'action', label: 'Select Data', onClick: handleSelectData, icon: ListChecks },
        { id: 'views-data', type: 'filter', label: 'Views Data', icon: SlidersVertical, subItems: actionSubItemsHeader || null },
    ]

    return (
        <div className={`${className} table-header w-full relative flex justify-between items-center h-18 lg:h-16 shrink-0 px-3.5 lg:px-5`}>
            <div className="flex items-center w-full space-x-2.5">
                {React.Children.map(children, (child) => {
                    if (React.isValidElement<TopHeaderChildProps>(child)) {
                        return React.cloneElement(child, {
                            filterItems,
                            actionItemsHeader,
                            actionSubItemsHeader
                        });
                    }
                    return child;
                })}
            </div>
        </div>
    )
}

DataTable.LeftHeader = ({ className, children, filterItems, actionItemsHeader, actionSubItemsHeader }: TopHeaderChildProps & { children: React.ReactNode, className?: string }) => {
    return <div className={`flex w-full space-x-2.5 ${className}`}>
        {React.Children.map(children, (child) => {
            if (React.isValidElement<TopHeaderChildProps>(child)) {
                return React.cloneElement(child, {
                    filterItems,
                    actionItemsHeader,
                    actionSubItemsHeader
                });
            }
            return child;
        })}
    </div >
}

DataTable.RightHeader = ({ children, className, filterItems, actionItemsHeader, actionSubItemsHeader }: TopHeaderChildProps & { children: React.ReactNode, className?: string }) => {
    return <div className={`${className} flex w-full space-x-2.5`}>
        {React.Children.map(children, (child) => {
            if (React.isValidElement<TopHeaderChildProps>(child)) {
                return React.cloneElement(child, {
                    filterItems,
                    actionItemsHeader,
                    actionSubItemsHeader
                });
            }
            return child;
        })}
    </div >
}

DataTable.Search = ({className}:{className?: string}) => {
    const { state: { globalFilter }, actions: { setGlobalFilter } } = useDataTableContext()
    return <Input type="text" placeholder={'Search'} value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className={className} />
}

DataTable.Button = ({ className, variant, label, type, menuType, icon, onClick, actionItemsHeader, headerItems, filterItems }: 
    Item & { headerItems?: MenuItem[], className?: string, variant?: ButtonProps["variant"] } & TopHeaderChildProps) => {

    const { state: { filterData }, actions: { handleDragEndMenu } } = useDataTableContext()

    const Icon = icon

    if (type === 'menu') {

        if (menuType === 'priority') {
            return <Dropdown
                label={label || ""}
                draggable={true}
                filterData={filterData}
                handleDragEnd={handleDragEndMenu}
            >
                <Button variant={variant} className={className}>
                    {Icon && <Icon />}
                </Button>
            </Dropdown>
        }

        if (menuType === 'filter') {
            return (
                <Dropdown
                    label={label || ""}
                    menuItems={filterItems}
                >
                    <Button variant={variant} className={className}>
                        {Icon && <Icon />}
                    </Button>
                </Dropdown>
            )
        }

        if (menuType === 'action') {
            const combinedArray: MenuItem[] = [
                // Step 1: Update existing items
                ...actionItemsHeader.map(itemOne => {
                    const updatedItem = headerItems?.find(itemTwo => itemTwo.id === itemOne.id);

                    return {
                        ...itemOne,
                        ...updatedItem, // override existing keys
                    };
                }),

                // Step 2: Add new items that don't exist in actionItemsHeader
                ...(headerItems?.filter(
                    itemTwo => !actionItemsHeader.some(itemOne => itemOne.id === itemTwo.id)
                ) || [])
            ];

            return (
                <Dropdown
                    label={label || ""}
                    menuItems={combinedArray?.filter(comArr => comArr.required !== false)}
                >
                    <Button variant={variant} className={`${className} cursor-pointer `}>
                        {Icon && <Icon />}
                    </Button>
                </Dropdown>
            )
        }

    }

    // if (type === 'select') {
    //     if (selectType === 'row') {
    //         return (
    //             <Button
    //                 
    //                 onClick={handleSelectData}
    //                 className="hidden md:flex bg-slate-400! hover:bg-slate-500! text-white"
    //             >
    //                 {label}
    //                 {Icon && <Icon />}
    //             </Button>
    //         )
    //     }
    //      if (selectType === 'header') {
    //         return (
    //             <Dropdown
    //                 label={label || ""}
    //                 select={true}
    //                 menuItems={actionSubItemsHeader}
    //             >
    //                 <Button className="hidden md:flex bg-slate-400! hover:bg-slate-500! text-white">
    //                     {Icon && <Icon />}
    //                 </Button>
    //             </Dropdown>
    //         )
    //     }
    // }

    if (type === 'action') {
        return (
            <Button
                variant={variant} 
                onClick={onClick}
                className={className}
            >
                {label}
                {Icon && <Icon />}
            </Button>
        )
    }

    return null
}

DataTable.Body = ({ children, className }: { children?: ReactNode, className?: string }) => {

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
        console.log(filterData)
    }, [filterData])

    return (
        <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToHorizontalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
        >
            <div className={`table-wrapper flex-1 flex overflow-auto 
  scrollbar-none -ms-overflow-style-none scroll-hide relative bg-white shadow-lg ${className}`}>
                <Table className="border-collapse h-full w-full">
                    {children}
                </Table>
                {table.getSelectedRowModel().rows.length > 0 && <div className="fixed left-[50%] bottom-30 -translate-x-[50%] z-30 flex bg-white p-2 shadow-lg rounded-lg space-x-2">
                    <Button className="bg-slate-400! hover:bg-slate-500! text-white hover:text-white outline-none h-9 flex items-center" onClick={() => handleResetFilters()} >Clear Selection</Button>
                    <Button className="bg-slate-400! hover:bg-slate-500! text-white hover:text-white outline-none h-9 flex items-center" >
                        <Download />
                    </Button>
                    <Button className="bg-slate-400! hover:bg-slate-500! text-white hover:text-white outline-none h-9 flex items-center" >
                        <Trash />
                    </Button>
                </div>}
            </div>
        </DndContext>
    )
}

DataTable.Header = ({ headerFunctions, className }: { headerFunctions: HeaderFunctionType, className?: string }) => {
    let { state: { table, columnOrder }, actions: { setHeaderFunctions } } = useDataTableContext();

    useEffect(() => {
        setHeaderFunctions(headerFunctions)
    }, [])

    return <TableHeader className={`z-10 h-14`}>
        {table.getHeaderGroups().map(headerGroup => {
            const headers: React.ReactNode[] = [];
            let i = 0;
            while (i < headerGroup.headers.length) {
                const header = headerGroup.headers[i];
                const meta = header.column.columnDef.meta as DataTableColumnMeta | undefined;
                const headerColSpan = meta?.headerColSpan ?? 1;
                const headerRowSpan = meta?.headerRowSpan ?? 1;
                headers.push(
                    <DraggableTableHeader
                        key={header.id}
                        className={className || ''}
                        table={table}
                        header={header}
                        colSpan={headerColSpan}
                        rowSpan={headerRowSpan}
                    />
                );
                i += headerColSpan;
            }
            return (
                <TableRow key={headerGroup.id}>
                    <SortableContext
                        items={columnOrder}
                        strategy={horizontalListSortingStrategy}
                    >
                        {headers}
                    </SortableContext>
                </TableRow>
            );
        })}
    </TableHeader>
}

DataTable.Rows = ({ isRowActions, className }: { isRowActions?: RowActionType, className?: string }) => {
    const { state: { table, columnOrder, multiValueColumnId = 'email' }, actions: { setIsRowActions } } = useDataTableContext()

    useEffect(() => {
        if (isRowActions) {
            setIsRowActions(isRowActions)
        }
    }, [])

    return (
        <TableBody>
            {table.getRowModel().rows.map(row => {
                const cells: React.ReactNode[] = [];
                const visibleCells = row.getVisibleCells();
                const raw = row.original as Record<string, unknown>;
                const groupSize = raw.__groupSize__ as number | undefined;
                const physicalIndex = raw.__physicalIndex__ as number | undefined;
                const useMultiValueRowSpan = groupSize != null && physicalIndex != null;

                let i = 0;
                while (i < visibleCells.length) {
                    const cell = visibleCells[i];
                    const meta = cell.column.columnDef.meta as DataTableColumnMeta | undefined;
                    let colSpan = meta?.cellColSpan ?? 1;
                    let rowSpan = meta?.cellRowSpan ?? 1;
                    if (meta?.getCellSpan) {
                        const span = meta.getCellSpan(row);
                        if (span.colSpan != null) colSpan = span.colSpan;
                        if (span.rowSpan != null) rowSpan = span.rowSpan;
                    } else if (useMultiValueRowSpan && cell.column.id !== multiValueColumnId) {
                        rowSpan = physicalIndex === 0 ? groupSize : 0;
                    }
                    if (rowSpan === 0) {
                        i += 1;
                        continue;
                    }
                    cells.push(
                        <SortableContext
                            key={cell.id}
                            items={columnOrder}
                            strategy={horizontalListSortingStrategy}
                        >
                            <DragAlongCell
                                className={className}
                                cell={cell}
                                colSpan={colSpan}
                                rowSpan={rowSpan}
                            />
                        </SortableContext>
                    );
                    i += colSpan;
                }
                return (
                    <TableRow key={row.id}>
                        {cells}
                    </TableRow>
                );
            })}
        </TableBody>
    );
}

DataTable.Paginations = ({ extendedPaginations = false, className, buttonClassName, buttonVariant, maxVisiblePages = 5, showRowRange = true }:
    { extendedPaginations?: boolean; className?: string; buttonClassName?: string; buttonVariant?: ButtonProps["variant"]; maxVisiblePages?: number; showRowRange?: boolean }) => {

    const { state: { table, total, pagination }, actions: { setPagination } } = useDataTableContext()

    const pageSize = Math.max(1, pagination?.pageSize ?? 10)
    const totalRows = total ?? 0
    const pageCount = totalRows > 0 ? Math.ceil(totalRows / pageSize) : 1
    const currentPage = Math.min(pagination?.pageIndex ?? 0, pageCount - 1)
    const startRow = totalRows === 0 ? 0 : currentPage * pageSize + 1
    const endRow = Math.min((currentPage + 1) * pageSize, totalRows)

    const visiblePageIndices: number[] = (() => {
        if (pageCount <= maxVisiblePages) {
            return Array.from({ length: pageCount }, (_, i) => i)
        }
        const half = Math.floor(maxVisiblePages / 2)
        let start = Math.max(0, currentPage - half)
        let end = Math.min(pageCount, start + maxVisiblePages)
        if (end - start < maxVisiblePages) start = Math.max(0, end - maxVisiblePages)
        return Array.from({ length: end - start }, (_, i) => start + i)
    })()

    return (
        <div className={`flex flex-wrap items-center gap-3 ${className}`}>
            {showRowRange && (
                <span className="text-muted-foreground text-sm whitespace-nowrap">
                    {totalRows === 0 ? '0 rows' : `${startRow}–${endRow} of ${totalRows}`}
                </span>
            )}
            <div className="flex items-center gap-1.5">
            {extendedPaginations && (
                <Button variant={buttonVariant} disabled={!table.getCanPreviousPage()} onClick={() => table.firstPage()} size="icon" className={buttonClassName}>
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
            )}
            <Button variant={buttonVariant} disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()} size="icon" className={buttonClassName}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            {visiblePageIndices.map((pageIndex) => (
                <Button
                    key={pageIndex}
                    variant={buttonVariant}
                    size="sm"
                    disabled={currentPage === pageIndex}
                    onClick={() => setPagination?.({ ...pagination!, pageIndex })}
                >
                    {pageIndex + 1}
                </Button>
            ))}
            <Button variant={buttonVariant} disabled={!table.getCanNextPage()} onClick={() => table.nextPage()} size="icon" className={buttonClassName}>
                <ChevronRight className="h-4 w-4" />
            </Button>
            {extendedPaginations && (
                <Button variant={buttonVariant} disabled={!table.getCanNextPage()} onClick={() => table.lastPage()} size="icon" className={buttonClassName}>
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            )}
            </div>
        </div>
    )
}

DataTable.PerPage = ({className}:{className?: string}) => {
    const { state: { pagination }, actions: { handleChange } } = useDataTableContext()

    return <div className={`${className} per-page flex flex-col lg:flex-row items-center space-y-1.5 space-x-0 lg:space-y-0 lg:space-x-2.5`}>
        <span>Per Page: </span>
        <Input value={pagination?.pageSize} onChange={handleChange} className="scroll-hide h-7 lg:h-9 w-15 lg:w-20" />
    </div>
}

DataTable.Footer = ({ children, className }: { children: ReactNode, className?: string }) => {
    return (
        <div className={`${className} table-footer flex items-center justify-around lg:justify-evenly h-20 lg:h-16 shrink-0`}>
            {children}
        </div>
    )
}