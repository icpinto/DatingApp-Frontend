import React from "react";
import { useUserContext } from "./UserContext";

const Guard = ({ can, fallback = null, children }) => {
  const { hasCapability } = useUserContext();

  const requirements = React.useMemo(() => {
    if (!can) {
      return [];
    }
    return Array.isArray(can) ? can.filter(Boolean) : [can];
  }, [can]);

  const isAllowed = React.useMemo(() => {
    if (requirements.length === 0) {
      return true;
    }
    return requirements.every((capability) => hasCapability(capability));
  }, [requirements, hasCapability]);

  if (typeof children === "function") {
    return <>{children({ isAllowed })}</>;
  }

  if (isAllowed) {
    return <>{children}</>;
  }

  if (typeof fallback === "function") {
    return <>{fallback({ isAllowed })}</>;
  }

  return <>{fallback}</>;
};

export default Guard;
