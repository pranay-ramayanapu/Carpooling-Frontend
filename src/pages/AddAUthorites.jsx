import axios from "axios";
import { useState } from "react";
import LocationSearchInput from "./LocationSearchInput";
import { ADD_AUTHORITY, EDIT_AUTHORITY, GET_AUTHORITY } from "../utils/apis";
import { showError, showSuccess } from "../utils/notify";

function AddAuthorities() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [email, setEmail] = useState("");
  const [authorities, setAuthorities] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mode, setMode] = useState("add"); // "add" or "update"
  const [prevLabel, setPrevLabel] = useState(null);

  const handleAdd = async () => {
    if (!selectedLocation || !email) {
      showError("Please select a location and provide an email.");
      return;
    }

    try {
      console.log("Adding authority:", {
        label: selectedLocation.label,
        email,
      });
      const res = await axios.post(
        ADD_AUTHORITY,
        {
          label: selectedLocation.label,
          email,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("AuthToken")}`,
          },
        }
      );

      if (res.status === 200) {
        showSuccess("Successfully added.");
        resetForm();
      }
    } catch (error) {
      console.error(error);
      showError("Failed to add authority.");
    }
  };

  const handleUpdate = async () => {
    console.log(selectedLocation, email, prevLabel);
    if (!selectedLocation || !email || !prevLabel) {
      showError("Missing data to update.");
      return;
    }

    try {
      console.log("Updating authority:", {
        prevLabel,
        label: selectedLocation.label,
        email,
      });
      const res = await axios.put(
        `${EDIT_AUTHORITY}/${prevLabel}`,
        {
          label: selectedLocation.label,
          email,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("AuthToken")}`,
          },
        }
      );

      if (res.status === 200) {
        showSuccess("Successfully updated.");
        resetForm();
      }
    } catch (error) {
      console.error(error);
      showError("Failed to update authority.");
    }
  };

  const fetchAuth = async () => {
    if (!selectedLocation) {
      showError("Please select a location.");
      return;
    }

    try {
      const label = selectedLocation.label; // store before it changes
      const res = await axios.get(
        `${GET_AUTHORITY}/${label}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("AuthToken")}`,
          },
        }
      );

      if (res.status === 200) {
        setAuthorities(res.data);
        setIsVisible(true);
        setEmail(res.data.email);
        setPrevLabel(label); // use the original selected label
        setSelectedLocation({ label: res.data.city }); // sets new label only for UI
        setMode("update");
      } else {
        showError("Authorities data not found.");
      }
    } catch (error) {
      console.error(error);
      showError("Something went wrong.");
    }
  };


  const resetForm = () => {
    setSelectedLocation(null);
    setEmail("");
    setMode("add");
    setPrevLabel(null);
    setAuthorities(null);
    setIsVisible(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
        Manage SOS Authorities
      </h2>

      {/* Authority Form */}
      <section className="bg-white shadow-md rounded-xl p-6 max-w-xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {mode === "add" ? "Add Authority" : "Update Authority"}
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select City (via Nominatim)
          </label>
          <LocationSearchInput onSelect={setSelectedLocation} defaultValue={selectedLocation?.label} />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Authority Email
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-style w-full"
          />
        </div>

        <div className="flex gap-4">
          {mode === "add" ? (
            <button
              onClick={handleAdd}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded"
            >
              Add Authority
            </button>
          ) : (
            <button
              onClick={handleUpdate}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            >
              Update Authority
            </button>
          )}

          <button
            onClick={resetForm}
            className="w-full bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-4 rounded"
          >
            Clear
          </button>
        </div>
      </section>

      {/* Fetch Authority */}
      <section className="bg-white shadow-md rounded-xl p-6 max-w-xl mx-auto mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Fetch Authority Details
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select City (via Nominatim)
          </label>
          <LocationSearchInput onSelect={setSelectedLocation} />
        </div>

        <button
          onClick={fetchAuth}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded"
        >
          Fetch
        </button>
      </section>

      {/* Display Result */}
      {isVisible && authorities && (
        <section className="bg-white shadow-md rounded-xl p-6 max-w-xl mx-auto mt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Authority Details</h3>
          <div className="flex flex-col gap-2 text-sm text-gray-700">
            <div>
              <strong>City:</strong> {authorities.label}
            </div>
            <div>
              <strong>Email:</strong> {authorities.email}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default AddAuthorities;
