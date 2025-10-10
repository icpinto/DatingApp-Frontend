import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack } from '@mui/material';
import ProfileHeader from '../ui/ProfileHeader';
import ProfileOverviewCard from '../ui/ProfileOverviewCard';
import AccountSettingsCard from '../ui/AccountSettingsCard';
import TrustSafetyCard from '../ui/TrustSafetyCard';
import { useProfile, useSections, useVisibility, useRemoveAccount } from '../hooks/useProfiles';
import { useTranslation, languageOptions } from '../../../i18n';
import type { LanguageOption } from '../ui/LanguageSelect';
import type { SectionKey } from '../model/types';

export default function ProfilesPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { data: profile, isLoading: loadingProfile } = useProfile();
  const { data: sections, isLoading: loadingSections } = useSections();
  const toggleVisibility = useVisibility();
  const removeAccount = useRemoveAccount();

  const options = useMemo<LanguageOption[]>(
    () =>
      languageOptions.map((option) => ({
        value: option.code,
        label: t(option.labelKey, { defaultValue: option.labelKey }),
      })),
    [t]
  );

  const handleLanguageChange = useCallback(
    (nextLanguage: string) => {
      i18n.changeLanguage(nextLanguage);
    },
    [i18n]
  );

  const handleVisibilityToggle = useCallback(
    (visible: boolean) => {
      toggleVisibility.mutate(visible);
    },
    [toggleVisibility]
  );

  const handleManageBilling = useCallback(() => {
    navigate('/payment');
  }, [navigate]);

  const handleSignOut = useCallback(() => {
    localStorage.removeItem('token');
    window.dispatchEvent(new CustomEvent('auth-token-changed', { detail: { token: null } }));
    navigate('/login');
  }, [navigate]);

  const handleRemoveAccount = useCallback(() => {
    removeAccount.mutate();
  }, [removeAccount]);

  const handleEditSection = useCallback(
    (key: SectionKey) => {
      navigate(`/home?tab=profile&section=${key}`);
    },
    [navigate]
  );

  const disableActions = toggleVisibility.isPending || removeAccount.isPending;

  return (
    <Stack spacing={4}>
      <ProfileHeader />
      <ProfileOverviewCard sections={sections} loading={loadingSections} onEdit={handleEditSection} />
      <AccountSettingsCard
        profile={profile}
        loading={loadingProfile}
        languageOptions={options}
        onChangeLanguage={handleLanguageChange}
        onToggleVisibility={handleVisibilityToggle}
        onManageBilling={handleManageBilling}
        onSignOut={handleSignOut}
        onRemoveAccount={handleRemoveAccount}
        disableActions={disableActions}
      />
      <TrustSafetyCard />
    </Stack>
  );
}
