import { FaSortUp, FaSortDown, FaEdit, FaTrash, FaUsers, FaCalendar, FaBook, FaGift, FaBell } from "react-icons/fa";

export const EntityTable = ({
  entities,
  fields,
  idField,
  showStatusColumn,
  sortConfig,
  onSort,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  // Hàm để render giá trị của field
  const renderFieldValue = (entity, field) => {
    if (field.type === "date") {
      return new Date(entity[field.name]).toLocaleDateString("vi-VN");
    }
    if (field.name === "gender") {
      return entity[field.name] ? "Nam" : "Nữ";
    }
    return entity[field.name];
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Dạng bảng cho màn hình lớn (md trở lên) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gradient-to-r from-teal-500 to-cyan-500">
            <tr>
              {[
                { label: "ID", key: idField },
                ...fields.filter((field) => !field.hidden),
                ...(showStatusColumn ? [{ label: "Trạng Thái", key: "user_status" }] : []),
                { label: "Hành động", key: null },
              ].map((header) => (
                <th
                  key={header.label}
                  className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-widest cursor-pointer min-w-[120px]"
                  onClick={header.key ? () => onSort(header.key) : undefined}
                >
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    {header.label}
                    {header.key && sortConfig.key === header.key && (
                      sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entities.map((entity, index) => (
              <tr
                key={entity[idField]}
                className={`transition-all duration-300 ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-teal-50`}
              >
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {entity[idField]}
                </td>
                {fields
                  .filter((field) => !field.hidden)
                  .map((field) => (
                    <td
                      key={field.name}
                      className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap"
                    >
                      {renderFieldValue(entity, field)}
                    </td>
                  ))}
                {showStatusColumn && (
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={entity.user_status || false}
                        onChange={() =>
                          onToggleStatus(entity[idField], entity.user_status || false)
                        }
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                    </label>
                  </td>
                )}
                <td className="px-4 py-4 whitespace-nowrap text-sm flex gap-3">
                  <button
                    onClick={() => onEdit(entity)}
                    className="p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200 transition-all duration-300 transform hover:scale-110"
                  >
                    <FaEdit size={16} />
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(entity[idField])}
                      className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-all duration-300 transform hover:scale-110"
                    >
                      <FaTrash size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dạng thẻ cho màn hình nhỏ (dưới md) */}
      <div className="block md:hidden p-4 space-y-4">
        {entities.map((entity) => (
          <div
            key={entity[idField]}
            className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
          >
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900">
                ID: {entity[idField]}
              </p>
              {fields
                .filter((field) => !field.hidden)
                .map((field) => (
                  <p key={field.name} className="text-sm text-gray-700">
                    <span className="font-medium">{field.label || field.name}:</span>{" "}
                    {renderFieldValue(entity, field)}
                  </p>
                ))}
              {showStatusColumn && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Trạng Thái:</span>{" "}
                  {entity.user_status ? "Mở Đăng Ký" : "Đóng Đăng Ký"}
                </p>
              )}
            </div>
            {/* Các nút hành động */}
                <button
                  onClick={() => onEdit(entity)}
                  className="p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200 transition-all duration-300 transform hover:scale-110"
                >
                  <FaEdit size={16} />
                </button>
                {onDelete && (
                  <button
                    onClick={() => onDelete(entity[idField])}
                    className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-all duration-300 transform hover:scale-110"
                  >
                    <FaTrash size={16} />
                  </button>
                )}
          </div>
        ))}
      </div>
    </div>
  );
};