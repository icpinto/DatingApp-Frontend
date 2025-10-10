import { Stack, Switch, Typography } from '@mui/material';
import { useTranslation } from '../../../i18n';

type VisibilityToggleProps = {
  checked?: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
};

export default function VisibilityToggle({ checked = false, disabled, onChange }: VisibilityToggleProps) {
  const { t } = useTranslation();

  return (
    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
      <Stack spacing={0.5}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {t('profile.settings.visibilityTitle', { defaultValue: 'Profile visibility' })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('profile.settings.visibilityDescription', {
            defaultValue: 'Hide your profile while keeping your progress saved.',
          })}
        </Typography>
      </Stack>
      <Switch
        checked={checked}
        onChange={(event) => onChange?.(event.target.checked)}
        disabled={disabled}
        inputProps={{ 'aria-label': t('profile.settings.visibilityLabel', { defaultValue: 'Toggle visibility' }) }}
      />
    </Stack>
  );
}
