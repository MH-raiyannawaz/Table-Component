import { useState } from 'react'
import './App.css'
import TableComponent from './components/custom/Table/TableComponent'
import AppContextState from './context/AppContextState'

function App() {

  let [url, setUrl] = useState('https://dummyjson.com/users')

  return (
    <AppContextState>
      <div className='container-full h-svh w-svw flex items-center justify-center overflow-hidden bg-slate-50'>
        <TableComponent url={url} setUrl={setUrl} />
      </div>
    </AppContextState>
  )
}

export default App
