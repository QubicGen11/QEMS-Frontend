import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Components/Login/Login";
import Dashboardmain from "./Components/Dashboard Components/Dashboardmain";
import Nopage from "./Components/Error Page/Nopage";
import Register from "./Components/Register/Register";
import ViewTimesheets from "./Components/Timesheets/ViewTimesheets";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Viewprofile from "./Components/Homepage Components/Viewprofile";
import Holiday from "./Components/Homepage Components/Holiday Components/Holiday";
import { UserProvider } from "./Components/context/UserContext";
import Booktimeoff from "./Components/Timesheets/Booktimeoff";
import { Documents } from "./Components/Earnings Components/Documents Components/Documents";
import Loading from "./Components/Loading Components/Loading";
import Documentsnewone from "./Components/Earnings Components/Documents Components/Documentsnewone";
import Payslips from "./Components/Payslips Components/Payslips";
import Payslipsnewone from "./Components/Payslips Components/payslipsnewone";
import Profile from "./Components/Profile Components/Profile";

const App = () => {
  return (
    <>
      <ToastContainer autoClose={1000} />
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboardmain />} />
            <Route path="/viewtimesheets" element={<ViewTimesheets />} />
            <Route path="*" element={<Nopage />} />
            <Route path="/viewprofile" element={<Viewprofile />} />
            <Route path="/holiday" element={<Holiday />} />
            <Route path="/booktimeoff" element={<Booktimeoff />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/loading" element={<Loading />} />
            <Route path="/documentsnewone" element={<Documentsnewone />} />
            <Route path="/payslips" element={<Payslips />} />
            <Route path="/payslipsnewone" element={<Payslipsnewone />} />
            {/* <Route path="/profile" element={<Profile />} /> */}
            <Route path="/profile/*" element={<Profile />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </>
  );
};

export default App;
