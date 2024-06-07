import useUserPrefs, { useUpdateUserPrefs } from "@/lib/hooks/useUserPrefs";
import { Switch } from "@chakra-ui/react";
import { useState } from "react";
import Setting from "./Setting";

export default function AlertSetting() {
  const { shouldAlert } = useUserPrefs();
  const updateUserPrefs = useUpdateUserPrefs();
  const [updating, setUpdating] = useState(false);

  const handleToggleAlert = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdating(true);
    await updateUserPrefs({ shouldAlert: e.target.checked });
    setUpdating(false);
  };
  return (
    <Setting>
      <Setting.Details>
        <Setting.Title>Notification Sounds</Setting.Title>
        <Setting.Description>
          Enable or disable notification sounds
        </Setting.Description>
      </Setting.Details>
      <Switch
        colorScheme="telegram"
        isChecked={shouldAlert === undefined ? false : shouldAlert}
        isDisabled={updating}
        onChange={handleToggleAlert}
      />
    </Setting>
  );
}
