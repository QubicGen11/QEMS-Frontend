import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <>
   <footer className="main-footer">
  <strong>Copyright © 2023 <Link to="https://qubicgen.com" target='_blank'>QubicGen</Link>.</strong>
  All rights reserved.
  <div className="float-right d-none d-sm-inline-block">
    <b>Version</b> 1v
  </div>
</footer>

    </>
  )
}

export default Footer