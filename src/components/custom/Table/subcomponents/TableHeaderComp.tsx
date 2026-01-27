import { Button } from "@/components/ui/button";
import Dropdown from "../../Dropdown/DropdownComponent";
import { EllipsisVertical, FunnelIcon, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import useAppContext from "@/context/useAppContext";
import type { MenuItem } from "../types";

export default function TableHeaderComp({filterItems, actionItemsHeader}: {filterItems: MenuItem[], actionItemsHeader: MenuItem[]}) {

    const { state:  {globalFilter, pagination}, actions: {setGlobalFilter} } = useAppContext()

    return (
        <div className="table-header w-full relative flex justify-between items-center h-18 lg:h-16 shrink-0 px-3.5 lg:px-5">
            <div className="lg:w-1/3 flex items-center space-x-2.5">
                <Dropdown label="Filter" menuItems={filterItems}>
                    <Button variant={'outline'} className="hidden md:flex bg-slate-400! hover:bg-slate-500! text-white hover:text-white">
                        <FunnelIcon />
                    </Button>
                </Dropdown>
                <Input type="text" placeholder="Search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="h-9 w-1/2 bg-slate-400! placeholder:text-white focus:bg-slate-500! text-white rounded-lg outline-none! p-2.5" />
                <p>Page No: {pagination.pageIndex + 1}</p>
            </div>
            <div className="flex items-center space-x-2.5">
                <Dropdown label="Actions" menuItems={actionItemsHeader}>
                    <Button variant={'outline'} className="hidden md:flex bg-slate-400! hover:bg-slate-500! text-white hover:text-white">
                        <EllipsisVertical />
                    </Button>
                </Dropdown>
                <Button variant={'outline'} className="hidden md:flex bg-slate-400! hover:bg-slate-500! text-white hover:text-white">
                    Create Data
                    <PlusCircle />
                </Button>
                <Button variant={'outline'} className="hidden md:flex bg-slate-400! hover:bg-slate-500! text-white hover:text-white">
                    Apply filter
                </Button>
            </div>
        </div>
    )
}
