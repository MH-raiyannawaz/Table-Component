import React from 'react'

export default function TableFooter() {
    return (
        <div className="table-footer relative flex items-center justify-evenly h-[10%] px-5">
            <div className="btn-group flex items-center space-x-2.5">
                <button className="bg-slate-400! hover:bg-slate-500! text-white cursor-pointer outline-none" disabled={!table.getCanPreviousPage()} onClick={() => table.firstPage()}>
                    <ChevronDoubleLeftIcon className="h-4 w-4" />
                </button>
                <button className="bg-slate-400! hover:bg-slate-500! text-white cursor-pointer outline-none" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
                    <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button className="bg-slate-400! hover:bg-slate-500! text-white cursor-pointer outline-none" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
                    <ChevronRightIcon className="h-4 w-4" />
                </button>
                <button className="bg-slate-400! hover:bg-slate-500! text-white cursor-pointer outline-none" disabled={!table.getCanNextPage()} onClick={() => table.lastPage()}>
                    <ChevronDoubleRightIcon className="h-4 w-4" />
                </button>
            </div>
            <div className="per-page flex items-center space-x-2.5">
                <span>Per Page: </span>
                <input type="number" value={pagination.pageSize} onChange={handleChange} className="scroll-hide h-10 w-20 outline-none bg-slate-400 focus:bg-slate-400 rounded-md text-white px-3" />
                <button className="bg-slate-400! hover:bg-slate-500! text-white outline-none h-10 flex items-center" onClick={handleDownloadExcel}>Download Excel</button>
                <button className="bg-slate-400! hover:bg-slate-500! text-white outline-none h-10 flex items-center" onClick={handleResetFilters}>Reset</button>
            </div>
        </div>
    )
}
