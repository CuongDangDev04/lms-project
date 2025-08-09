import { ModalCustom } from "../../components/admin/ui/ModalCustom";

export const EntityForm = ({
  title,
  fields,
  formData,
  onChange,
  onSubmit,
  isOpen,
  onOpenChange,
  isEditMode = false, // Thêm prop isEditMode với giá trị mặc định là false
}) => (
  <ModalCustom title={title} triggerText="" open={isOpen} onOpenChange={onOpenChange}>
    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      {fields
        .filter((field) => {
          // Ẩn field password trong modal chỉnh sửa
          if (field.name === "password" && isEditMode) {
            return false;
          }
          // Giữ logic lọc ban đầu cho các field không editable
          return field.editable !== false;
        })
        .map((field) => (
          <div key={field.name} className="relative group">
            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-1.5">
              {field.label}
            </label>
            {field.type === "select" ? (
              <select
                name={field.name}
                value={formData[field.name] === undefined ? "" : formData[field.name]}
                onChange={onChange}
                className="w-full p-3 sm:p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm sm:text-base"
                required={!field.optional}
              >
                <option value="">Chọn {field.label}</option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={onChange}
                placeholder={field.label}
                className="w-full p-3 sm:p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm sm:text-base"
                required={!field.optional}
              />
            )}
          </div>
        ))}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2 sm:py-3 rounded-full hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg font-semibold transform hover:-translate-y-1 text-sm sm:text-base"
      >
        {title.includes("Thêm") ? `Thêm ${title.split(" ")[1]}` : "Cập Nhật"}
      </button>
    </form>
  </ModalCustom>
);