import React from 'react'

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Components/Login/Login'
import Dashboardmain from './Components/Dashboard Components/Dashboardmain'


const App = () => {
  return (

    <>

<BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboardmain />} />

        
       
      </Routes>
    </BrowserRouter>
      

    </>
  )
}

export default App