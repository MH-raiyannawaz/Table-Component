import { useEffect, useMemo, useState } from 'react'
import './App.css'
import type { Data } from './lib/types'
import { DataTable, expandRowsForMultiValue } from './components/custom/DataTable'
import { Funnel, ArrowUpDown, EllipsisVertical, SlidersVertical, ListChecks, Download } from 'lucide-react'
import type { Pagination } from './components/custom/DataTable/types'

function App() {

  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 10
  })

  const [total, setTotal] = useState(0)

  const [fullData, setFullData] = useState<Data[]>([])

  // Rows with multiple emails: expand so non-email columns get rowSpan = emails.length; email column shows one per row
  const CUSTOM_DATA: Data[] = [
    { id: 1, firstName: 'Alice', lastName: 'Man', age: 28, emails: ['alice@example.com', 'alice.work@example.com', 'alice.other@example.com'] },
    { id: 2, firstName: 'Bob', lastName: 'Marley', age: 34, emails: ['bob@example.com'] },
    { id: 3, firstName: 'Carol', lastName: 'Johanson', age: 22, emails: ['carol@example.com', 'carol.backup@example.com'] },
    { id: 4, firstName: 'David', lastName: 'Moore', age: 45, email: 'david@example.com' },
    { id: 5, firstName: 'Evan', lastName: 'Larry', age: 31, emails: ['eve@example.com'] },
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
    setFullData(expanded)
    setTotal(expanded.length)
  }, [])

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(total / Math.max(1, pagination.pageSize))),
    [total, pagination.pageSize]
  )

  const data = useMemo(() => {
    const size = Math.max(1, pagination.pageSize)
    const safeIndex = Math.min(Math.max(0, pagination.pageIndex), pageCount - 1)
    const start = safeIndex * size
    return fullData.slice(start, start + size)
  }, [fullData, pagination.pageIndex, pagination.pageSize, pageCount])

  useEffect(() => {
    if (pagination.pageIndex >= pageCount) {
      setPagination((p) => ({ ...p, pageIndex: Math.max(0, pageCount - 1) }))
    }
  }, [pageCount, pagination.pageIndex, setPagination])

  return (
    <div className="h-svh w-svw bg-slate-50 flex justify-center items-center">
      {/* DATATABLE */}
      <DataTable
        data={data}
        setData={setFullData}
        total={total}
        setTotal={setTotal}
        pagination={pagination}
        setPagination={setPagination}
        multiValueColumnId='email'
        className='h-[92.5svh] lg:h-[90svh] w-[90svw] lg:w-[85svw]'
      >
        {/* TOP HEADER */}
        <DataTable.TopHeader>
          <DataTable.LeftHeader className='justify-start'>
            <DataTable.Search className='w-50' />
            <DataTable.Button variant={'outline'} id='filter-data' type='menu' menuType={'filter'} label='Filter' icon={Funnel} />
            <DataTable.Button variant={'outline'} id='priority-data' type='menu' menuType={'priority'} label='Priority' icon={ArrowUpDown} />
          </DataTable.LeftHeader>

          <DataTable.RightHeader className='justify-end'>
            <DataTable.Button variant={'outline'} id='action-data' type='menu' menuType={'action'} label='Actions' icon={EllipsisVertical}
              headerItems={[
                { id: 'select-data', type: 'action', builtIn: true, required: true, label: 'Select Datas', icon: ListChecks },
                { id: 'views-data', type: 'filter', builtIn: true, required: true, label: 'Views Datas', icon: SlidersVertical },
                { id: 'download-data', type: 'actions', builtIn: false, label: 'Download', icon: Download }
              ]} />
            <DataTable.Button variant={'outline'} id='create-data' type='action' label='Create Data' />
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
