import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BOOKING_URL, GET_DRIVER_BOOKING } from "../utils/apis";
import PageHeader from "../components/PageHeader";
import { showError, showSuccess } from "../utils/notify";

function IncomingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(GET_DRIVER_BOOKING, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("AuthToken")}`,
          },
        });
        setRequests(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("Failed to fetch requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (bookingId) => {
    try {
      await axios.post(`${BOOKING_URL}/${bookingId}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("AuthToken")}`,
        },
      });
      showSuccess("Request approved.");
      setRequests((prev) =>
        prev.map((req) =>
          req.id === bookingId
            ? { ...req, approved: true }
            : req
        )
      );
    } catch (err) {
      console.error("Error approving request:", err);
      showError("Failed to approve the request.");
    }
  };

  if (loading)
    return <div className="text-center text-gray-500 mt-10">Loading incoming requests...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Incoming Ride Requests"
          description="Approve riders, review their route preferences, and keep the ride flow consistent with the rest of the app."
          onBack={() => navigate(-1)}
        />

        {requests.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-gray-600 shadow-sm border border-emerald-100">No incoming ride requests.</div>
        ) : (
          <div className="grid gap-6">
            {requests.map((bookingRequest) => (
              <div
                key={bookingRequest.id}
                className="bg-white shadow-lg hover:shadow-xl rounded-3xl p-6 border border-emerald-100 transition"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      Rider:{" "}
                      {bookingRequest.approved
                        ? `${bookingRequest.rider.firstName} ${bookingRequest.rider.lastName}`
                        : `${bookingRequest.rider.firstName.charAt(0)}.`}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      From: <strong>{bookingRequest.pickup.label}</strong>
                      <br />
                      To: <strong>{bookingRequest.destination.label}</strong>
                    </p>
                    {bookingRequest.preferredRoute?.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        Preferred Stops:{" "}
                        {bookingRequest.preferredRoute.map((stop, i) => (
                          <span key={i}>
                            {stop.label}
                            {i < bookingRequest.preferredRoute.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </p>
                    )}

                  </div>

                  <div>
                    {bookingRequest.approved ? (
                      <span className="text-green-600 font-semibold text-sm bg-green-100 px-4 py-1 rounded-full">
                        ✅ Approved
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApprove(bookingRequest.id)}
                        className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                      >
                        Approve Request
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default IncomingRequests;
