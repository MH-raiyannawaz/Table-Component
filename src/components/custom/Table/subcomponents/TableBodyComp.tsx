import { closestCenter, DndContext } from "@dnd-kit/core";
import DraggableTableHeader from "../mincomponents/DraggableTableHeader";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import useAppContext from "@/context/useAppContext";
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table";
import type { Table as T } from "@tanstack/react-table";
import type { Data } from "@/lib/types";
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Download, Trash } from "lucide-react";
import DragAlongCell from "../mincomponents/DraggableAlongCell";

export default function TableBodyComp({table} : {table: T<Data>}) {

  let { state: { sensors, columnOrder }, actions: {handleDragEnd, handleResetFilters} } = useAppContext()

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
          <TableHeader className="bg-white z-10 h-14">
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
          <TableBody>
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
        </Table>
        {table.getSelectedRowModel().rows.length > 0 && <div className="fixed left-[50%] bottom-30 -translate-x-[50%] z-30 flex bg-white p-2 shadow-lg rounded-lg space-x-2">
          <Button className="bg-slate-400! hover:bg-slate-500! text-white hover:text-white outline-none h-9 flex items-center" onClick={() => handleResetFilters(table)} variant="outline">Clear Selection</Button>
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
