import { useMemo } from "react";
import { useUserCapabilities } from "../../../shared/context/UserContext";
import { CAPABILITIES } from "../../../domain/capabilities";

export function useOwnerProfileCapabilities() {
  const { groups, select } = useUserCapabilities();
  const ownerProfileCapabilities = groups.ownerProfile;

  const [changeLanguageCapability, signOutCapability] = useMemo(
    () =>
      select([
        CAPABILITIES.APP_CHANGE_LANGUAGE,
        CAPABILITIES.APP_SIGN_OUT,
      ]),
    [select]
  );

  const capabilityReasons = useMemo(
    () => ({
      edit: ownerProfileCapabilities.edit.reason,
      uploadPhoto: ownerProfileCapabilities.uploadPhoto.reason,
      submitIdentity: ownerProfileCapabilities.submitIdentity.reason,
      sendOtp: ownerProfileCapabilities.sendOtp.reason,
      verifyOtp: ownerProfileCapabilities.verifyOtp.reason,
      manageInterests: ownerProfileCapabilities.manageInterests.reason,
      manageLanguages: ownerProfileCapabilities.manageLanguages.reason,
      save: ownerProfileCapabilities.save.reason,
      payments: ownerProfileCapabilities.managePayments.reason,
      toggleVisibility: ownerProfileCapabilities.toggleVisibility.reason,
      removeAccount: ownerProfileCapabilities.removeAccount.reason,
    }),
    [ownerProfileCapabilities]
  );

  return {
    ownerProfileCapabilities,
    capabilityReasons,
    canEditProfile: ownerProfileCapabilities.edit.can,
    canUploadPhoto: ownerProfileCapabilities.uploadPhoto.can,
    canSubmitIdentity: ownerProfileCapabilities.submitIdentity.can,
    canSendOtp: ownerProfileCapabilities.sendOtp.can,
    canVerifyOtp: ownerProfileCapabilities.verifyOtp.can,
    canManageInterests: ownerProfileCapabilities.manageInterests.can,
    canManageLanguages: ownerProfileCapabilities.manageLanguages.can,
    canSaveProfile: ownerProfileCapabilities.save.can,
    canManagePayments: ownerProfileCapabilities.managePayments.can,
    canToggleVisibility: ownerProfileCapabilities.toggleVisibility.can,
    canRemoveAccount: ownerProfileCapabilities.removeAccount.can,
    canChangeLanguage: Boolean(changeLanguageCapability?.can),
    changeLanguageReason: changeLanguageCapability?.reason,
    canSignOut: Boolean(signOutCapability?.can),
    signOutReason: signOutCapability?.reason,
  };
}

export default useOwnerProfileCapabilities;
