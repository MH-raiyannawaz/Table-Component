import { useEffect, useState } from 'react'
import './App.css'
import { getData } from './lib/utils'
import type { Data } from './lib/types'
import { DataTable } from './components/custom/DataTable'
import { Funnel, ArrowUpDown, EllipsisVertical, SlidersVertical, ListChecks, Download } from 'lucide-react'
import { getMappedData } from './components/custom/DataTable/utils'
import type { Pagination, MenuItem } from './components/custom/DataTable/types'

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
        rowItems={[
          { id: 'copy-id', type: 'action', label: 'Copy ID', onClick: (data?: Data) => { console.log(data) } },
          { id: 'edit-data', type: 'action', label: 'Edit Data', onClick: (data?: Data) => { console.log(data) } },
          { id: 'delete-data', type: 'action', label: 'Delete Data', onClick: (data?: Data) => { console.log(data) } }
        ]}
      >

        {/* TOP HEADER */}
        <DataTable.TopHeader>
          <DataTable.LeftHeader>
            <DataTable.Search />
            <DataTable.Button id='filter-data' type='menu' menuType={'filter'} label='Filter' icon={Funnel} />
            <DataTable.Button id='priority-data' type='menu' menuType={'priority'} label='Priority' icon={ArrowUpDown} />
          </DataTable.LeftHeader>

          <DataTable.RightHeader>
            <DataTable.Button id='action-data' type='menu' menuType={'action'} label='Actions' icon={EllipsisVertical}
              headerItems={[
                { id: 'select-data', type: 'action', custom: true, required: true, label: 'Select Datas', icon: ListChecks },
                { id: 'views-data', type: 'filter', custom: true, required: true, label: 'Views Datas', icon: SlidersVertical },
                { id: 'download-data', type: 'actions', custom: false, label: '', icon: Download }
              ]} />
            <DataTable.Button id='select-data' type='select' selectType='row' label='Select data' icon={ListChecks}/>
            <DataTable.Button id='select-header' type='filter' selectType='header' label='Select Header' icon={SlidersVertical}/>
            <DataTable.Button id='create-data' type='action' label='Create Data' />
          </DataTable.RightHeader>
        </DataTable.TopHeader>
        {/* TOP HEADER */}

        {/* BODY  */}
        <DataTable.Body>
          <DataTable.Header />
          <DataTable.Rows />
        </DataTable.Body>
        {/* BODY  */}

        {/* FOOTER */}
        <DataTable.Footer>
          <DataTable.Paginations />
          <DataTable.PerPage />
        </DataTable.Footer>
        {/* FOOTER */}

      </DataTable>
      {/* DATATABLE */}
    </div>
  )
}

export default App
