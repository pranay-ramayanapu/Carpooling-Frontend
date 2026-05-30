import React, { useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LocationSearchInput from "./LocationSearchInput";
import { BOOKING_URL, SEACRH_RIDE_URL } from "../utils/apis";
import PageHeader from "../components/PageHeader";
import { showError, showSuccess } from "../utils/notify";

function SearchRides() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    pickup: null,
    drop: null,
    preferredRoute: [],
  });

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [pickupCity, setPickupCity] = useState("");


  const updateLocation = (field, value) => {
    setSearchData((prev) => ({ ...prev, [field]: value }));
  };

  const updatePreferredStop = (index, value) => {
    const updated = [...searchData.preferredRoute];
    updated[index] = value;
    setSearchData((prev) => ({ ...prev, preferredRoute: updated }));
  };

  const addPreferredStop = () => {
    setSearchData((prev) => ({
      ...prev,
      preferredRoute: [...prev.preferredRoute, null],
    }));
  };

  const handleSearch = async () => {
    if (!searchData.pickup || !searchData.drop) {
      showError("Please select both pickup and drop locations.");
      return;
    }

    try {
      setIsLoading(true);
      setHasSearched(true);
      const token = localStorage.getItem("AuthToken");
      console.log("Sending search data:", {
        pickup: searchData.pickup,
        drop: searchData.drop,
        preferredRoute: searchData.preferredRoute.filter((stop) => stop !== null),
      });


      const response = await axios.post(
        SEACRH_RIDE_URL,
        {
          pickup: searchData.pickup,
          drop: searchData.drop,
          preferredRoute: searchData.preferredRoute.filter((stop) => stop !== null),
          city: pickupCity
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setResults(response.data);
    } catch (error) {
      console.error("Search error:", error);
      showError("Something went wrong while searching.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestRide = async (rideId) => {
    try {
      await axios.post(
        `${BOOKING_URL}/${rideId}/create-request`,
        searchData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("AuthToken")}` },
        }
      );
      showSuccess("Request sent successfully.");
      handleSearch();
    } catch (err) {
      console.error(err);
      showError("Something went wrong while sending the request.");
    }
  };

  const toggleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedResults = [...results].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const mapTime = (t) => {
      const [h, m, s] = t.split(":").map(Number);
      return h * 3600 + m * 60 + s;
    };
    const valA = sortConfig.key === "arrivalTime"
      ? mapTime(a.routeMatchResult.arrivalTime)
      : a.routeMatchResult.score;
    const valB = sortConfig.key === "arrivalTime"
      ? mapTime(b.routeMatchResult.arrivalTime)
      : b.routeMatchResult.score;
    return sortConfig.direction === "asc" ? valA - valB : valB - valA;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-8 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Find a Ride"
          description="Search by pickup, drop, and optional preferred stops. Use the same soft card style as the rest of the app."
          onBack={() => navigate(-1)}
        />

        <div className="bg-white shadow-xl rounded-3xl p-8 mb-10 border border-emerald-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Pickup & Drop</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Pickup Location</label>
              <LocationSearchInput
                onSelect={(loc, city) => {
                  updateLocation("pickup", loc);
                  setPickupCity(city);
                }}
                placeholder="Search pickup location..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Drop Location</label>
              <LocationSearchInput
                onSelect={(loc) => updateLocation("drop", loc)}
                placeholder="Search drop location..."
              />
            </div>
          </div>

          {/* Preferred Stops */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Preferred Stops (Optional)</h3>
            {searchData.preferredRoute.map((_, idx) => (
              <div key={idx} className="mb-4">
                <LocationSearchInput
                  onSelect={(loc) => updatePreferredStop(idx, loc)}
                  placeholder={`Preferred Stop ${idx + 1}`}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addPreferredStop}
              className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 mt-2"
            >
              + Add Stop
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleSearch}
              className="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-emerald-700"
            >
              <Search className="inline mr-2" size={20} />
              Search Rides
            </button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-600">Searching for rides...</p>
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="text-center text-gray-500 text-lg font-medium mt-6">
            No vehicles available at your pickup point.
          </div>
        ) : results.length > 0 ? (
          <div className="bg-white shadow-md rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Matched Rides</h3>
            <div className="overflow-auto">
              <table className="min-w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 font-semibold">Driver</th>
                    <th className="p-3 font-semibold">Vehicle</th>
                    <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSort("arrivalTime")}>
                      Arrival Time {sortConfig.key === "arrivalTime" ? (sortConfig.direction === "asc" ? "⬆️" : "⬇️") : ""}
                    </th>
                    <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSort("score")}>
                      Match % {sortConfig.key === "score" ? (sortConfig.direction === "asc" ? "⬆️" : "⬇️") : ""}
                    </th>
                    <th className="p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((ride) => (
                    <tr key={ride.ride.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 flex items-center gap-3">
                        {ride.ride.driver.profileImageBase64 && (
                          <img
                            src={`data:image/jpeg;base64,${ride.ride.driver.profileImageBase64}`}
                            alt="Driver"
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                        )}
                        <span>
                          {ride.ride.driver.firstName} {ride.ride.driver.lastName}
                        </span>
                      </td>
                      <td className="p-3">
                        {ride.ride.vehicle.brand} {ride.ride.vehicle.model}
                      </td>
                      <td className="p-3">{ride.routeMatchResult.arrivalTime}</td>
                      <td className="p-3 font-semibold text-emerald-600">{Math.round(ride.routeMatchResult.score)}%</td>
                      <td className="p-3">
                        {ride.status === "APPROVED" ? (
                          <button className="bg-green-500 text-white px-4 py-1 rounded-md" disabled>
                            Approved
                          </button>
                        ) : ride.status === "PENDING" ? (
                          <button className="bg-gray-400 text-white px-4 py-1 rounded-md" disabled>
                            Request Sent
                          </button>
                        ) : (
                          <button
                            className="bg-emerald-500 text-white px-4 py-1 rounded-md hover:bg-emerald-600"
                            onClick={() => handleRequestRide(ride.ride.id)}
                          >
                            Request Ride
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null
        }
      </div>
    </div >
  );
}

export default SearchRides;
