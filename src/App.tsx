import { useEffect, useState } from 'react'
import './App.css'
import { getData } from './lib/utils'
import type { Data, Item } from './lib/types'
import { DataTable } from './components/custom/DataTable'
import { Funnel, ArrowUpDown, EllipsisVertical } from 'lucide-react'
import { getMappedData } from './components/custom/DataTable/utils'
import type { Pagination } from './components/custom/DataTable/types'

function App() {
  
  const [ pagination, setPagination ] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 10
  })
  
  const [total, setTotal] = useState(0)
  
  // let url = `https://dummyjson.com/users?skip=${pagination.pageIndex * pagination.pageSize}&limit=${pagination.pageSize}`
  
  let url = `https://jsonplaceholder.typicode.com/todos?_limit=100`

  const [data, setData] = useState<Data[]>([])
  
  const handleData = async (url: string) => {
    let response = await getData(url)
    let mappedData = getMappedData(response)

    if(response.total){
      setTotal(response.total)
    }
    setData(mappedData)
    
  }

  const items: Item[] = [
    { id: 'filter-menu', type: 'menu', menuType: 'filter', side: 'left', label: 'Filter', icon: Funnel },
    { id: 'priority-menu', type: 'menu', menuType: 'priority', side: 'left', label: 'Priority Order', icon: ArrowUpDown },
    { id: 'action-menu', type: 'menu', menuType: 'action', side: 'right', label: 'Actions', icon: EllipsisVertical },
    { id: 'create-data', type: 'action', side: 'right', label: 'Create Data', onClick: () => { } },
  ]
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
        >

        {/* TOP HEADER */}
        <DataTable.TopHeader items={items} />
        {/* TOP HEADER */}

        {/* BODY  */}
        <DataTable.Body>
          <DataTable.Body.Header/>
          <DataTable.Body.Rows />
        </DataTable.Body>
        {/* BODY  */}

        {/* FOOTER */}
        <DataTable.Footer>
          <DataTable.Paginations extendedPaginations={true} />
          <DataTable.PerPage />
        </DataTable.Footer>
        {/* FOOTER */}

      </DataTable>
      {/* DATATABLE */}
    </div>
  )
}

export default App
