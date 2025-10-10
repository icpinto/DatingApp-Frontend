import { Button, Stack, Typography } from '@mui/material';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { useTranslation } from '../../../i18n';

type DangerZoneProps = {
  onRemove?: () => void;
  disabled?: boolean;
};

export default function DangerZone({ onRemove, disabled }: DangerZoneProps) {
  const { t } = useTranslation();

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1" color="error" sx={{ fontWeight: 600 }}>
        {t('profile.settings.dangerZoneTitle', { defaultValue: 'Danger zone' })}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('profile.settings.dangerZoneDescription', {
          defaultValue: 'Removing your account will permanently delete your matches, conversations, and preferences.',
        })}
      </Typography>
      <Button
        variant="outlined"
        color="error"
        startIcon={<DeleteForeverOutlinedIcon />}
        onClick={onRemove}
        disabled={disabled}
      >
        {t('profile.settings.removeAccount', { defaultValue: 'Remove account' })}
      </Button>
    </Stack>
  );
}
