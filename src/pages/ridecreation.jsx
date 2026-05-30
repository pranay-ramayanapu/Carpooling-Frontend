import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import LocationSearchInput from "./LocationSearchInput";
import { GET_RIDE_URL, RIDES_URL } from "../utils/apis";
import PageHeader from "../components/PageHeader";
import { showError, showSuccess } from "../utils/notify";

const RideCreate = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const isUpdate = !!rideId;

  const [route, setRoute] = useState([{ location: null, arrivalTime: "" }]);
  const [seatCapacity, setSeatCapacity] = useState(1);
  const [availableSeats, setAvailableSeats] = useState(1);
  const [version, setVersion] = useState(0);
  const [vehicle, setVehicle] = useState({ model: "", brand: "", licensePlate: "", color: "" });
  const [preferences, setPreferences] = useState({
    music: "NONE",
    smoking: "NONE",
    petFriendly: "NONE",
    genderBased: "NONE",
    ac: "NONE",
  });
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");

  // Pre-fill fields if updating
  useEffect(() => {
    console.log(isUpdate);
    if (isUpdate) {
      setLoading(true);
      axios.get(`${GET_RIDE_URL}/${rideId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("AuthToken")}` },
      })
        .then(res => {
          const d = res.data;
          console.log("ride data:", d);
          setRoute(d.route ?? [{ location: null, arrivalTime: "" }]);
          setSeatCapacity(d.seatCapacity ?? 1);
          setVehicle(d.vehicle ?? { model: "", brand: "", licensePlate: "", color: "" });
          setPreferences(d.preferences ?? {
            music: "NONE", smoking: "NONE", petFriendly: "NONE", genderBased: "NONE", ac: "NONE",
          });
          setAvailableSeats(d.availableSeats);
          setVersion(d.version);
        })
        .catch(() => showError("Failed to fetch ride data."))
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isUpdate, rideId]);

  const addRouteStop = () => {
    setRoute([...route, { location: null, arrivalTime: "" }]);
  };

  const updateRouteStop = (idx, key, value) => {
    const updated = [...route];
    updated[idx][key] = value;
    setRoute(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requestBody = {
      route: route.map(s => ({ location: s.location, arrivalTime: s.arrivalTime })),
      seatCapacity,
      availableSeats: isUpdate ? availableSeats : seatCapacity,
      vehicle,
      preferences,
      version,
      city,
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("AuthToken");
      if (isUpdate) {
        try {
          console.log(requestBody);
          const res = await axios.put(`${RIDES_URL}/${rideId}`, requestBody, {
            headers: { Authorization: `Bearer ${token}` },
          });
          showSuccess("Ride updated successfully.");
          console.log(res.data);
        } catch (err) {
          if (err?.response?.status === 409) {
            showError("This ride was updated by someone else. Please reload and try again.");
          } else {
            showError("Failed to update ride.");
          }
        }
      } else {
        console.log(requestBody);
        await axios.post(RIDES_URL, requestBody, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showSuccess("Ride created successfully.");
      }
      navigate("/driver-rides");
    } catch (err) {
      console.log(err);
      showError(isUpdate ? "Failed to update ride." : "Failed to create ride.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 px-4 md:px-10">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title={isUpdate ? "Update Ride" : "Create a Ride"}
          description="Add the start point, optional stops, end point, timing, and vehicle details in a clear order."
        />

        <div className="bg-white/95 backdrop-blur p-6 md:p-8 rounded-3xl shadow-xl border border-emerald-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Route Input */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-700">Route (Start → Stops → End)</h3>
              {route.map((stop, index) => (
                <div key={index} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 md:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                      {index === 0 ? "Start point" : index === route.length - 1 ? "End point" : `Stop ${index}`}
                    </span>
                    <span className="text-xs text-gray-500">Set a location and arrival time</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <LocationSearchInput
                      value={stop.location}
                      placeholder={index === 0 ? "Search start point..." : index === route.length - 1 ? "Search end point..." : `Search stop ${index}...`}
                      onSelect={(loc, city) => {
                        updateRouteStop(index, "location", loc);
                        if (index === 0) setCity(city);
                      }}
                    />

                    <input
                      type="time"
                      className="input-style rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      value={stop.arrivalTime}
                      onChange={(e) => updateRouteStop(index, "arrivalTime", e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addRouteStop}
                className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                + Add Another Stop
              </button>
            </section>

            {/* Vehicle Info */}
            <section>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Vehicle Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["model", "brand", "licensePlate", "color"].map((field) => (
                  <input
                    key={field}
                    type="text"
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    className="input-style rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    value={vehicle[field]}
                    onChange={(e) => setVehicle({ ...vehicle, [field]: e.target.value })}
                  />
                ))}
              </div>
            </section>

            {/* Seat Capacity */}
            <section>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Seats Capacity</h3>
              <input
                type="number"
                className="input-style w-28 rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                value={seatCapacity}
                min={1}
                max={10}
                onChange={(e) => setSeatCapacity(parseInt(e.target.value))}
              />
            </section>

            {isUpdate && (
              <section>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Seats Available</h3>
                <input
                  type="number"
                  className="input-style w-28 rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  value={availableSeats}
                  min={1}
                  max={10}
                  onChange={(e) => setAvailableSeats(parseInt(e.target.value))}
                />
              </section>
            )
            }

            {/* Preferences */}
            <section className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-700">Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["music", "smoking", "petFriendly", "ac"].map((pref) => (
                  <div key={pref}>
                    <label className="block text-sm capitalize mb-1 text-gray-600">{pref}</label>
                    <select
                      value={preferences[pref]}
                      onChange={(e) => setPreferences({ ...preferences, [pref]: e.target.value })}
                      className="input-style rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    >
                      <option value="NONE">NONE</option>
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>
                ))}
                <div>
                  <label className="block text-sm mb-1">Gender Based</label>
                  <select
                    value={preferences.genderBased}
                    onChange={(e) =>
                      setPreferences({ ...preferences, genderBased: e.target.value })
                    }
                    className="input-style rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="NONE">NONE</option>
                    <option value="MALE_ONLY">MALE ONLY</option>
                    <option value="FEMALE_ONLY">FEMALE ONLY</option>
                  </select>
                </div>
              </div>
            </section>

            <button
              type="submit"
              className={`w-full py-3 rounded-full font-semibold shadow-md transition-all ${loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              disabled={loading}
            >
              {loading ? (isUpdate ? "Updating..." : "Creating Ride...") : (isUpdate ? "Update Ride" : "Create Ride")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RideCreate;


