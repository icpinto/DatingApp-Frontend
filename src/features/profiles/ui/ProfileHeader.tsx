import { Stack, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTranslation } from '../../../i18n';

export default function ProfileHeader() {
  const { t } = useTranslation();

  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <Stack spacing={0.75} flex={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t('profile.overview.title', { defaultValue: 'Your Profile' })}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('profile.overview.subtitle', {
            defaultValue: 'Track your progress, manage account preferences, and explore safety resources in one place.',
          })}
        </Typography>
      </Stack>
      <InfoOutlinedIcon color="primary" sx={{ fontSize: 32 }} />
    </Stack>
  );
}
