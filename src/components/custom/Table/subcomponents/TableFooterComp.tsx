import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import useAppContext from '@/context/useAppContext'
import type { Data } from '@/lib/types'
import type { Table } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export default function TableFooterComp({table}: {table: Table<Data>}) {
    
    let { state: {pagination}, actions: {handleChange} } = useAppContext()

    return (
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
    )
}
