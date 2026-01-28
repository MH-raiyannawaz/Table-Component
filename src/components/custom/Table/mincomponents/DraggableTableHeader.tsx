import type { Data } from "@/lib/types"
import { useSortable } from "@dnd-kit/sortable"
import { flexRender, type Header, type Table } from "@tanstack/react-table"
import { getPinnedColumnStyle } from "../utils"
import type { CSSProperties } from "react"
import { CSS } from "@dnd-kit/utilities"
import { ChevronDown, ChevronsUpDown, ChevronUp, GripVertical, PinIcon, PinOff } from "lucide-react"
import { TableHead } from "@/components/ui/table"

const DraggableTableHeader = ({
    table, header,
  }: {
    table: Table<Data>, header: Header<Data, unknown>
  }) => {
    const { attributes, isDragging, listeners, setNodeRef, transform } =
      useSortable({
        id: header.column.id,

      })
    const pinnedLeft = table.getState().columnPinning.left || []
    const isLastLeftPinned =
      pinnedLeft.length > 0 &&
      pinnedLeft[pinnedLeft.length - 1] === header.column.id

    const pinnedRight = table.getState().columnPinning.right || []
    const isLastRightPinned =
      pinnedRight.length > 0 &&
      pinnedRight[pinnedRight.length - 1] === header.column.id

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
        {isLastRightPinned && (
          <div className="absolute top-0 h-full w-full pointer-events-none shadow-pinned-right" />
        )}
      </TableHead>
    )
  }

  export default DraggableTableHeader