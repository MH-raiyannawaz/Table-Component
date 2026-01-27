import { useSortable } from "@dnd-kit/sortable"
import { getPinnedColumnStyle } from "../utils"
import type { Data } from "@dnd-kit/core"
import type { CSSProperties } from "react"
import { CSS } from "@dnd-kit/utilities"
import { TableCell } from "@/components/ui/table"
import { flexRender, type Cell } from "@tanstack/react-table"

 const DragAlongCell = ({ cell }: { cell: Cell<Data, unknown> }) => {
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
        style={style}
        className={`px-2 py-1`}
      >
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
        {isLastLeftPinned && (
          <div className="absolute top-0 h-full w-full pointer-events-none shadow-pinned" />
        )}
      </TableCell>
    )
  }

  
  export default DragAlongCell