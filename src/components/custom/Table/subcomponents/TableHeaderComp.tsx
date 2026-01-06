export default function TableHeader() {
    return (
        <div className="table-header relative flex justify-between items-center h-[10%] px-5">
            {columnsSelection && <div className="h-65 w-40 shadow-lg bg-slate-400 z-100 absolute right-5 top-15 rounded-md p-2.5 space-y-2.5 scroll-hide overflow-y-scroll text-white">
                {table.getAllLeafColumns().filter(column => column.id !== 'select').map((column => (
                    <div className="px-1" key={column.id}>
                        <label>
                            <input
                                {...{
                                    type: 'checkbox',
                                    checked: column.getIsVisible(),
                                    onChange: column.getToggleVisibilityHandler()
                                }}
                            />{' '}
                            {column.id.charAt(0).toUpperCase() + column.id.slice(1)}
                        </label>
                    </div>
                )))}
            </div>}
            <div className="flex items-center space-x-2.5">
                <label>Search</label>
                <input type="text" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="h-10 bg-slate-300! focus:bg-slate-400! text-white rounded-lg outline-none! p-2.5" />
                <p className="pr-2.5">Page No: {pagination.pageIndex + 1}</p>
            </div>
            <div className="flex items-center space-x-2.5">
                <button className="h-10 flex items-center bg-slate-400! hover:bg-slate-500! text-white outline-none"
                    onClick={handleSelectData}
                >Select Data</button>
                <button className="h-10 flex items-center bg-slate-400! hover:bg-slate-500! text-white outline-none"
                    onClick={() => setColumnsSelection(!columnsSelection)}
                >Select Field</button>
            </div>
        </div>
    )
}
