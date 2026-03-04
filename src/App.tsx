import { useEffect, useState } from 'react'
import './App.css'
import { getData } from './lib/utils'
import type { Data } from './lib/types'
import { DataTable } from './components/custom/DataTable'
import { Funnel, ArrowUpDown, EllipsisVertical, SlidersVertical, ListChecks, Download } from 'lucide-react'
import { getMappedData } from './components/custom/DataTable/utils'
import type { Pagination } from './components/custom/DataTable/types'

function App() {

  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 1,
    pageSize: 10
  })

  const [total, setTotal] = useState(0)

  let url = `https://dummyjson.com/users?skip=${(pagination.pageIndex - 1) * pagination.pageSize}&limit=${pagination.pageSize}`

  // let url = `https://jsonplaceholder.typicode.com/todos?_limit=100`

  const [data, setData] = useState<Data[]>([])

  const handleData = async (url: string) => {
    let response = await getData(url)
    let mappedData = getMappedData(response.users)

    if (response.total) {
      setTotal(response.total)
    }
    setData(mappedData)
  }

  useEffect(() => {
    handleData(url)
  }, [pagination.pageSize, pagination.pageIndex])

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
        className='h-[92.5svh] lg:h-[90svh] w-[90svw] lg:w-[85svw]'
      >
        {/* TOP HEADER */}
        <DataTable.TopHeader>
          <DataTable.LeftHeader className='justify-start'>
            <DataTable.Search className='w-50'/>
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
          <DataTable.Paginations buttonVariant={'outline'} extendedPaginations={true}/>
          <DataTable.PerPage/>
        </DataTable.Footer>
        {/* FOOTER */}

      </DataTable>
      {/* DATATABLE */}
    </div>
  )
}

export default App
