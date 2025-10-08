import React from "react";
import { useUserCapabilities } from "../context/UserContext";

const Guard = ({ can, fallback = null, children }) => {
  const { select } = useUserCapabilities();

  const requirements = React.useMemo(() => {
    if (!can) {
      return [];
    }
    return Array.isArray(can) ? can.filter(Boolean) : [can];
  }, [can]);

  const selection = React.useMemo(() => {
    if (!requirements.length) {
      return [];
    }
    return select(requirements);
  }, [requirements, select]);

  const isAllowed = React.useMemo(() => {
    if (requirements.length === 0) {
      return true;
    }
    return selection.every((entry) => entry?.can);
  }, [requirements, selection]);

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
