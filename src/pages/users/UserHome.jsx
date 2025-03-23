import { useState } from "react";
import MainContent from "../../components/users/MainContent";
import SideBarMobile from "../../components/users/SideBarMobile";

const UserHome = () => {
  const [documentCount, setDocumentCount] = useState(3);
  const [assignmentCount, setAssignmentCount] = useState(2);

  return (
    <div className="flex bg-gray-50 lg:flex-col pt-20 scroll-smooth">
      <MainContent
        setDocumentCount={setDocumentCount}
        setAssignmentCount={setAssignmentCount}
      />
      <SideBarMobile/>
    </div>
  );
};

export default UserHome;
