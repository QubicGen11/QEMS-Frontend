import React from 'react'
import Header from '../Homepage Components/Header'
import Sidemenu from '../Homepage Components/Sidemenu'
import Footer from '../Homepage Components/Footer'
import CMS_Content from './CMS_Content'

const CMS_Main = () => {
    return (
        <div>
            <div className="wrapper">

                <Header />

                <div className="content-wrapper bg-gray-50 "
                
                >
                    <div className="content-header">
                        <div className="container-fluid ">

                            <CMS_Content/>
                        </div>
                    </div>
                </div>

                <Sidemenu />



                <Footer />




            </div>
        </div>
    )
}

export default CMS_Main
