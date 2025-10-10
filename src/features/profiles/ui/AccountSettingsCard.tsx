import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useMemo } from 'react';
import { useTranslation } from '../../../i18n';
import { Profile } from '../model/types';
import LanguageSelect, { LanguageOption } from './LanguageSelect';
import BillingButton from './BillingButton';
import VisibilityToggle from './VisibilityToggle';
import DangerZone from './DangerZone';
import { AccountSettingsSkeleton } from './Skeletons';

type AccountSettingsCardProps = {
  profile?: Profile;
  loading?: boolean;
  languageOptions: LanguageOption[];
  onChangeLanguage?: (language: string) => void;
  onToggleVisibility?: (visible: boolean) => void;
  onManageBilling?: () => void;
  onSignOut?: () => void;
  onRemoveAccount?: () => void;
  disableActions?: boolean;
};

export default function AccountSettingsCard({
  profile,
  loading,
  languageOptions,
  onChangeLanguage,
  onToggleVisibility,
  onManageBilling,
  onSignOut,
  onRemoveAccount,
  disableActions,
}: AccountSettingsCardProps) {
  const { t } = useTranslation();
  const resolvedLanguage = useMemo(() => profile?.language ?? languageOptions[0]?.value ?? 'en', [
    profile?.language,
    languageOptions,
  ]);

  return (
    <Card>
      <CardHeader
        title={
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {t('profile.settings.title', { defaultValue: 'Account settings' })}
          </Typography>
        }
        subheader={t('profile.settings.subtitle', {
          defaultValue: 'Update language, visibility, billing, and account status.',
        })}
      />
      <Divider />
      <CardContent>
        {loading ? (
          <AccountSettingsSkeleton />
        ) : (
          <Stack spacing={4}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {t('profile.settings.language', { defaultValue: 'Language preference' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('profile.settings.languageDescription', {
                  defaultValue: 'Choose the language used across the app.',
                })}
              </Typography>
              <LanguageSelect
                value={resolvedLanguage}
                options={languageOptions}
                onChange={onChangeLanguage}
                disabled={disableActions}
              />
            </Stack>

            <VisibilityToggle
              checked={profile?.visibility ?? true}
              disabled={disableActions}
              onChange={onToggleVisibility}
            />

            <Stack spacing={1.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {t('profile.settings.billing', { defaultValue: 'Billing & membership' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('profile.settings.billingDescription', {
                  defaultValue: 'Manage your premium subscription and invoices.',
                })}
              </Typography>
              <BillingButton onClick={onManageBilling} disabled={disableActions} />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {t('profile.settings.sessionTitle', { defaultValue: 'Session' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('profile.settings.sessionDescription', {
                  defaultValue: 'Sign out to switch accounts or secure your profile.',
                })}
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<LogoutOutlinedIcon />}
                onClick={onSignOut}
                disabled={disableActions}
              >
                {t('app.signOut', { defaultValue: 'Sign out' })}
              </Button>
            </Stack>

            <DangerZone onRemove={onRemoveAccount} disabled={disableActions} />
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
