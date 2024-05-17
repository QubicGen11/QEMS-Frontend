import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Components/Login/Login'
import Dashboardmain from './Components/Dashboard Components/Dashboardmain'
import Nopage from './Components/Error Page/Nopage';
import ProtectedRoute from './Components/ProtectedRoute';
import Dashboard from './Components/Homepage Components/Dashboard';


const App = () => {
  return (

    <>

<BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboardmain />} />
        <Route path="*" element={<Nopage />} />
        <ProtectedRoute component={Dashboard} />
        
       
      </Routes>
    </BrowserRouter>
      

    </>
  )
}

export default App