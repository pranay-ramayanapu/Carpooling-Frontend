import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Car, Clock, MapPin, Users, ShieldCheck } from "lucide-react";
import { BOOKING_URL, CLOSE_RIDE_URL, GET_RIDE_BOOKING, GET_RIDE_URL, SUBMIT_REVIEW } from "../utils/apis";
import PageHeader from "../components/PageHeader";
import { showError, showSuccess } from "../utils/notify";

function RideDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isClosing, setIsClosing] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [riderReviews, setRiderReviews] = useState({});

  useEffect(() => {
    const fetchRideData = async () => {
      try {
        const token = localStorage.getItem("AuthToken");

        const rideRes = await axios.get(`${GET_RIDE_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRide(rideRes.data);

        const bookingsRes = await axios.get(`${GET_RIDE_BOOKING}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(bookingsRes.data);
      } catch (error) {
        console.error("Error fetching ride or bookings:", error);
      }
    };

    fetchRideData();
  }, [id]);

  const handleCloseRide = () => {
    const initialReviews = {};
    bookings.forEach((bookingRequest) => {
      const email = bookingRequest.rider.email;
      initialReviews[email] = { rating: 5, comment: "" };
    });
    setRiderReviews(initialReviews);
    setShowReviewForm(true);
  };

  const updateReviewField = (email, field, value) => {
    setRiderReviews((prev) => ({
      ...prev,
      [email]: {
        ...prev[email],
        [field]: value,
      },
    }));
  };

  const submitAllReviewsAndCloseRide = async () => {
    const token = localStorage.getItem("AuthToken");

    try {
      setIsClosing(true);

      for (const email of Object.keys(riderReviews)) {
        const { rating, comment } = riderReviews[email];
        if (comment.trim() || rating !== 5) {
          await axios.post(
            SUBMIT_REVIEW,
            {
              revieweeEmail: email,
              rating,
              comment,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      }

      const rideRes = await axios.post(
        `${CLOSE_RIDE_URL}/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRide(rideRes.data);
      setShowReviewForm(false);
      showSuccess("Ride closed and reviews submitted.");
    } catch (error) {
      console.error("Error during review/close:", error);
      showError("Failed to submit reviews or close ride.");
    } finally {
      setIsClosing(false);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      setApprovingId(bookingId);
      await axios.post(`${BOOKING_URL}/${bookingId}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("AuthToken")}`,
        },
      });

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, bookingRequest: { ...b.bookingRequest, approved: true } } : b
        )
      );
    } catch (error) {
      console.error("Failed to approve booking:", error);
      showError("Something went wrong while approving. Try again.");
    } finally {
      setApprovingId(null);
    }
  };

  if (!ride) {
    return <p className="text-center text-gray-500 py-10">Loading ride details...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-indigo-50 py-8 px-4 md:px-10">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Ride Overview"
          description="Review the route, rider requests, and ride preferences. Use the same visual style as the rest of the app."
          onBack={() => navigate(-1)}
        />

        {/* Ride Summary Card */}
        <div className="bg-white shadow-xl rounded-3xl p-8 mb-10 border border-emerald-100">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
              <MapPin className="text-emerald-500" /> Full Route
            </h3>
            <ol className="mt-4 ml-5 space-y-3 text-gray-700 list-decimal">
              {ride.route.map((stop, idx) => (
                <li key={idx}>
                  <p className="font-medium">{stop.location?.label ?? "Unknown location"}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {stop.arrivalTime}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <p className="flex items-center gap-2">
              <Users className="text-emerald-500" /> Seats:{" "}
              <span className="font-semibold">
                {ride.availableSeats}/{ride.seatCapacity}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" /> Status:{" "}
              <span className={`font-semibold ${ride.status === "OPEN" ? "text-green-600" : "text-gray-600"}`}>
                {ride.status}
              </span>
            </p>
            <p className="flex items-center gap-2 col-span-2">
              <Car className="text-emerald-500" />
              Vehicle:{" "}
              <span className="font-semibold">
                {ride.vehicle.brand} {ride.vehicle.model} ({ride.vehicle.color})
              </span>
            </p>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-1">Ride Preferences</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">🎵 Music: {ride.preferences.music}</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">❄️ AC: {ride.preferences.ac}</span>
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">🚬 Smoking: {ride.preferences.smoking}</span>
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">🐾 Pet-Friendly: {ride.preferences.petFriendly}</span>
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">🚻 Gender: {ride.preferences.genderBased}</span>
            </div>
          </div>

          {ride.status !== "CLOSED" && !showReviewForm && (
            <div className="mt-8 text-right">
              <button
                onClick={handleCloseRide}
                className="rounded-full bg-red-600 px-6 py-2 font-semibold text-white shadow-md transition hover:bg-red-700"
              >
                Close Ride
              </button>
              <p className="text-xs text-gray-500 mt-1">Click after ride is complete.</p>
            </div>
          )}
        </div>

        {/* Booking Requests */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-indigo-100">
          <h3 className="text-2xl font-bold text-indigo-700 mb-4">📬 Booking Requests</h3>

          {bookings.length === 0 ? (
            <p className="text-gray-500">No booking requests yet.</p>
          ) : (
            <div className="grid gap-6">
              {bookings.map((bookingRequest) => {
                const { rider, approved } = bookingRequest;
                const bookingId = bookingRequest.id;
                const status = approved ? "APPROVED" : "PENDING";
                const statusColor = approved ? "text-green-600" : "text-yellow-600";

                return (
                  <div
                    key={bookingId}
                    className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-gray-50 p-4 rounded-lg shadow-md"
                  >
                    {rider.profileImageBase64 && (
                      <img
                        src={`data:image/jpeg;base64,${rider.profileImageBase64}`}
                        alt="Rider"
                        className={`w-14 h-14 rounded-full object-cover border ${approved ? "" : "blur-sm"}`}
                      />
                    )}

                    <div className="flex-1 w-full">
                      <h4 className="text-lg font-semibold text-gray-800">
                        {rider.firstName} {rider.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">📧 {rider.email}</p>
                      <p className="text-sm text-gray-600">📞 {rider.phoneNumber}</p>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <span className={`text-sm font-bold ${statusColor}`}>Status: {status}</span>
                      {!approved && (
                        <button
                          onClick={() => handleApprove(bookingId)}
                          disabled={approvingId === bookingId}
                          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
                        >
                          {approvingId === bookingId ? "Approving..." : "Approve"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rider Review Form */}
        {showReviewForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white max-h-[90vh] overflow-y-auto w-full max-w-3xl rounded-3xl shadow-2xl p-6 relative">
              <h3 className="text-3xl font-extrabold text-emerald-700 mb-6 text-center">
                📝 Rider Vibe Check
              </h3>

              <div className="space-y-8">
                {bookings.map((bookingRequest) => {
                  const rider = bookingRequest.rider;
                  const review = riderReviews[rider.email] || { rating: 5, comment: "" };

                  return (
                    <div key={rider.email} className="border border-gray-200 p-5 rounded-xl bg-gray-50 shadow-sm">
                      <h4 className="text-xl font-semibold text-gray-800 mb-3">
                        {rider.firstName} {rider.lastName}{" "}
                        <span className="text-sm text-gray-500">({rider.email})</span>
                      </h4>

                      <div className="mb-4">
                        <label className="block text-sm font-bold text-emerald-700 mb-1">
                          🌟 How would you rate their vibe?
                        </label>
                        <div className="flex gap-4 items-center">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              onClick={() => updateReviewField(rider.email, "rating", val)}
                              className={`text-2xl transition-all duration-150 ${review.rating === val ? "scale-125 text-emerald-600" : "opacity-50"
                                }`}
                            >
                              {["😡", "😕", "😐", "😊", "🤩"][val - 1]}
                            </button>
                          ))}
                          <span className="text-sm text-emerald-600 ml-2">
                            {["Terrible", "Bad", "Okay", "Great", "Awesome"][review.rating - 1]}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-emerald-700 mb-1">
                          💬 Comment (optional)
                        </label>
                        <textarea
                          rows="3"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 bg-white text-sm text-gray-800"
                          placeholder="Anything you’d like to share about this rider?"
                          value={review.comment}
                          onChange={(e) => updateReviewField(rider.email, "comment", e.target.value)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
                <button
                  onClick={submitAllReviewsAndCloseRide}
                  disabled={isClosing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-60"
                >
                  {isClosing ? "Closing..." : "Submit & Close Ride 🚘"}
                </button>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-full font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-center text-gray-400 mt-3">
                Your feedback helps improve the community 🛣️💬
              </p>

              {/* Close X Button */}
              <button
                onClick={() => setShowReviewForm(false)}
                className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default RideDetails;
