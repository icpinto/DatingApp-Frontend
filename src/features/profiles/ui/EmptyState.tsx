import { Box, Typography } from '@mui/material';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import { useTranslation } from '../../../i18n';

export default function EmptyState() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 3,
        textAlign: 'center',
        color: 'text.secondary',
      }}
    >
      <HourglassEmptyOutlinedIcon sx={{ fontSize: 48, mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {t('profile.sections.emptyTitle', { defaultValue: 'No sections yet' })}
      </Typography>
      <Typography variant="body2">
        {t('profile.sections.emptySubtitle', {
          defaultValue: 'Start completing your profile to see progress and unlock more matches.',
        })}
      </Typography>
    </Box>
  );
}
