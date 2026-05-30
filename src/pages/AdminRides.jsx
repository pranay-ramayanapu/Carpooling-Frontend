import React, { useEffect, useState } from "react";
import { Loader, Trash2 } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DELETE_RIDE_URL, RIDES_URL } from "../utils/apis";
import { showError, showSuccess } from "../utils/notify";

function AdminRides() {
  const [rides, setRides] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [driver, setDriver] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const token = localStorage.getItem("AuthToken");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const res = await axios.get(RIDES_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRides(res.data);
        setFiltered(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("Error fetching rides", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, [token]);

  useEffect(() => {
    let result = [...rides];
    if (status) result = result.filter((r) => r.status === status);
    if (city)
      result = result.filter((r) =>
        r.route.some((stop) =>
          stop.location.label.toLowerCase().includes(city.toLowerCase())
        )
      );
    if (date)
      result = result.filter(
        (r) => r.createdAt.split("T")[0] === date
      );
    if (driver)
      result = result.filter((r) =>
        r.driver.email.toLowerCase().includes(driver.toLowerCase())
      );

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFiltered(result);
  }, [status, city, date, driver, rides]);

  const deleteRide = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ride?")) return;
    try {
      await axios.delete(`${DELETE_RIDE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRides(rides.filter((r) => r.id !== id));
      showSuccess("Ride deleted.");
    } catch (err) {
      console.error("Delete failed", err);
      showError("Failed to delete ride.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white shadow-md rounded-xl p-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border px-3 py-2 rounded text-sm"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border px-3 py-2 rounded text-sm"
          />
          <input
            type="text"
            placeholder="Driver Email"
            value={driver}
            onChange={(e) => setDriver(e.target.value)}
            className="border px-3 py-2 rounded text-sm"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border px-3 py-2 rounded text-sm"
          >
            <option value="">All Status</option>
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
            <option value="FILLED">FILLED</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="border px-3 py-2 rounded text-sm bg-gray-200 hover:bg-gray-300"
          >
            Sort: {sortOrder === "desc" ? "Newest ⬇" : "Oldest ⬆"}
          </button>

        </div>

        {loading ? (
          <div className="text-center py-10">
            <Loader className="animate-spin mx-auto text-emerald-600" />
            <p className="text-gray-500 mt-2">Loading rides...</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">No rides found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm text-gray-700">
              <thead className="bg-emerald-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Driver</th>
                  <th className="px-4 py-2 text-left">Route</th>
                  <th className="px-4 py-2 text-left">Seats</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Created At</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/ride-details/${r.id}`)}
                  >
                    <td className="px-4 py-2">{r.driver.email}</td>
                    <td className="px-4 py-2">
                      {r.route.map((stop, i) => (
                        <div key={i} className="mb-1">
                          <span className="font-medium">{stop.location.label}</span>
                          {" "}
                          <span className="text-xs text-gray-500">
                            ({stop.arrivalTime})
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-2">
                      {r.availableSeats} / {r.seatCapacity}
                    </td>
                    <td className="px-4 py-2">{r.status}</td>
                    <td className="px-4 py-2">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        {r.status == "OPEN" && (<button
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/create/${r.id}`);
                          }}
                          className="flex items-center gap-1 text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                          title="Update this ride"
                        >
                          Update
                        </button>)}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            deleteRide(r.id);
                          }}
                          className="flex items-center gap-1 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminRides;
