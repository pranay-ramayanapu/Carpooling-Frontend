import React, { useEffect, useState } from "react";
import { Search, UserMinus, ArrowUpRight, Loader, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DELETE_BANNED_USER, GET_BANNED_USERS_URL, GET_USER_LIST, POST_BANNED_USER, PROMOTE_USER } from "../utils/apis";
import { showError, showSuccess } from "../utils/notify";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [banModal, setBanModal] = useState({ show: false, email: "" });
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("");

  // 🔽 Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 10;

  const navigate = useNavigate();
  const token = localStorage.getItem("AuthToken");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, bannedRes] = await Promise.all([
          axios.get(`${GET_USER_LIST}?page=${page}&size=${size}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(GET_BANNED_USERS_URL, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const { content, totalPages } = usersRes.data;
        const formattedUsers = content.map((user) => ({
          ...user,
          name: `${user.firstName} ${user.lastName}`,
        }));

        setUsers(formattedUsers);
        setTotalPages(totalPages);
        setBannedUsers(bannedRes.data.map((b) => b.email));
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, page]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const promoteToAdmin = async (email) => {
    try {
      await axios.post(
        `${PROMOTE_USER}/${email}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map((u) => (u.email === email ? { ...u, role: "ADMIN" } : u)));
    } catch (err) {
      console.error("Promotion failed", err);
    }
  };

  const handleBan = async () => {
    try {
      await axios.post(
        POST_BANNED_USER,
        {
          email: banModal.email,
          reason: banReason,
          localDateTime: new Date(),
          duration: parseInt(banDuration),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showSuccess("User banned successfully.");
      setBannedUsers([...bannedUsers, banModal.email]);
    } catch (err) {
      console.error("Ban failed", err);
      showError("Failed to ban user.");
    } finally {
      setBanModal({ show: false, email: "" });
      setBanReason("");
      setBanDuration("");
    }
  };

  const unbanUser = async (email) => {
    try {
      await axios.delete(`${DELETE_BANNED_USER}/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSuccess("User unbanned successfully.");
      setBannedUsers(bannedUsers.filter((e) => e !== email));
    } catch (err) {
      console.error("Unban failed", err);
      showError("Failed to unban user.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white shadow-md rounded-xl p-6">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800">User Management</h2>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Search by name or email"
              className="border px-3 py-2 rounded-lg text-sm focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border px-3 py-2 rounded-lg text-sm focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="RIDER">Rider</option>
              <option value="DRIVER">Driver</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-10">
            <Loader className="animate-spin mx-auto text-emerald-600" />
            <p className="text-gray-500 mt-2">Loading users...</p>
          </div>
        ) : (
          <>
            <table className="min-w-full table-auto text-sm text-gray-700">
              <thead className="bg-emerald-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.email} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{user.role}</td>
                    <td className="px-4 py-2 flex gap-2 flex-wrap">
                      {user.role !== "ADMIN" && (
                        <button
                          onClick={() => promoteToAdmin(user.email)}
                          className="flex items-center gap-1 text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                        >
                          <ShieldCheck size={14} /> Promote
                        </button>
                      )}
                      {!bannedUsers.includes(user.email) ? (
                        <button
                          onClick={() => setBanModal({ show: true, email: user.email })}
                          className="flex items-center gap-1 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          <UserMinus size={14} /> Ban
                        </button>
                      ) : (
                        <button
                          onClick={() => unbanUser(user.email)}
                          className="flex items-center gap-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded"
                        >
                          Unban
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {/* Numbered Pagination */}
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


            {/* Banned Users */}
            <div className="mt-10">
              <h3 className="text-lg font-semibold mb-2">Banned Users</h3>
              {bannedUsers.length === 0 ? (
                <p className="text-sm text-gray-500">No users are currently banned.</p>
              ) : (
                <ul className="list-disc list-inside text-sm text-red-600">
                  {bannedUsers.map((email) => (
                    <li key={email}>{email}</li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {/* Ban Modal (unchanged) */}
        {banModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Ban User</h3>
              <p className="text-sm mb-2">Email: {banModal.email}</p>
              <input
                type="text"
                placeholder="Reason"
                className="w-full mb-2 border px-3 py-2 rounded"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
              <input
                type="number"
                placeholder="Duration (days)"
                className="w-full mb-4 border px-3 py-2 rounded"
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setBanModal({ show: false, email: "" })}
                  className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBan}
                  className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
                >
                  Confirm Ban
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;
