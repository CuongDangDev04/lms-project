import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ModalCustom } from "./ui/ModalCustom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUpload } from "react-icons/fa";
import Pagination from "./Pagination";
import { EntityTable } from "./EntityTable";
import { EntityForm } from "./EntityForm";
import { fi } from "date-fns/locale";
import LoadingBar from "../users/LoadingBar";

export const ManagerEntity = ({
  title,
  fetchEntities,
  createEntity,
  updateEntity,
  deleteEntity, // Có thể undefined nếu không được truyền
  uploadEntities,
  deactivateAccount,
  entityType,
  fields,
  idField = "user_id",
  showStatusColumn = false,
}) => {
  const [entities, setEntities] = useState([]);
  const [filteredEntities, setFilteredEntities] = useState([]);
  const [formData, setFormData] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
  );
  const [editFormData, setEditFormData] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), { [idField]: "" })
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const entitiesPerPage = 6;

  const location = useLocation();

  useEffect(() => {
    document.title = `BrainHub | ${title}`;
    fetchEntitiesData();
  }, [location.pathname]);

  const fetchEntitiesData = async () => {
    setLoading(true);
    try {
      const entities = await fetchEntities();
      if (!Array.isArray(entities)) throw new Error("Dữ liệu từ API không hợp lệ");
      setEntities(entities);
      setFilteredEntities(entities);
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách ${entityType}:`, error);
      toast.error(`Lỗi khi tải dữ liệu ${entityType}!`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setCurrentPage(1);
    const filtered = entities.filter((entity) =>
      fields.some(
        (field) =>
          !field.hidden &&
          entity[field.name]?.toString().toLowerCase().includes(term)
      )
    );
    setFilteredEntities(filtered);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
    const sorted = [...filteredEntities].sort((a, b) => {
      if (key === idField || (key === "user_status" && showStatusColumn)) {
        return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
      }
      const aValue = a[key] || "";
      const bValue = b[key] || "";
      return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });
    setFilteredEntities(sorted);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleEditChange = (e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createEntity(formData);
      setFormData(fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {}));
      fetchEntitiesData();
      setIsOpen(false);
      toast.success(`Thêm ${entityType} thành công!`);
    } catch (error) {
      toast.error(`Có lỗi xảy ra khi thêm ${entityType}!`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateEntity(editFormData[idField], editFormData);
      fetchEntitiesData();
      setIsEditOpen(false);
      toast.info(`Cập nhật ${entityType} thành công!`);
    } catch (error) {
      toast.error(`Có lỗi xảy ra khi cập nhật ${entityType}!`);
    }
  };

  const handleDelete = async () => {
    if (!deleteEntity) return; // Không làm gì nếu deleteEntity không được cung cấp
    try {
      await deleteEntity(deleteId);
      fetchEntitiesData();
      setIsDeleteOpen(false);
      toast.success(`Xóa ${entityType} thành công!`);
      if (paginatedEntities.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      toast.error(`Có lỗi xảy ra khi xóa ${entityType}!`);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (!id || !showStatusColumn) return;
    try {
      const newStatus = !currentStatus;
      await deactivateAccount(id, newStatus);
      fetchEntitiesData();
      toast.success(`${newStatus ? "Kích hoạt" : "Vô hiệu hóa"} ${entityType} thành công!`);
    } catch (error) {
      toast.error(`Có lỗi xảy ra khi ${newStatus ? "kích hoạt" : "vô hiệu hóa"} ${entityType}!`);
    }
  };

  const openEditModal = (entity) => {
    const formattedData = fields.reduce((acc, field) => {
      let value = entity[field.name] ?? "";
      if (field.name === "birth" && value) {
        const date = new Date(value);
        value = isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
      } else if (field.name === "gender") {
        value = entity[field.name] === "true" || entity[field.name] === 1 || entity[field.name] === "Nam" ? true : false;
      } else if (field.name === "password") {
        value = ""; // Đặt password thành chuỗi rỗng khi chỉnh sửa
      }
      return { ...acc, [field.name]: value };
    }, { [idField]: entity[idField] });
    setEditFormData(formattedData);
    setIsEditOpen(true);
  };

  const openDeleteModal = (id) => {
    if (!deleteEntity) return; // Không mở modal nếu deleteEntity không tồn tại
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Vui lòng chọn file Excel trước khi upload!");
      return;
    }
    setUploadLoading(true);
    try {
      await uploadEntities(selectedFile);
      fetchEntitiesData();
      setIsUploadOpen(false);
      setSelectedFile(null);
      toast.success(`Thêm nhiều ${entityType.toLowerCase()} bằng file Excel thành công!`);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi upload file Excel!");
    } finally {
      setUploadLoading(false);
    }
  };

  const indexOfLastEntity = currentPage * entitiesPerPage;
  const indexOfFirstEntity = indexOfLastEntity - entitiesPerPage;
  const paginatedEntities = filteredEntities.slice(indexOfFirstEntity, indexOfLastEntity);
  const totalPages = Math.ceil(filteredEntities.length / entitiesPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-10 gap-4 sm:gap-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 tracking-tight text-center sm:text-left">
            {title}
          </h2>
          <LoadingBar isLoading={loading || uploadLoading} />
          <div className="flex gap-4">
            <ModalCustom
              title={`Thêm ${entityType} Mới`}
              triggerText={`Thêm ${entityType}`}
              triggerClass="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg font-semibold transform hover:-translate-y-1 text-sm sm:text-base"
              open={isOpen}
              onOpenChange={setIsOpen}
            />
            <ModalCustom
              title={`Upload danh sách ${entityType.toLowerCase()}`}
              triggerText={`Import danh sách ${entityType}`}
              triggerClass="bg-gradient-to-r from-green-800 to-teal-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg font-semibold transform hover:-translate-y-1 text-sm sm:text-base flex items-center gap-2"
              open={isUploadOpen}
              onOpenChange={setIsUploadOpen}
              triggerIcon={<FaUpload />}
            >
              <form onSubmit={handleUpload} className="space-y-4 sm:space-y-6 p-2 sm:p-4">
                <div className="relative group">
                  <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-1.5">
                    Chọn file Excel
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="w-full p-3 sm:p-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl text-center cursor-pointer hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-sm hover:shadow-md text-sm sm:text-base flex items-center justify-center gap-2"
                    >
                      <FaUpload size={16} />
                      {selectedFile ? selectedFile.name : "Chọn file Excel"}
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2 sm:py-3 rounded-full hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg font-semibold transform hover:-translate-y-1 text-sm sm:text-base"
                >
                  Upload
                </button>
              </form>
            </ModalCustom>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder={`Tìm kiếm ${entityType}...`}
            className="w-full p-3 sm:p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm sm:text-base"
          />
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Đang tải dữ liệu...</div>
        ) : paginatedEntities.length === 0 ? (
          <div className="text-center text-gray-600 p-4 bg-white rounded-lg shadow">
            Không tìm thấy {entityType.toLowerCase()} nào.
          </div>
        ) : (
          <>
            <EntityForm
              title={`Thêm ${entityType} Mới`}
              fields={fields}
              formData={formData}
              onChange={handleChange}
              onSubmit={handleCreate}
              isOpen={isOpen}
              onOpenChange={setIsOpen}
            />
            <EntityForm
              title={`Chỉnh Sửa ${entityType}`}
              fields={fields}
              formData={editFormData}
              onChange={handleEditChange}
              onSubmit={handleUpdate}
              isOpen={isEditOpen}
              onOpenChange={setIsEditOpen}
            />
            {deleteEntity && (
              <ModalCustom
                title="Xác Nhận Xóa"
                triggerText=""
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
              >
                <div className="space-y-6 sm:space-y-8 p-4">
                  <p className="text-gray-600 text-center font-medium text-sm sm:text-base">
                    {`Bạn có chắc chắn muốn xóa ${entityType} này?`}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                    <button
                      onClick={() => setIsDeleteOpen(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all duration-300 font-medium transform hover:-translate-y-1 text-sm sm:text-base"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg font-medium transform hover:-translate-y-1 text-sm sm:text-base"
                    >
                      Xác Nhận Xóa
                    </button>
                  </div>
                </div>
              </ModalCustom>
            )}
            <EntityTable
              entities={paginatedEntities}
              fields={fields}
              idField={idField}
              showStatusColumn={showStatusColumn}
              sortConfig={sortConfig}
              onSort={handleSort}
              onEdit={openEditModal}
              onDelete={deleteEntity ? openDeleteModal : null}
              onToggleStatus={handleToggleStatus}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          limit={1}
          theme="light"
          className="mt-4 sm:mt-6"
        />
      </div>
    </div>
  );
};