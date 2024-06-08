import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Sender from './components/Sender'
import Receiver from './components/Receiver'



const App = () => {
  return (
    <>
          <Routes>
            <Route path='/' element={<h1>One side call</h1>}/>
            <Route path='/sender' element={<Sender/>}/>
            <Route path='/receiver' element={<Receiver/>}/>
          </Routes>
    </>
  )
}

export default App