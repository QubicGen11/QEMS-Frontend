import React from 'react'

const Viewleftpart = () => {
  return (
    <>
     <div className="col-md-3" bis_skin_checked={1}>
                                <div className="card card-primary card-outline" bis_skin_checked={1}>
                                    <div className="card-body box-profile" bis_skin_checked={1}>
                                        <div className="text-center" bis_skin_checked={1}>
                                            <img
                                                className="profile-user-img img-fluid img-circle"
                                                src="../../distingg/img/user4-128x128.jpg"
                                                alt="User profile picture"
                                            />
                                        </div>
                                        <h3 className="profile-username text-center">Sajid Hussain</h3>
                                        <p className="text-muted text-center">Web Developer</p>
                                        {/* <ul className="list-group list-group-unbordered mb-3">
                                            <li className="list-group-item">
                                                <b>Followers</b> <a className="float-right">1,322</a>
                                            </li>
                                            <li className="list-group-item">
                                                <b>Following</b> <a className="float-right">543</a>
                                            </li>
                                            <li className="list-group-item">
                                                <b>Friends</b> <a className="float-right">13,287</a>
                                            </li>
                                        </ul>
                                        <a
                                            href="#"
                                            className="btn btn-primary btn-block"
                                            cursorshover="true"
                                        >
                                            <b>Follow</b>
                                        </a> */}
                                    </div>
                                </div>
                                <div className="card card-primary" bis_skin_checked={1}>
                                    <div className="card-header" bis_skin_checked={1}>
                                        <h3 className="card-title">About Me</h3>
                                    </div>
                                    <div className="card-body" bis_skin_checked={1}>
                                        <strong>
                                            <i className="fas fa-book mr-1" /> Education
                                        </strong>
                                        <p className="text-muted">
                                            B.S. in Computer Science from the University of Tennessee at
                                            Knoxville
                                        </p>
                                        <hr />
                                        <strong>
                                            <i className="fas fa-map-marker-alt mr-1" /> Location
                                        </strong>
                                        <p className="text-muted">Malibu, California</p>
                                        <hr />
                                        <strong>
                                            <i className="fas fa-pencil-alt mr-1" /> Skills
                                        </strong>
                                        <p className="text-muted">
                                            <span className="tag tag-danger">UI Design</span>
                                            <span className="tag tag-success">Coding</span>
                                            <span className="tag tag-info">Javascript</span>
                                            <span className="tag tag-warning">PHP</span>
                                            <span className="tag tag-primary">Node.js</span>
                                        </p>
                                        <hr />
                                        <strong>
                                            <i className="far fa-file-alt mr-1" /> Notes
                                        </strong>
                                        <p className="text-muted">
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
                                            fermentum enim neque.
                                        </p>
                                    </div>
                                </div>
                            </div>
    
    </>
  )
}

export default Viewleftpart