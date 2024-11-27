import React, { useEffect, memo } from 'react';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import useTimesheetStore from '../../store/timesheetStore';
import Loading from '../Loading Components/Loading';
import Cookies from 'js-cookie';
import Header from '../Homepage Components/Header';
import Sidemenu from '../Homepage Components/Sidemenu';
import Footer from '../Homepage Components/Footer';

// Add this helper function at the top
const calculateTotalHours = (checkin, checkout) => {
  if (!checkin || !checkout) return '---';
  
  const checkinTime = new Date(checkin);
  const checkoutTime = new Date(checkout);
  
  const diff = checkoutTime - checkinTime;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours < 0 || minutes < 0) return '---';
  return `${hours}h ${minutes}m`;
};

// Add this helper function for 12-hour time format
const format12HourTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Memoized row component
const TimesheetRow = memo(({ timesheet }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      {new Date(timesheet.date).toLocaleDateString()}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      {format12HourTime(timesheet.checkin_Time)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      {format12HourTime(timesheet.checkout_Time)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800`}>
        {calculateTotalHours(timesheet.checkin_Time, timesheet.checkout_Time)}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <StatusBadge status={timesheet.status} />
    </td>
    <td className="px-6 py-4">
      <div className="max-h-20 overflow-y-auto">
        {timesheet.reports ? 
          parse(DOMPurify.sanitize(timesheet.reports, {
            ALLOWED_TAGS: ['p', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'br', 'blockquote', 'img'],
            ALLOWED_ATTR: ['class', 'src', 'alt', 'width', 'height', 'style'],
            ADD_TAGS: ['img'],
            ADD_ATTR: ['src'],
            ADD_URI_SAFE_ATTR: ['src']
          })) 
          : 'No report'
        }
      </div>
    </td>
  </tr>
));

const StatusBadge = memo(({ status }) => {
  const statusClasses = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    declined: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || ''}`}>
      {status}
    </span>
  );
});

const ViewTimesheets = () => {
  const email = Cookies.get('email');
  const { 
    timesheets,
    isLoading,
    error,
    currentPage,
    fetchTimesheets,
    refreshTimesheets,
    setCurrentPage,
    getPaginatedData,
    getTotalPages
  } = useTimesheetStore();

  useEffect(() => {
    if (email) {
      fetchTimesheets(email).catch(err => {
        console.error('Error in component:', err);
        toast.error('Failed to load timesheets');
      });
    }
  }, [email]);

  const handleRefresh = async () => {
    try {
      const refreshToast = toast.loading('Refreshing timesheets...');
      await refreshTimesheets(email);
      toast.update(refreshToast, {
        render: 'Timesheets refreshed!',
        type: 'success',
        isLoading: false,
        autoClose: 2000
      });
    } catch (error) {
      console.error('Refresh error in component:', error);
      toast.error('Failed to refresh timesheets');
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => fetchTimesheets(email)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="content-wrapper">
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0">Timesheets</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item"><a href="#">Home</a></li>
                  <li className="breadcrumb-item active">Timesheets</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <section className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Timesheet Records</h3>
                    <div className="card-tools">
                      <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="btn btn-tool"
                      >
                        <i className="fas fa-sync-alt"></i> Refresh
                      </button>
                    </div>
                  </div>

                  <div className="card-body">
                    {isLoading && timesheets.length === 0 ? (
                      <div className="d-flex justify-content-center p-4">
                        <Loading />
                      </div>
                    ) : (
                      <>
                        <div className="table-responsive">
                          <table className="table table-bordered table-hover">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Total Hours</th>
                                <th>Status</th>
                                <th>Report</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getPaginatedData().map(timesheet => (
                                <TimesheetRow key={timesheet.id} timesheet={timesheet} />
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="row mt-3">
                          <div className="col-sm-12 col-md-5">
                            <div className="dataTables_info">
                              Showing page {currentPage} of {getTotalPages()}
                            </div>
                          </div>
                          <div className="col-sm-12 col-md-7">
                            <div className="dataTables_paginate paging_simple_numbers">
                              <ul className="pagination">
                                <li className={`paginate_button page-item previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                  <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="page-link"
                                  >
                                    Previous
                                  </button>
                                </li>
                                {[...Array(getTotalPages())].map((_, i) => (
                                  <li 
                                    key={i + 1} 
                                    className={`paginate_button page-item ${currentPage === i + 1 ? 'active' : ''}`}
                                  >
                                    <button
                                      onClick={() => handlePageChange(i + 1)}
                                      className="page-link"
                                    >
                                      {i + 1}
                                    </button>
                                  </li>
                                ))}
                                <li className={`paginate_button page-item next ${currentPage === getTotalPages() ? 'disabled' : ''}`}>
                                  <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === getTotalPages()}
                                    className="page-link"
                                  >
                                    Next
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default ViewTimesheets;
