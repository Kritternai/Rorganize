import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import { RefreshCw, Users, Search, AlertTriangle } from "lucide-react";

const TenantManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("fullname");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editTenant, setEditTenant] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await axios.get("http://localhost:3001/api/tenants", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTenants(res.data || []);
      } catch (err) {
        console.error("❌ Error fetching tenants:", err);
      }
    };

    const fetchContracts = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await axios.get("http://localhost:3001/api/contracts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setContracts(res.data || []);
      } catch (err) {
        console.error("❌ Error fetching contracts:", err);
      }
    };

    fetchTenants();
    fetchContracts();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedTenants = [...tenants].sort((a, b) => {
    let aVal = a[sortField] || "";
    let bVal = b[sortField] || "";
    return sortDirection === "asc"
      ? aVal.toString().localeCompare(bVal)
      : bVal.toString().localeCompare(aVal);
  });

  const filteredTenants = sortedTenants.filter((t) =>
    (t.fullname || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (tenant) => {
    setSelectedTenant(tenant);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedTenant(null);
    setShowModal(false);
  };

  const openEditModal = (tenant) => {
    let vehicle = {};
    try {
      vehicle = tenant.vehicle_info ? JSON.parse(tenant.vehicle_info) : {};
    } catch (e) {
      console.warn("❌ Vehicle info parsing error:", e);
    }

    setEditTenant({
      ...tenant,
      vehicle_type: vehicle.type || "",
      vehicle_plate: vehicle.plate || "",
      vehicle_color: vehicle.color || "",
      documentFile: null,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditTenant(null);
    setShowEditModal(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditTenant((prev) => ({ ...prev, [name]: value }));
  };

  const saveEditTenant = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const formData = new FormData();
      Object.entries(editTenant).forEach(([key, val]) => {
        if (val !== undefined) {
          formData.append(key, val);
        }
      });
  
      if (editTenant.documentFile) {
        formData.append("document", editTenant.documentFile);
      }
  
      formData.set("vehicle_info", JSON.stringify({
        type: editTenant.vehicle_type,
        plate: editTenant.vehicle_plate,
        color: editTenant.vehicle_color
      }));
  
      await axios.put(`http://localhost:3001/api/tenants/${editTenant.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      setTenants((prev) =>
        prev.map((t) => (t.id === editTenant.id ? editTenant : t))
      );
      closeEditModal();
    } catch (err) {
      console.error("❌ Error updating tenant:", err);
      alert("ไม่สามารถบันทึกการแก้ไขผู้เช่าได้");
    }
  };
  
  
  return (
    <AdminSidebar>
      <div className="p-6 bg-gray-50 min-h-screen font-[Prompt]">
        {/* Header */}
        <header className="bg-white shadow-md p-6 rounded-xl flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">👥 จัดการผู้เช่า</h2>
            <p className="text-gray-500">ดูข้อมูลและจัดการผู้เช่าในระบบ</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <RefreshCw size={18} className="mr-2" /> รีเฟรช
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="ผู้เช่าทั้งหมด" count={tenants.length} />
          <StatCard label="ผู้เช่าปัจจุบัน" count={tenants.filter(t => t.emergency_contact).length} />
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg"
              placeholder="ค้นหาผู้เช่า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["fullname", "phone", "email", "emergency_contact"].map((field) => (
                  <th
                    key={field}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort(field)}
                  >
                    {field.replace("_", " ")}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">เอกสาร</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">ยานพาหนะ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">ห้องที่เช่า</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">เช่าตั้งแต่</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">สิ้นสุดสัญญา</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="px-6 py-4">{tenant.fullname}</td>
                  <td className="px-6 py-4">{tenant.phone}</td>
                  <td className="px-6 py-4">{tenant.email}</td>
                  <td className="px-6 py-4">{tenant.emergency_contact}</td>
                  <td className="px-6 py-4">
                    {tenant.document ? (
                      <a href={`http://localhost:3001/uploads/${tenant.document}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        ดูเอกสาร
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {tenant.vehicle_info ? (() => {
                      try {
                        const vehicle = JSON.parse(tenant.vehicle_info);
                        return `${vehicle.type || ""} ${vehicle.plate || ""} (${vehicle.color || ""})`;
                      } catch {
                        return "-";
                      }
                    })() : "-"}
                  </td>
                  {(() => {
                    const currentContract = contracts.find(c => c.tenant_id === tenant.id && c.status === 'active');
                    return (
                      <>
                        <td className="px-6 py-4">{currentContract ? currentContract.room_id : '-'}</td>
                        <td className="px-6 py-4">{currentContract ? new Date(currentContract.start_date).toLocaleDateString() : '-'}</td>
                        <td className="px-6 py-4">{currentContract ? new Date(currentContract.end_date).toLocaleDateString() : '-'}</td>
                      </>
                    );
                  })()}
                  <td className="px-6 py-4 space-x-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => openEditModal(tenant)}
                    >
                      แก้ไข
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTenants.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-400">
                    <AlertTriangle className="mx-auto mb-2" /> ไม่พบผู้เช่าที่ตรงกับการค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && selectedTenant && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">📋 รายละเอียดผู้เช่า</h2>
              <p><strong>ชื่อ:</strong> {selectedTenant.fullname}</p>
              <p><strong>เบอร์โทร:</strong> {selectedTenant.phone}</p>
              <p><strong>อีเมล:</strong> {selectedTenant.email}</p>
              <p><strong>ผู้ติดต่อฉุกเฉิน:</strong> {selectedTenant.emergency_contact}</p>
              {(() => {
                const currentContract = contracts.find(c => c.tenant_id === selectedTenant.id && c.status === 'active');
                if (currentContract) {
                  return (
                    <>
                      <p><strong>ห้องที่เช่า:</strong> {currentContract.room_id}</p>
                      <p><strong>เช่าตั้งแต่:</strong> {new Date(currentContract.start_date).toLocaleDateString()}</p>
                      <p><strong>สิ้นสุดสัญญา:</strong> {new Date(currentContract.end_date).toLocaleDateString()}</p>
                    </>
                  );
                }
                return <p><strong>สถานะ:</strong> ไม่มีการเช่าอยู่ในขณะนี้</p>;
              })()}
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={closeModal}
              >
                ปิด
              </button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editTenant && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">📝 แก้ไขผู้เช่า</h2>
              {["fullname", "phone", "email", "emergency_contact"].map((field) => (
                <label key={field} className="block mb-2 capitalize">
                  {field.replace("_", " ")}:
                  <input
                    type="text"
                    name={field}
                    value={editTenant[field]}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded"
                  />
                </label>
              ))}
              <label className="block mb-2">
                เอกสารประจำตัว (PDF):
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setEditTenant((prev) => ({
                      ...prev,
                      documentFile: e.target.files[0],
                    }))
                  }
                  className="w-full p-2 border rounded"
                />
              </label>
              <label className="block mb-2">
                ประเภทยานพาหนะ:
                <input
                  type="text"
                  name="vehicle_type"
                  value={editTenant.vehicle_type || ""}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded"
                />
              </label>
              <label className="block mb-2">
                ทะเบียน:
                <input
                  type="text"
                  name="vehicle_plate"
                  value={editTenant.vehicle_plate || ""}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded"
                />
              </label>
              <label className="block mb-2">
                สี:
                <input
                  type="text"
                  name="vehicle_color"
                  value={editTenant.vehicle_color || ""}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded"
                />
              </label>
              <div className="flex justify-end space-x-2 mt-4">
                <button className="px-4 py-2 bg-gray-200 rounded" onClick={closeEditModal}>
                  ยกเลิก
                </button>
                <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={saveEditTenant}>
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminSidebar>
  );
};

const StatCard = ({ label, count }) => (
  <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold">{count}</p>
    </div>
    <div className="bg-gray-100 p-2 rounded-full">
      <Users size={20} className="text-gray-500" />
    </div>
  </div>
);

export default TenantManagement;