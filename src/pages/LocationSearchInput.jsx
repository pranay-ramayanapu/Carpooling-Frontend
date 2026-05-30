import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const LocationSearchInput = ({ value, onSelect, placeholder = "Search location..." }) => {
  const [query, setQuery] = useState(value?.label || "");
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    setQuery(value?.label || "");
  }, [value]);

  const fetchSuggestions = async (val) => {
    setQuery(val);
    if (val.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: val, format: "json", addressdetails: 1, limit: 5 },
      });
      setSuggestions(res.data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleSelect = (place) => {
    console.log(place);
    const address = place.address || {};
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.state_district ||
      address.state;
    const location = {
      label: place.display_name,
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
    };
    onSelect(location, city);
    setQuery(place.display_name);
    setSuggestions([]);
  };

  return (
    <div className="relative w-full col-span-3 md:col-span-3">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => fetchSuggestions(e.target.value)}
        onBlur={() => setTimeout(() => setSuggestions([]), 200)}
        placeholder={placeholder}
        className="input-style w-full rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-emerald-100 rounded-2xl shadow-xl w-full max-h-60 overflow-y-auto mt-2">
          {suggestions.map((place, idx) => (
            <li
              key={idx}
              className="px-4 py-3 hover:bg-emerald-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
              onMouseDown={() => handleSelect(place)}
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearchInput;
