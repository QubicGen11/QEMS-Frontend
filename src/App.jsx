import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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
import Allemployees from "./Components/Employee Components/Allemployees";
import Allemployeleaves from "./Components/Leave Components/Allemployeleaves";
import Leavebalance from "./Components/Leave Components/Leavebalance";
import Leavetype from "./Components/Leave Components/Leavetype";
import AllEmployeeAttendance from "./Components/Attendance Components/AllEmployeeAttendance";
import CreateTeamComponent from "./Components/Team Components/CreateTeamComponent";
import EmployeeLeaves from "./Components/Leave Components/EmployeeLeaves";
import SingleEmployeeAttendance from "./Components/Attendance Components/SingleEmployeeAttendance";
import EmployeeProfile from './Components/Employee Components/EmployeeProfile';
import AttendanceSheet from "./Components/Attendance Components/AttendanceSheet";
import TodaysAttendance from "./Components/Attendance Components/TodaysAttendance";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/dashboard",
    element: <Dashboardmain />
  },
  {
    path: "/viewtimesheets",
    element: <ViewTimesheets />,
    loader: async ({ request }) => {
      const url = new URL(request.url);
      const fromDashboard = url.searchParams.get('fromDashboard');
      
      if (fromDashboard) {
        const cachedData = localStorage.getItem('dashboardState');
        if (cachedData) {
          return JSON.parse(cachedData);
        }
      }
      return null;
    }
  },
  {
    path: "*",
    element: <Nopage />
  },
  {
    path: "/viewprofile/*",
    element: <Viewprofile />
  },
  {
    path: "/employeeattendance",
    element: <AllEmployeeAttendance />
  },
  {
    path: "/singleemployeeattendance/:employeeId",
    element: <SingleEmployeeAttendance />
  },
  {
    path: "/createTeam",
    element: <CreateTeamComponent />
  },
  {
    path: "/holiday",
    element: <Holiday />
  },
  {
    path: "/booktimeoff",
    element: <Booktimeoff />
  },
  {
    path: "/documents",
    element: <Documents />
  },
  {
    path: "/loading",
    element: <Loading />
  },
  {
    path: "/documentsnewone",
    element: <Documentsnewone />
  },
  {
    path: "/payslips",
    element: <Payslips />
  },
  {
    path: "/payslipsnewone",
    element: <Payslipsnewone />
  },
  {
    path: "/profile/*",
    element: <Profile />
  },
  {
    path: "/allemployees",
    element: <Allemployees />
  },
  {
    path: "/allemployeleaverequests",
    element: <Allemployeleaves />
  },
  {
    path: "/todaysattendance",
    element: <TodaysAttendance />
  },
  {
    path: "/allemployeleaves",
    element: <EmployeeLeaves />
  },
  {
    path: "/leavebalance",
    element: <Leavebalance />
  },
  {
    path: "/leavetype",
    element: <Leavetype />
  },
  {
    path: "/employee-profile/:email",
    element: <EmployeeProfile />
  },
  {
    path: "/attendancesheet",
    element: <AttendanceSheet />
  }
]);

const App = () => {
  return (
    <>
      <ToastContainer autoClose={1000} />
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </>
  );
};

export default App;