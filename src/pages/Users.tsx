import Sidebar, { SideBarHeader } from "../features/Sidebar/Sidebar";
import UsersList from "../features/Users/UsersList";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";

export default function Users() {
  return (
    <AuthenticatedLayout>
      <Sidebar>
        <SideBarHeader title={"Users"} className="" />
        <UsersList className="px-3 overflow-y-auto mt-18" />
      </Sidebar>
    </AuthenticatedLayout>
  );
}
