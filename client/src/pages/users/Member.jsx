import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMemberOnClassroom } from "../../services/memberServices";

export default function Member() {
  const { classroomId } = useParams();
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.title = "Danh sách thành viên - BrainHub";
    const fetchMembers = async () => {
      const member = await fetchMemberOnClassroom(classroomId);
      setMembers(member);
    };
    fetchMembers();
  }, [classroomId]);

  // Lọc danh sách thành viên dựa trên từ khóa tìm kiếm
  const filteredMembers = members.filter(
    (member) =>
      member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto mt-6 p-6 bg-gradient-to-br from-gray-100 to-white min-h-screen">
      {/* Tiêu đề */}
      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-500 to-teal-500 text-transparent bg-clip-text">
        Số lượng thành viên {filteredMembers.length}
      </h1>

      {/* Ô tìm kiếm */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Nhập vào để tìm kiếm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
        />
      </div>

      {/* Dạng bảng cho màn hình lớn (md trở lên) */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow-lg">
        <table className="w-full text-left bg-white">
          <thead className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
            <tr>
              <th className="p-4 border-b text-xs font-semibold uppercase tracking-widest">
                Mã số sinh viên
              </th>
              <th className="p-4 border-b text-xs font-semibold uppercase tracking-widest">
                Email
              </th>
              <th className="p-4 border-b text-xs font-semibold uppercase tracking-widest">
                Họ và tên
              </th>
              <th className="p-4 border-b text-xs font-semibold uppercase tracking-widest">
                Giới tính
              </th>
              <th className="p-4 border-b text-xs font-semibold uppercase tracking-widest">
                Vai trò
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member, index) => (
              <tr
                key={member.username || index}
                className="hover:bg-indigo-50 transition duration-300"
              >
                <td className="p-4 border-b text-gray-700">{member.username}</td>
                <td className="p-4 border-b text-gray-700">{member.email}</td>
                <td className="p-4 border-b text-gray-700">{member.fullname}</td>
                <td className="p-4 border-b text-gray-700">
                  {member.gender ? "Nam" : "Nữ"}
                </td>
                <td className="p-4 border-b text-gray-700">
                  {member.Role?.role_name ? "Sinh viên" : "Không xác định"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dạng thẻ cho màn hình nhỏ (dưới md) */}
      <div className="block md:hidden space-y-4">
        {filteredMembers.map((member) => (
          <div
            key={member.username || member.email}
            className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
          >
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900">
                Mã số sinh viên: {member.username}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Email:</span> {member.email}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Họ và tên:</span> {member.fullname}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Giới tính:</span>{" "}
                {member.gender ? "Nam" : "Nữ"}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Vai trò:</span>{" "}
                {member.Role?.role_name ? "Sinh viên" : "Không xác định"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}