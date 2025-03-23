import { createUser, updateUser, getStudents, uploadStudents } from "../../services/userServices";
import { deactivateAccount } from "../../services/authServices";
import { ManagerEntity } from "../../components/admin/ManagerEntity";

export const StudentsManager = (props) => {
    const defaultConfig = {
        title: "Quản lý Sinh Viên",
        fetchEntities: getStudents,
        createEntity: createUser,
        updateEntity: updateUser,
        // Không truyền deleteEntity để vô hiệu hóa chức năng xóa
        deactivateAccount: deactivateAccount,
        uploadEntities: uploadStudents,
        entityType: "Sinh Viên",
        fields: [
            { name: "username", label: "Mã sinh viên", type: "text" },
            { name: "email", label: "Email", type: "email" },
            { name: "fullname", label: "Họ và Tên", type: "text" },
            { name: "password", label: "Mật khẩu", type: "password", hidden: true, editable: true },
            { name: "birth", label: "Ngày Sinh", type: "date" },
            {
                name: "gender",
                label: "Giới Tính",
                type: "select",
                options: [
                    { label: "Nam", value: true },
                    { label: "Nữ", value: false }
                ]
            }
        ],
        idField: "user_id",
    };

    const config = { ...defaultConfig, ...props };

    return (
        <ManagerEntity
            title={config.title}
            fetchEntities={config.fetchEntities}
            createEntity={config.createEntity}
            updateEntity={config.updateEntity}
            uploadEntities={config.uploadEntities}
            deactivateAccount={config.deactivateAccount}
            entityType={config.entityType}
            fields={config.fields}
            idField={config.idField}
            showStatusColumn={true}
        />
    );
};