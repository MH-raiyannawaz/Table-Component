import { useEffect, useState } from 'react'
import './App.css'
import type { Data } from './lib/types'
import { DataTable } from './components/custom/DataTable'
import { Funnel, ArrowUpDown, EllipsisVertical, SlidersVertical, ListChecks, Download, RotateCcw, Trash } from 'lucide-react'
import type { Pagination } from './components/custom/DataTable/types'
import { Button } from './components/ui/button'

const selectionToolbarBtn =
  'bg-slate-400! hover:bg-slate-500! text-white hover:text-white outline-none h-9 flex items-center'

function App() {

  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 10
  })

  const [total, setTotal] = useState(0)

  const [data, setData] = useState<Data[]>([])

  // Rows with multiple emails: expand so non-email columns get rowSpan = emails.length; email column shows one per row
  // Cell values can be primitives or components (Button, Input, etc.)
  // const CUSTOM_DATA: Data[] = [
  //   { id: 1, firstName: 'Alice', lastName: 'Man', age: 28, emails: ['alice@example.com', 'alice.work@example.com', 'alice.other@example.com'], actionBtn: <Button variant="outline" size="sm" onClick={() => alert('Alice')}>Edit</Button>, notesInput: <Input placeholder="Notes for Alice" className="max-w-32" /> },
  //   { id: 2, firstName: 'Bob', lastName: 'Marley', age: 34, emails: ['bob@example.com'], actionBtn: <Button variant="outline" size="sm" onClick={() => alert('Bob')}>Edit</Button>, notesInput: <Input placeholder="Notes for Bob" className="max-w-32" /> },
  //   { id: 3, firstName: 'Carol', lastName: 'Johanson', age: 22, emails: ['carol@example.com', 'carol.backup@example.com'], actionBtn: <Button variant="outline" size="sm" onClick={() => alert('Carol')}>Edit</Button>, notesInput: <Input placeholder="Notes for Carol" className="max-w-32" /> },
  //   { id: 4, firstName: 'David', lastName: 'Moore', age: 45, email: 'david@example.com', actionBtn: <Button variant="outline" size="sm" onClick={() => alert('David')}>Edit</Button>, notesInput: <Input placeholder="Notes for David" className="max-w-32" /> },
  //   { id: 5, firstName: 'Evan', lastName: 'Larry', age: 31, emails: ['eve@example.com'], actionBtn: <Button variant="outline" size="sm" onClick={() => alert('Evan')}>Edit</Button>, notesInput: <Input placeholder="Notes for Evan" className="max-w-32" /> },
  // ]

  const dummyData = [
    { id: 1, name: "User 1", email: "user1@example.com", age: 20 },
    { id: 2, name: "User 2", email: "user2@example.com", age: 21 },
    { id: 3, name: "User 3", email: "user3@example.com", age: 22 },
    { id: 4, name: "User 4", email: "user4@example.com", age: 23 },
    { id: 5, name: "User 5", email: "user5@example.com", age: 24 },
    { id: 6, name: "User 6", email: "user6@example.com", age: 25 },
    { id: 7, name: "User 7", email: "user7@example.com", age: 26 },
    { id: 8, name: "User 8", email: "user8@example.com", age: 27 },
    { id: 9, name: "User 9", email: "user9@example.com", age: 28 },
    { id: 10, name: "User 10", email: "user10@example.com", age: 29 },

    { id: 11, name: "User 11", email: "user11@example.com", age: 20 },
    { id: 12, name: "User 12", email: "user12@example.com", age: 21 },
    { id: 13, name: "User 13", email: "user13@example.com", age: 22 },
    { id: 14, name: "User 14", email: "user14@example.com", age: 23 },
    { id: 15, name: "User 15", email: "user15@example.com", age: 24 },
    { id: 16, name: "User 16", email: "user16@example.com", age: 25 },
    { id: 17, name: "User 17", email: "user17@example.com", age: 26 },
    { id: 18, name: "User 18", email: "user18@example.com", age: 27 },
    { id: 19, name: "User 19", email: "user19@example.com", age: 28 },
    { id: 20, name: "User 20", email: "user20@example.com", age: 29 },

    { id: 21, name: "User 21", email: "user21@example.com", age: 20 },
    { id: 22, name: "User 22", email: "user22@example.com", age: 21 },
    { id: 23, name: "User 23", email: "user23@example.com", age: 22 },
    { id: 24, name: "User 24", email: "user24@example.com", age: 23 },
    { id: 25, name: "User 25", email: "user25@example.com", age: 24 },
    { id: 26, name: "User 26", email: "user26@example.com", age: 25 },
    { id: 27, name: "User 27", email: "user27@example.com", age: 26 },
    { id: 28, name: "User 28", email: "user28@example.com", age: 27 },
    { id: 29, name: "User 29", email: "user29@example.com", age: 28 },
    { id: 30, name: "User 30", email: "user30@example.com", age: 29 },

    { id: 31, name: "User 31", email: "user31@example.com", age: 20 },
    { id: 32, name: "User 32", email: "user32@example.com", age: 21 },
    { id: 33, name: "User 33", email: "user33@example.com", age: 22 },
    { id: 34, name: "User 34", email: "user34@example.com", age: 23 },
    { id: 35, name: "User 35", email: "user35@example.com", age: 24 },
    { id: 36, name: "User 36", email: "user36@example.com", age: 25 },
    { id: 37, name: "User 37", email: "user37@example.com", age: 26 },
    { id: 38, name: "User 38", email: "user38@example.com", age: 27 },
    { id: 39, name: "User 39", email: "user39@example.com", age: 28 },
    { id: 40, name: "User 40", email: "user40@example.com", age: 29 },

    { id: 41, name: "User 41", email: "user41@example.com", age: 20 },
    { id: 42, name: "User 42", email: "user42@example.com", age: 21 },
    { id: 43, name: "User 43", email: "user43@example.com", age: 22 },
    { id: 44, name: "User 44", email: "user44@example.com", age: 23 },
    { id: 45, name: "User 45", email: "user45@example.com", age: 24 },
    { id: 46, name: "User 46", email: "user46@example.com", age: 25 },
    { id: 47, name: "User 47", email: "user47@example.com", age: 26 },
    { id: 48, name: "User 48", email: "user48@example.com", age: 27 },
    { id: 49, name: "User 49", email: "user49@example.com", age: 28 },
    { id: 50, name: "User 50", email: "user50@example.com", age: 29 }
  ];

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
    // const expanded = expandRowsForMultiValue(CUSTOM_DATA, 'emails')
    // setData(expanded)
    // setTotal(expanded.length)
    setData(dummyData)
    setTotal(dummyData.length)
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
          <DataTable.LeftHeader className='justify-start flex-wrap'>
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
            {/* Built-in: one-click reset filters (column filters, search, priority state) */}
            <DataTable.Button
              className='cursor-pointer shrink-0'
              variant='outline'
              id='reset-filters-data'
              type='action'
              builtIn
              label='Reset filters'
              icon={RotateCcw}
            />
            {/* Built-in: dropdown — reset filters only vs full table reset (incl. selection & visibility) */}
          </DataTable.LeftHeader>

          <DataTable.RightHeader className='justify-end flex-wrap'>

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
                { id: 'reset-filters-data', type: 'action', builtIn: true, required: true, label: 'Reset filters', icon: RotateCcw },
                { id: 'download-data', type: 'actions', builtIn: false, required: true, label: 'Download', icon: Download },
              ]}
            />
            <DataTable.Button className='cursor-pointer shrink-0' variant='outline' id='create-data' type='action' label='Create Data' />
          </DataTable.RightHeader>
        </DataTable.TopHeader>
        {/* TOP HEADER */}

        {/* BODY  */}
        <DataTable.Body
          selectionToolbarExtra={({ table }) => (
            <>
              <Button
                type="button"
                variant="secondary"
                className={selectionToolbarBtn}
                onClick={() =>
                  console.log(
                    'Download selection',
                    table.getSelectedRowModel().rows.map((r) => r.original)
                  )
                }
                title="Download"
              >
                <Download />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className={selectionToolbarBtn}
                onClick={() =>
                  console.log(
                    'Delete selection',
                    table.getSelectedRowModel().rows.map((r) => r.original)
                  )
                }
                title="Delete"
              >
                <Trash />
              </Button>
            </>
          )}
        >
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
