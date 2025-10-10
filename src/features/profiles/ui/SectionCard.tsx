import { Box, Button, Stack, Typography } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useTranslation } from '../../../i18n';
import ProgressBar from './ProgressBar';

type SectionCardProps = {
  title: string;
  percent: number;
  completed: number;
  total: number;
  onEdit?: () => void;
};

export default function SectionCard({ title, percent, completed, total, onEdit }: SectionCardProps) {
  const { t } = useTranslation();
  const isComplete = total > 0 && completed >= total;

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(236, 72, 153, 0.05))',
      }}
    >
      <Stack spacing={1} flex={1} minWidth={0}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
            {title}
          </Typography>
          {isComplete && <CheckCircleOutlineIcon color="success" fontSize="small" />}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {t('profile.sections.completionLabel', {
            defaultValue: '{{completed}}/{{total}} fields complete',
            completed,
            total,
          })}
        </Typography>
        <Box sx={{ width: '100%' }}>
          <ProgressBar value={percent} />
        </Box>
      </Stack>
      {onEdit && (
        <Button
          variant="outlined"
          startIcon={<EditOutlinedIcon />}
          onClick={onEdit}
          sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
        >
          {t('profile.sections.edit', { defaultValue: 'Edit' })}
        </Button>
      )}
    </Stack>
  );
}
