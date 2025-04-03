import { ManagerEntity } from "../../components/admin/ManagerEntity";
import { getClasses, createClass, createClassByExcel, updateClass, deleteClass } from "../../services/classesServices";

export const ClassesManager = (props) => {
    const defaultConfig = {
        title: "Quản lý Lớp",
        fetchEntities: getClasses,
        createEntity: createClass,
        updateEntity: updateClass,
        deleteEntity: deleteClass,
        uploadEntities: createClassByExcel,
        entityType: "Lớp",
        fields: [
            { name: "class_name", label: "Tên Lớp Học", type: "text" },
        ],
        idField: "class_id",
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