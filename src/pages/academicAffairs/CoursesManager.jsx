import { ManagerEntity } from "../../components/admin/ManagerEntity";
import { getCourses, createCourse, updateCourse, deleteCourse, createCourseByExcel } from "../../services/courseServices";

export const CoursesManager = (props) => {
    const defaultConfig = {
        title: "Quản lý Khóa Học",
        fetchEntities: getCourses,
        createEntity: createCourse,
        updateEntity: updateCourse,
        deleteEntity: deleteCourse,
        uploadEntities: createCourseByExcel,
        entityType: "Khóa Học",
        fields: [
            { name: "course_code", label: "Mã Học Phần", type: "text" },
            { name: "course_name", label: "Tên Khóa Học", type: "text" },
            { name: "description", label: "Mô Tả", type: "text" }
        ],
        idField: "course_id",
    };

    // Gộp props mặc định với props từ bên ngoài (nếu có)
    const config = { ...defaultConfig, ...props };

    return (
        <ManagerEntity
            title={config.title}
            fetchEntities={config.fetchEntities}
            createEntity={config.createEntity}
            updateEntity={config.updateEntity}
            deleteEntity={config.deleteEntity}
            uploadEntities={config.uploadEntities}
            entityType={config.entityType}
            fields={config.fields}
            idField={config.idField}
            
        />
    );
};