import { useState } from 'react'
import './App.css'
import type { Data } from './lib/types'
import { DataTable } from './components/custom/DataTable'
import { Funnel, ArrowUpDown, EllipsisVertical, SlidersVertical, ListChecks, Download } from 'lucide-react'
import type { DataTableColumnMeta, Pagination } from './components/custom/DataTable/types'

const CUSTOM_DATA: Data[] = [
  { id: 1, firstName: 'Alice', lastName: 'ABC', age: 28, email: 'alice@example.com' },
  { id: 2, firstName: 'Bob', lastName: 'ABC', age: 34, email: 'bob@example.com' },
  { id: 3, firstName: 'Carol', lastName: 'ABC', age: 22, email: 'carol@example.com' },
  { id: 4, firstName: 'David', lastName: 'ABC', age: 45, email: 'david@example.com' },
  { id: 5, firstName: 'Eve', lastName: 'ABC', age: 31, email: 'eve@example.com' },
]

function App() {

  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 1,
    pageSize: 10
  })

  const [data, setData] = useState<Data[]>([])

  const [total, setTotal] = useState(0)

  const loadCustomData = () => {
    setData(CUSTOM_DATA)
    setTotal(CUSTOM_DATA.length)
  }

  // const columnMeta: Record<string, DataTableColumnMeta> = {
  //   email: {
  //     getCellSpan: (row) => {
  //       const r = row.original as any
  //       // if (row.index === 0) return { rowSpan: 1 }
  //       // if (row.index === 1) return { rowSpan: 1 } 
  //       return {}
  //     },
  //   },
  // }

  // const columnMeta: Record<string, DataTableColumnMeta> = {
  //   firstName: {
  //     cell: ({ row }) => {
  //       const { firstName, lastName } = row.original as any
  //       return `${firstName} ${lastName}`
  //     },
  //     cellColSpan: 3,          // this <td> covers firstName + lastName
  //   },
  // }

  const columnMeta: Record<string, DataTableColumnMeta> = {
    id: {
      header: () => 'ID',
      headerColSpan: 1,        // this <th> covers firstName + lastName
    }
    // lastName will be “consumed” by the span above in the header row
  }

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
        columnMeta={columnMeta}
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
            <DataTable.Button variant={'outline'} id='load-custom-data' type='action' label='Load custom data' onClick={loadCustomData} />
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
