import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import type { Cell } from "@tanstack/react-table"
import type { ReactNode } from "react"

type DataEvent = {
    label: string,
    onClick?: (id: string) => void
}

type TableRow = Record<string, unknown>

export default function ContextMenuComp({ children, dataEvents, cell }: { children: ReactNode, dataEvents: DataEvent[], cell: Cell<TableRow, unknown>}) {
    return (
        <ContextMenu key={cell.row.id}>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                {dataEvents.map(dataEvent => (
                    <ContextMenuItem onClick={()=>dataEvent.onClick?.(cell.row.id)}>{dataEvent.label}</ContextMenuItem>
                ))}
            </ContextMenuContent>
        </ContextMenu>
    )
}
