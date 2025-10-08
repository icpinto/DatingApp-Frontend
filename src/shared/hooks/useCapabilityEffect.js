import { useEffect, useMemo } from "react";
import { useUserCapabilities } from "../context/UserContext";

const normalizeCapabilities = (capabilities) => {
  if (!capabilities) {
    return [];
  }
  if (Array.isArray(capabilities)) {
    return capabilities.filter(Boolean);
  }
  return [capabilities];
};

const useCapabilityEffect = (
  capabilities,
  effect,
  deps = [],
  { enabled = true } = {}
) => {
  const { hasCapability } = useUserCapabilities();

  const capabilityList = useMemo(
    () => normalizeCapabilities(capabilities),
    [capabilities]
  );

  const canRun = useMemo(() => {
    if (!enabled) {
      return false;
    }
    if (capabilityList.length === 0) {
      return true;
    }
    if (!hasCapability) {
      return false;
    }
    return capabilityList.every((capability) => hasCapability(capability));
  }, [capabilityList, enabled, hasCapability]);

  useEffect(() => {
    if (!canRun) {
      return undefined;
    }

    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRun, ...deps]);

  return canRun;
};

export default useCapabilityEffect;
