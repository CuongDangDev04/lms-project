import { createInstructor, updateUser, getInstructors, uploadInstructors } from "../../services/userServices";
import { deactivateAccount } from "../../services/authServices";
import { ManagerEntity } from "../../components/admin/ManagerEntity";

export const InstructorsManager = (props) => {
    const defaultConfig = {
        title: "Quản lý Giảng Viên",
        fetchEntities: getInstructors,
        createEntity: createInstructor,
        updateEntity: updateUser,
        uploadEntities: uploadInstructors,
        deactivateAccount: deactivateAccount,
        entityType: "Giảng Viên",
        fields: [
            { name: "username", label: "Mã giảng viên", type: "text" },
            { name: "password", label: "Mật khẩu", type: "password", hidden: true, editable: true },
            { name: "email", label: "Email", type: "email" },
            { name: "fullname", label: "Họ và Tên", type: "text" },
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
            entityType={config.entityType}
            fields={config.fields}
            deactivateAccount={config.deactivateAccount}
            idField={config.idField}
            showStatusColumn={true}
        />
    );
};