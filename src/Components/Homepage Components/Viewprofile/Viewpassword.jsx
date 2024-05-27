import React from 'react'

const Viewpassword = () => {
  return (
    <>

<div
                                                className="tab-pane fade"
                                                id="password-tab-pane"
                                                role="tabpanel"
                                                aria-labelledby="password-tab"
                                                tabIndex={0}
                                                bis_skin_checked={1}
                                            >
                                                <form action="#!">
                                                    <div className="row gy-3 gy-xxl-4" bis_skin_checked={1}>
                                                        <div className="col-12" bis_skin_checked={1}>
                                                            <label htmlFor="currentPassword" className="form-label">
                                                                Current Password
                                                            </label>
                                                            <input
                                                                type="password"
                                                                className="form-control"
                                                                id="currentPassword"
                                                            />
                                                        </div>
                                                        <div className="col-12" bis_skin_checked={1}>
                                                            <label htmlFor="newPassword" className="form-label">
                                                                New Password
                                                            </label>
                                                            <input
                                                                type="password"
                                                                className="form-control"
                                                                id="newPassword"
                                                            />
                                                        </div>
                                                        <div className="col-12" bis_skin_checked={1}>
                                                            <label htmlFor="confirmPassword" className="form-label">
                                                                Confirm Password
                                                            </label>
                                                            <input
                                                                type="password"
                                                                className="form-control"
                                                                id="confirmPassword"
                                                            />
                                                        </div>
                                                        <div className="col-12" bis_skin_checked={1}>
                                                            <button type="submit" className="btn btn-primary">
                                                                Change Password
                                                            </button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
    
    </>
  )
}

export default Viewpassword