import { useState } from "react";
import { setupApi } from "../api/setup";

export function useSetupStatus() {
  const [needsSetup, setNeedsSetup] = useState(false);

  const checkSetupStatus = async () => {
    try {
      const res = await setupApi.exists();
      setNeedsSetup(!res.managerExists);
    } catch {
      // If the check itself fails (network/server issue), fail safe
      // toward the normal login screen rather than exposing the setup form.
      setNeedsSetup(false);
    }
  };

  return { needsSetup, checkSetupStatus };
}