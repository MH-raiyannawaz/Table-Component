"use client";

import { Button } from "@/components/ui/button";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import {
    horizontalListSortingStrategy,
    SortableContext,
    useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { GripHorizontal } from "lucide-react";
import type { FilterData } from "../DataTable/types";

function SortableItem({ id }: { id: string }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white rounded cursor-grab shadow flex items-center justify-between px-2 py-1"
        >
            <p className="text-sm">{id}</p>
            <Button variant={'outline'}
                {...attributes}
                {...listeners}
                className="hidden md:flex bg-slate-400! hover:bg-slate-500! text-white hover:text-white">
                <GripHorizontal cursor={'grab'} />
            </Button>
        </div>
    );
}

export default function DragAndDropComponent({ label, filterData, handleDragEnd }: 
    { label: string, filterData: FilterData[], handleDragEnd: (event: DragEndEvent) => void }) {        
    const sensors = useSensors(useSensor(PointerSensor));
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
        >
            <DropdownMenuLabel className="p-2 font-semibold">{label}</DropdownMenuLabel>
            <div className="bg-white p-1.5 w-72 space-y-1.5">
                {filterData.length > 0 ? <SortableContext
                    items={filterData.map(data => data.id)}
                    strategy={horizontalListSortingStrategy}

                >
                    {filterData.map((data) => (
                        <SortableItem key={data.id} id={data.id} />
                    ))}
                </SortableContext> : <p className="text-sm">No filters applied</p>}
            </div>
        </DndContext>
    );
}
