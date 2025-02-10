import React from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
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
import AnonymousSuggestion from "./Components/Homepage Components/AnonymousSuggestion";
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import ForgotPassword from "./Components/Login/ForgotPassword";
import CMS_Main from "./Components/CMS/CMS_Main";

// Add this authentication check function
const requireAuth = () => {
  const email = Cookies.get('email');
 

  if (!email ) {
    Swal.fire({
      title: 'Authentication Required',
      text: 'Please login to access this page',
      icon: 'warning',
      confirmButtonText: 'Go to Login',
      confirmButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = '/';
      }
    });
    return false;
  }
  return true;
};

// Protected Route Component
const ProtectedRoute = ({ element }) => {
  return requireAuth() ? element : <Navigate to="/" />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />
  },
  {
    path: "/qubicgenregistrationpageabcdefghijklmnopqrstuvwxyz",
    element: <Register />
  },
  // Protect all other routes
  {
    path: "/dashboard",
    element: <ProtectedRoute element={<Dashboardmain />} />
  },
  {
    path: "/viewtimesheets",
    element: <ProtectedRoute element={<ViewTimesheets />} />,
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
    element: <ProtectedRoute element={<Viewprofile />} />
  },
  {
    path: "/employeeattendance",
    element: <ProtectedRoute element={<AllEmployeeAttendance />} />
  },
  {
    path: "/singleemployeeattendance/:employeeId",
    element: <ProtectedRoute element={<SingleEmployeeAttendance />} />
  },
  {
    path: "/createTeam",
    element: <ProtectedRoute element={<CreateTeamComponent />} />
  },
  {
    path: "/holiday",
    element: <ProtectedRoute element={<Holiday />} />
  },
  {
    path: "/booktimeoff",
    element: <ProtectedRoute element={<Booktimeoff />} />
  },
  {
    path: "/documents",
    element: <ProtectedRoute element={<Documents />} />
  },
  {
    path: "/loading",
    element: <Loading />
  },
  {
    path: "/documentsnewone",
    element: <ProtectedRoute element={<Documentsnewone />} />
  },
  {
    path: "/payslips",
    element: <ProtectedRoute element={<Payslips />} />
  },
  {
    path: "/payslipsnewone",
    element: <ProtectedRoute element={<Payslipsnewone />} />
  },
  {
    path: "/profile/*",
    element: <ProtectedRoute element={<Profile />} />
  },
  {
    path: "/allemployees",
    element: <ProtectedRoute element={<Allemployees />} />
  },
  {
    path: "/allemployeleaverequests",
    element: <ProtectedRoute element={<Allemployeleaves />} />
  },
  {
    path: "/todaysattendance",
    element: <ProtectedRoute element={<TodaysAttendance />} />
  },
  {
    path: "/allemployeleaves",
    element: <ProtectedRoute element={<EmployeeLeaves />} />
  },
  {
    path: "/leavebalance",
    element: <ProtectedRoute element={<Leavebalance />} />
  },
  {
    path: "/leavetype",
    element: <ProtectedRoute element={<Leavetype />} />
  },
  {
    path: "/employee-profile/:email",
    element: <ProtectedRoute element={<EmployeeProfile />} />
  },
  {
    path: "/attendancesheet",
    element: <ProtectedRoute element={<AttendanceSheet />} />
  },
  {
    path: "/anonymous-suggestion",
    element: <ProtectedRoute element={<AnonymousSuggestion />} />
  },
  {
    path: "/cms",
    element: <ProtectedRoute element={<CMS_Main />} />
  },

]);

const App = () => {
  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
        enableMultiContainer={false}
        containerId="default"
      />
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>

      
    </div>
  );
};

export default App;