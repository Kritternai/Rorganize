import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";

const TenantManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editTenant, setEditTenant] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const mockTenants = [
      {
        id: 1,
        full_name: "John Doe",
        phone: "012-345-6789",
        email: "john@example.com",
        rental_history: "2 years",
        behavior: "Good",
        complaints: 0,
      },
      {
        id: 2,
        full_name: "Jane Smith",
        phone: "987-654-3210",
        email: "jane@example.com",
        rental_history: "1 year",
        behavior: "Average",
        complaints: 1,
      },
    ];
    setTenants(mockTenants);
  }, []);

  const openModal = (tenant) => {
    setSelectedTenant(tenant);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedTenant(null);
    setShowModal(false);
  };

  const openEditModal = (tenant) => {
    setEditTenant({ ...tenant });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditTenant(null);
    setShowEditModal(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditTenant(prev => ({ ...prev, [name]: value }));
  };

  const saveEditTenant = () => {
    setTenants(prev =>
      prev.map(t => (t.id === editTenant.id ? editTenant : t))
    );
    closeEditModal();
  };

  return (
    <AdminSidebar>
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">👥 จัดการผู้เช่า</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">ผู้เช่าทั้งหมด</h2>
            <p className="text-2xl">{tenants.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">ผู้เช่าปัจจุบัน</h2>
            <p className="text-2xl">{tenants.filter(t => t.complaints === 0).length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">ผู้เช่าที่เคยอยู่</h2>
            <p className="text-2xl">{tenants.filter(t => t.rental_history).length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">ผู้เช่าที่มีการร้องเรียน</h2>
            <p className="text-2xl">{tenants.filter(t => t.complaints > 0).length}</p>
          </div>
        </div>

        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ชื่อผู้เช่า</th>
              <th className="py-2 px-4 border-b">เบอร์โทร</th>
              <th className="py-2 px-4 border-b">อีเมล</th>
              <th className="py-2 px-4 border-b">ประวัติการเช่า</th>
              <th className="py-2 px-4 border-b">พฤติกรรม</th>
              <th className="py-2 px-4 border-b">การร้องเรียน</th>
              <th className="py-2 px-4 border-b">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant.id}>
                <td className="py-2 px-4 border-b">{tenant.full_name}</td>
                <td className="py-2 px-4 border-b">{tenant.phone}</td>
                <td className="py-2 px-4 border-b">{tenant.email}</td>
                <td className="py-2 px-4 border-b">{tenant.rental_history}</td>
                <td className="py-2 px-4 border-b">{tenant.behavior}</td>
                <td className="py-2 px-4 border-b">{tenant.complaints}</td>
                <td className="py-2 px-4 border-b">
                  <button className="text-blue-500 hover:underline" onClick={() => openEditModal(tenant)}>แก้ไข</button>
                  <button className="text-blue-500 hover:underline ml-2" onClick={() => openModal(tenant)}>ดูรายละเอียด</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && selectedTenant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">รายละเอียดผู้เช่า</h2>
              <p><strong>ชื่อ:</strong> {selectedTenant.full_name}</p>
              <p><strong>เบอร์โทร:</strong> {selectedTenant.phone}</p>
              <p><strong>อีเมล:</strong> {selectedTenant.email}</p>
              <p><strong>ประวัติการเช่า:</strong> {selectedTenant.rental_history}</p>
              <p><strong>พฤติกรรม:</strong> {selectedTenant.behavior}</p>
              <p><strong>การร้องเรียน:</strong> {selectedTenant.complaints}</p>
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={closeModal}
              >
                ปิด
              </button>
            </div>
          </div>
        )}
      </div>

      {showEditModal && editTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">แก้ไขข้อมูลผู้เช่า</h2>
            <label className="block mb-2">
              ชื่อ:
              <input type="text" name="full_name" value={editTenant.full_name} onChange={handleEditChange} className="w-full p-2 border rounded" />
            </label>
            <label className="block mb-2">
              เบอร์โทร:
              <input type="text" name="phone" value={editTenant.phone} onChange={handleEditChange} className="w-full p-2 border rounded" />
            </label>
            <label className="block mb-2">
              อีเมล:
              <input type="email" name="email" value={editTenant.email} onChange={handleEditChange} className="w-full p-2 border rounded" />
            </label>
            <label className="block mb-2">
              ประวัติการเช่า:
              <input type="text" name="rental_history" value={editTenant.rental_history} onChange={handleEditChange} className="w-full p-2 border rounded" />
            </label>
            <label className="block mb-2">
              พฤติกรรม:
              <input type="text" name="behavior" value={editTenant.behavior} onChange={handleEditChange} className="w-full p-2 border rounded" />
            </label>
            <label className="block mb-2">
              การร้องเรียน:
              <input type="number" name="complaints" value={editTenant.complaints} onChange={handleEditChange} className="w-full p-2 border rounded" />
            </label>
            <div className="mt-4 flex justify-end">
              <button onClick={saveEditTenant} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2">บันทึก</button>
              <button onClick={closeEditModal} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

    </AdminSidebar>
  );
};

export default TenantManagement;