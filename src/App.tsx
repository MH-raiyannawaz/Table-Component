import { useState } from 'react'
import './App.css'
import TableComponent from './components/custom/Table/TableComponent'

function App() {

  let [url, setUrl] = useState('https://dummyjson.com/users')

  return (
    <div className='container-full h-svh w-svw flex items-center justify-center overflow-hidden bg-slate-50'>
      {/* <div>
        <DataTable url={url} setUrl={setUrl} />
      </div> */}

      <div>
        <TableComponent url={url} setUrl={setUrl} />
      </div>
    </div>
  )
}

export default App
