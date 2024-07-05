import React from 'react'
import Header from '../Homepage Components/Header'
import Sidemenu from '../Homepage Components/Sidemenu'
import Footer from '../Homepage Components/Footer'
import Dashboard from '../Homepage Components/Dashboard'
import Cookies from 'js-cookie';


const Dashboardmain = () => {
    const companyEmail = Cookies.get('email'); 
    return (
        <div className="wrapper">

            <Header />

            <Sidemenu />

            <Dashboard />

            <Footer />




        </div>)
}

export default Dashboardmain