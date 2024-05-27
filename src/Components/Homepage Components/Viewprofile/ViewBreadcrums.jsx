import React from 'react'

const ViewBreadcrums = () => {
  return (
    <>

<section className="content-header" >
                    <div className="container-fluid" bis_skin_checked={1}>
                        <div className="row mb-2" bis_skin_checked={1}>
                            <div className="col-sm-6" bis_skin_checked={1}>
                                <h1>Profile</h1>
                            </div>
                            <div className="col-sm-6" bis_skin_checked={1}>
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item">
                                        <a href="#">Home</a>
                                    </li>
                                    <li className="breadcrumb-item active">User Profile</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </section>
    
    </>
  )
}

export default ViewBreadcrums