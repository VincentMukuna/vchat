import Sidebar, { SideBarHeader } from "../features/Sidebar/Sidebar";
import UsersList from "../features/Users/UsersList";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";

export default function Users() {
  return (
    <AuthenticatedLayout>
      <Sidebar>
        <SideBarHeader title={"Users"} className="" />
        <UsersList className="mt-18 overflow-y-auto px-3" />
      </Sidebar>
    </AuthenticatedLayout>
  );
}

export const Component = Users;
