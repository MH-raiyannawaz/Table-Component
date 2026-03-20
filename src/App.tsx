import { useEffect, useState } from 'react'
import './App.css'
import type { Data } from './lib/types'
import { DataTable, expandRowsForMultiValue } from './components/custom/DataTable'
import { Funnel, ArrowUpDown, EllipsisVertical, SlidersVertical, ListChecks, Download } from 'lucide-react'
import type { Pagination } from './components/custom/DataTable/types'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'

function App() {

  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 10
  })

  const [total, setTotal] = useState(0)

  const [data, setData] = useState<Data[]>([])

  // Rows with multiple emails: expand so non-email columns get rowSpan = emails.length; email column shows one per row
  // Cell values can be primitives or components (Button, Input, etc.)
  const CUSTOM_DATA: Data[] = [
    { id: 1, firstName: 'Alice', lastName: 'Man', age: 28, emails: ['alice@example.com', 'alice.work@example.com', 'alice.other@example.com'], actionBtn: <Button variant="outline" size="sm" onClick={() => alert('Alice')}>Edit</Button>, notesInput: <Input placeholder="Notes for Alice" className="max-w-32" /> },
    { id: 2, firstName: 'Bob', lastName: 'Marley', age: 34, emails: ['bob@example.com'], actionBtn: <Button variant="outline" size="sm" onClick={() => alert('Bob')}>Edit</Button>, notesInput: <Input placeholder="Notes for Bob" className="max-w-32" /> },
    { id: 3, firstName: 'Carol', lastName: 'Johanson', age: 22, emails: ['carol@example.com', 'carol.backup@example.com'], actionBtn: <Button variant="outline" size="sm" onClick={() => alert('Carol')}>Edit</Button>, notesInput: <Input placeholder="Notes for Carol" className="max-w-32" /> },
    { id: 4, firstName: 'David', lastName: 'Moore', age: 45, email: 'david@example.com', actionBtn: <Button variant="outline" size="sm" onClick={() => alert('David')}>Edit</Button>, notesInput: <Input placeholder="Notes for David" className="max-w-32" /> },
    { id: 5, firstName: 'Evan', lastName: 'Larry', age: 31, emails: ['eve@example.com'], actionBtn: <Button variant="outline" size="sm" onClick={() => alert('Evan')}>Edit</Button>, notesInput: <Input placeholder="Notes for Evan" className="max-w-32" /> },
  ]

  // const columnMeta: Record<string, DataTableColumnMeta> = {
    // firstName: {
    //   header: () => 'Full name',
    //   headerColSpan: 2,        // this <th> covers firstName + lastName
    // },
    // lastName will be “consumed” by the span above in the header row
  // }

  // const columnMeta: Record<string, DataTableColumnMeta> = {
  //   firstName: {
  //     cell: ({ row }) => {
  //       const { firstName, lastName } = row.original as any
  //       return `${firstName} ${lastName}`
  //     },
  //     cellColSpan: 2,          // this <td> covers firstName + lastName
  //   },
  // }

  useEffect(() => {
    const expanded = expandRowsForMultiValue(CUSTOM_DATA, 'emails')
    setData(expanded)
    setTotal(expanded.length)
  }, [])

  return (
    <div className="h-svh w-svw bg-slate-50 flex justify-center items-center">
      {/* DATATABLE */}
      <DataTable
        data={data}
        setData={setData}
        total={total}
        setTotal={setTotal}
        pagination={pagination}
        setPagination={setPagination}
        multiValueColumnId='email'
        className='h-[92.5svh] lg:h-[90svh] w-[90svw] lg:w-[85svw]'
      >
        {/* TOP HEADER */}
        <DataTable.TopHeader>
          <DataTable.LeftHeader className='justify-start flex-wrap gap-2'>
            <DataTable.Search className='w-50' />
            {/* Built-in menus: customize label/icon via props; behavior is fixed */}
            <DataTable.Button
              className='cursor-pointer shrink-0'
              variant='outline'
              id='filter-data'
              type='menu'
              menuType='filter'
              builtIn
              label='Filter'
              icon={Funnel}
            />
            <DataTable.Button
              className='cursor-pointer shrink-0'
              variant='outline'
              id='priority-data'
              type='menu'
              menuType='priority'
              builtIn
              label='Priority'
              icon={ArrowUpDown}
            />
          </DataTable.LeftHeader>

          <DataTable.RightHeader className='justify-end flex-wrap gap-2'>
            
            <DataTable.Button
              className='cursor-pointer shrink-0'
              variant='outline'
              id='select-data'
              type='action'
              builtIn
              label='Select rows'
              icon={ListChecks}
            />
            <DataTable.Button
              className='cursor-pointer shrink-0'
              variant='outline'
              id='view-data'
              type='action'
              builtIn
              label='Column visibility'
              icon={SlidersVertical}
            />
            
            <DataTable.Button
              className='cursor-pointer shrink-0'
              variant='outline'
              id='action-data'
              type='menu'
              menuType='action'
              label='Actions'
              icon={EllipsisVertical}
              headerItems={[
                { id: 'filter-data', type: 'filter', builtIn: true, required: true, label: 'Filter (in menu)', icon: Funnel },
                { id: 'priority-data', type: 'action', builtIn: true, required: true, label: 'Priority (in menu)', icon: ArrowUpDown },
                { id: 'select-data', type: 'action', builtIn: true, required: true, label: 'Select rows', icon: ListChecks },
                { id: 'view-data', type: 'filter', builtIn: true, required: true, label: 'Column visibility', icon: SlidersVertical },
                { id: 'download-data', type: 'actions', builtIn: false, required: true, label: 'Download', icon: Download },
              ]}
            />
            <DataTable.Button className='cursor-pointer shrink-0' variant='outline' id='create-data' type='action' label='Create Data' />
          </DataTable.RightHeader>
        </DataTable.TopHeader>
        {/* TOP HEADER */}

        {/* BODY  */}
        <DataTable.Body>
          <DataTable.Header className='bg-slate-100 border'
            headerFunctions={{ sortable: true, draggable: true, resizable: true, canPin: true }} />
          <DataTable.Rows
            isRowActions={{
              label: 'Actions',
              headerLabel: 'Actions',
              buttonVariant: 'outline',
              buttonClassName: 'cursor-pointer',
              rowItems: [
                { id: 'copy-id', type: 'action', label: 'Copy ID', onClick: (data?: Data) => { console.log(data) } },
                { id: 'edit-data', type: 'action', label: 'Edit Data', onClick: (data?: Data) => { console.log(data) } },
                { id: 'delete-data', type: 'action', label: 'Delete Data', onClick: (data?: Data) => { console.log(data) } }
              ]
            }}
          />
        </DataTable.Body>
        {/* BODY  */}

        {/* FOOTER */}
        <DataTable.Footer>
          <DataTable.Paginations buttonVariant={'outline'} extendedPaginations={true} />
          <DataTable.PerPage />
        </DataTable.Footer>
        {/* FOOTER */}

      </DataTable>
      {/* DATATABLE */}
    </div>
  )
}

export default App
