import React from 'react'
import Header from '../Header'
import Sidemenu from '../Sidemenu'
import Footer from '../Footer'
import Holidays from './Holidaylist'
import Holidaylist from './Holidaylist'

const Holiday = () => {
  return (
    <>
    <Header/>
    <Sidemenu/>
    <Footer/>

    <div className='content-wrapper'>

        <Holidaylist/>

    </div>
    
    </>

  )
}

export default Holiday