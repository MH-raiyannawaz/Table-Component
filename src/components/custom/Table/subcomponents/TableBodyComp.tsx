   <div className="table-wrapper overflow-auto h-[80%] border-gray-200
                scrollbar-none -ms-overflow-style-none scroll-hide">
        <table className="border-collapse min-h-full">
          <thead className="sticky top-0 bg-white z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    style={{ minWidth: header.getSize() }}
                    className="px-2 h-14 pb-2 border bg-slate-100 text-left"
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
                      <ChevronUpDownIcon cursor={'pointer'} className="h-6"
                        onClick={header.column.getToggleSortingHandler()}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="border px-2 py-1"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>