import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Components/Login/Login";
import Dashboardmain from "./Components/Dashboard Components/Dashboardmain";
import Nopage from "./Components/Error Page/Nopage";
import Dashboard from "./Components/Homepage Components/Dashboard";
import { ToastContainer } from "react-toastify";
import Register from "./Components/Register/Register";
import ViewTimesheets from "./Components/Timesheets/ViewTimesheets";


const App = () => {
  return (
    <>
      <ToastContainer />
      <>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboardmain />} />
            <Route path="/viewtimesheets" element={<ViewTimesheets />} />
            <Route path="*" element={<Nopage />} />
          </Routes>
        </BrowserRouter>
      </>
    </>
  );
};

export default App;