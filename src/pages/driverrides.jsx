import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Loader2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { DELETE_RIDE_URL, DRIVER_RIDES_URL } from "../utils/apis";
import PageHeader from "../components/PageHeader";
import { showError } from "../utils/notify";

const PAGE_SIZE = 4;

function DriverRides() {
  const [ridesPage, setRidesPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  const fetchRides = async (currPage = page) => {
    setLoading(true);
    try {
      const res = await axios.get(DRIVER_RIDES_URL, {
        params: { page: currPage, size: PAGE_SIZE },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("AuthToken")}`,
        },
      });
      setRidesPage(res.data);
      console.log(res.data.content);
    } catch (err) {
      console.error("Failed to fetch driver rides:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides(page);
    // eslint-disable-next-line
  }, [page]);

  const handleDelete = async (rideId) => {
    try {
      await axios.delete(`${DELETE_RIDE_URL}/${rideId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("AuthToken")}`,
        },
      });
      // Automatically refresh current page
      fetchRides(page); // Or decrement page if last element deleted
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Failed to delete ride:", err);
      showError("Failed to delete ride. Please try again.");
    }
  };

  function truncateLabel(label) {
    return label && label.length > 40 ? label.slice(0, 37) + "..." : label;
  }


  const rides = ridesPage?.content || [];
  const totalPages = ridesPage?.totalPages || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="My Created Rides"
          description="Manage your rides, update routes, and open ride details from the same card layout."
          onBack={() => navigate(-1)}
        />

        {loading ? (
          <div className="flex justify-center items-center mt-20">
            <Loader2 className="animate-spin text-emerald-600 w-10 h-10" />
          </div>
        ) : rides.length === 0 ? (
          <p className="text-center text-gray-500 text-lg rounded-2xl bg-white p-8 shadow-sm border border-emerald-100">You haven’t created any rides yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rides.map((ride) => {
                const from = truncateLabel(ride.route[0]?.location?.label || "Start");
                const to = truncateLabel(ride.route[ride.route.length - 1]?.location?.label || "End");
                const id = ride.id;
                return (
                  <div
                    key={id}
                    className="bg-gradient-to-br from-white to-emerald-50 border border-emerald-100 hover:border-emerald-300 p-5 rounded-3xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 cursor-pointer relative group"
                    onClick={() => navigate(`/ride-details/${id}`)}
                  >
                    {/* Action Buttons */}
                    <div className="absolute top-3 right-4 flex gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); setConfirmDeleteId(id); }}
                        className="text-white bg-red-600 hover:bg-red-700 rounded-full p-1.5 shadow transition-colors"
                        title="Delete Ride"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <span className="rounded-full bg-emerald-100 p-2">
                        <span role="img" aria-label="car" className="text-emerald-600">🚗</span>
                      </span>
                      <h3 className="text-xl font-bold text-emerald-700 tracking-tight flex-1">
                        {from}
                        <span className="mx-2 text-emerald-500 font-extrabold text-2xl align-middle">➝</span>
                        {to}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 border-b pb-2 mb-2">
                      <div>
                        <span className="font-semibold text-gray-800">{ride.availableSeats}/{ride.seatCapacity}</span>
                        <span className="ml-1">seats</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${ride.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                          ride.status === "INACTIVE" || ride.status === "CANCELLED" ? "bg-gray-100 text-gray-600" :
                            "bg-yellow-100 text-yellow-700"
                        }`
                      }>
                        {ride.status}
                      </span>
                    </div>
                    {/* Ride meta or notes (optional) */}
                    <div className="flex justify-end gap-3 pt-3">
                      {ride.status === "OPEN" && (
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/create/${id}`); }}
                          className="rounded-full px-3 py-1 text-blue-600 hover:text-white border border-blue-200 hover:bg-blue-600 transition"
                          title="Update this ride"
                        >
                          Update
                        </button>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/ride-details/${id}`); }}
                        className="rounded-full px-3 py-1 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition"
                        title="View ride details"
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Pagination Controls */}
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

          </>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white w-[90%] max-w-md p-6 rounded-xl shadow-xl relative">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                ✖
              </button>
              <div className="flex items-center gap-3">
                <span className="text-yellow-500 text-xl">⚠️</span>
                <h3 className="text-xl font-semibold text-gray-800">Confirm Deletion</h3>
              </div>
              <p className="text-gray-600 mt-2">
                Are you sure you want to delete this ride? This action cannot be undone.
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
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DriverRides;
