import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Trash2, X, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { DELETE_BOOKING, GET_USER_BOOKING } from "../utils/apis";
import PageHeader from "../components/PageHeader";
import { showError, showSuccess } from "../utils/notify";


function MyBookings() {
  const [bookingsPage, setBookingsPage] = useState(null); // Will hold {content, totalPages, ...}
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const PAGE_SIZE = 5;
  const navigate = useNavigate();
  const bookings = bookingsPage?.content || [];
  const totalPages = bookingsPage?.totalPages || 1;




  const fetchMyBookings = async (currPage = page) => {
    setLoading(true);
    try {
      const res = await axios.get(GET_USER_BOOKING, {
        params: { page: currPage, size: PAGE_SIZE },
        headers: { Authorization: `Bearer ${localStorage.getItem("AuthToken")}` },
      });
      console.log(res.data);
      setBookingsPage(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  function truncateLabel(label) {
    return label && label.length > 40 ? label.slice(0, 37) + "..." : label;
  }



  useEffect(() => {
    fetchMyBookings(page);
  }, [page]);


  const handleDelete = async (id) => {
    try {
      await axios.delete(`${DELETE_BOOKING}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("AuthToken")}` },
      });
      fetchMyBookings(page);
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Failed to delete booking:", err);
      showError("Failed to cancel booking. Please try again.");
    }
  };



  const maskEmail = (email) => {
    const [name, domain] = email.split("@");
    if (name.length <= 1) return `*@${domain}`;
    return `${name[0]}${"*".repeat(name.length - 1)}@${domain}`;
  };


  const maskPhone = (phone) => {
    if (phone.length < 4) return "XXXXXXX0000";
    return `XXXXXX${phone.slice(-4)}`;
  };


  if (loading)
    return <div className="text-center text-gray-500 mt-10">Loading your bookings...</div>;


  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-8 px-4 md:px-10 relative">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="My Ride Requests"
          description="Track what you sent, check approval status, and open booking details from a single clean list."
          onBack={() => navigate(-1)}
        />


        {bookings.length === 0 ? (
          <p className="text-center text-gray-500 text-lg rounded-2xl bg-white p-8 shadow-sm border border-emerald-100">No ride requests sent yet.</p>
        ) : (
          <div className="grid gap-6">
            {bookings.map((bookingRequest) => {
              const { driver, pickup, destination, approved } = bookingRequest;
              const id = bookingRequest.id;
              console.log(id);


              return (
                <div
                  key={id}
                  className="bg-white border border-emerald-100 p-6 rounded-3xl shadow hover:shadow-lg transition relative"
                >
                  {!approved && (
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => setConfirmDeleteId(id)}
                        title="Cancel Booking"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}


                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Driver: {driver.firstName} {driver.lastName}
                      </h3>
                      <p className="text-gray-600">
                        {truncateLabel(pickup.label)} ➝ {truncateLabel(destination.label)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Email: {approved ? driver.email : maskEmail(driver.email)}, Phone:{" "}
                        {approved ? driver.phoneNumber : maskPhone(driver.phoneNumber)}
                      </p>
                    </div>


                    <div className="flex flex-col gap-2">
                      {approved ? (
                        <button
                          className="rounded-full bg-emerald-600 px-5 py-2 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                          onClick={() => (window.location.href = `/my-bookings/${id}`)}
                        >
                          View Ride Details
                        </button>
                      ) : (
                        <button
                          disabled
                          className="rounded-full bg-gray-300 px-5 py-2 text-gray-700 cursor-not-allowed"
                        >
                          Pending Approval
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* pagination */}
        {bookingsPage && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`px-3 py-1 rounded border ${page === i ? "bg-emerald-500 text-white" : "bg-white hover:bg-gray-100"
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}



        {/* Custom Confirmation Modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white w-[90%] max-w-md p-6 rounded-xl shadow-xl relative">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-yellow-500 w-6 h-6" />
                <h3 className="text-xl font-semibold text-gray-800">Confirm Cancellation</h3>
              </div>
              <p className="text-gray-600 mt-2">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDeleteId)}
                  className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                >
                  Yes, Cancel It
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;