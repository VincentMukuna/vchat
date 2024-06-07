import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { UserPrefs } from "@/types/interfaces";

export default function useUserPrefs() {
  const { currentUser } = useAuth();
  const userPrefs = currentUser!.prefs;
  return userPrefs;
}

export function useUpdateUserPrefs() {
  const { setCurrentUser } = useAuth();
  const prefs = useUserPrefs();

  async function updatePrefs(newPrefs: Partial<UserPrefs>) {
    const user = await api.updatePrefs({ ...prefs, ...newPrefs });
    setCurrentUser(user);
  }

  return updatePrefs;
}
