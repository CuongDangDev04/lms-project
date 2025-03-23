import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMemberOnClassroom } from "../../services/memberServices";

export default function Member() {
    const { classroomId } = useParams();
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const fetchMembers = async () => {
            const member = await fetchMemberOnClassroom(classroomId);
            setMembers(member);
        };
        fetchMembers();
    }, [classroomId]);

    return (
        <div className="container mx-auto p-6 bg-gradient-to-br from-gray-100 to-white min-h-screen">
            {/* Tiêu đề */}
            <h1 className="text-3xl font-semibold text-gray-800 mb-6 border-b-2 border-indigo-500 pb-2">
                Số lượng thành viên {members.length}
            </h1>

      {/* Ô tìm kiếm */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Nhập vào để enter để tìm kiếm"
          className="w-full p-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
        />
      </div>

            {/* Bảng danh sách thành viên */}
            <div className="overflow-x-auto rounded-lg shadow-lg">
                <table className="w-full text-left bg-white">
                    <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <tr>
                            <th className="p-4 border-b">Mã số sinh viên</th>
                            <th className="p-4 border-b">Email</th>
                            <th className="p-4 border-b">Họ và tên</th>
                            <th className="p-4 border-b">Giới tính</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((member, index) => {
                            const username = member.username;
                            const email = member.email;
                            const fullname = member.fullname;
                            const gender = member.gender;
                            return (
                                <tr
                                    key={member.username || index} // Sử dụng username nếu duy nhất, hoặc index làm fallback
                                    className="hover:bg-indigo-50 transition duration-300"
                                >
                                    <td className="p-4 border-b text-gray-700">{username}</td>
                                    <td className="p-4 border-b text-gray-700">{email}</td>
                                    <td className="p-4 border-b text-gray-700">{fullname}</td>
                                    <td className="p-4 border-b text-gray-700">{gender ? 'Nam' : 'Nữ'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}