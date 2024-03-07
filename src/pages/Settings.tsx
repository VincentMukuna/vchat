import SettingsList from "../features/Settings/SettingsList";
import Sidebar, { SideBarHeader } from "../features/Sidebar/Sidebar";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";

export default function () {
  return (
    <AuthenticatedLayout>
      <Sidebar>
        <SideBarHeader title={"Settings"} className="" />
        <SettingsList />
      </Sidebar>
    </AuthenticatedLayout>
  );
}
