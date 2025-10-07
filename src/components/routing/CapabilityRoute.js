import React, { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";

const buildRequirementList = (requirements) => {
  if (!requirements) {
    return [];
  }

  if (Array.isArray(requirements)) {
    return requirements.filter(Boolean);
  }

  return [requirements].filter(Boolean);
};

const DefaultFallback = ({ reason }) => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2>Access restricted</h2>
    {reason ? <p>{reason}</p> : <p>This area is currently unavailable for your account.</p>}
  </div>
);

const CapabilityRoute = ({
  capability,
  capabilities,
  children,
  redirect,
  fallback: FallbackComponent = DefaultFallback,
}) => {
  const { hasCapability, getReason } = useUserContext();
  const requirementList = useMemo(
    () => buildRequirementList(capabilities ?? capability),
    [capability, capabilities]
  );

  const isAllowed = useMemo(() => {
    if (!requirementList.length) {
      return true;
    }
    return requirementList.every((key) => hasCapability(key));
  }, [requirementList, hasCapability]);

  if (isAllowed) {
    return <>{children}</>;
  }

  const firstReason = requirementList
    .map((key) => getReason(key))
    .find((value) => typeof value === "string" && value.trim().length > 0);

  if (redirect) {
    return <Navigate to={redirect} replace />;
  }

  return <FallbackComponent reason={firstReason} />;
};

export default CapabilityRoute;
