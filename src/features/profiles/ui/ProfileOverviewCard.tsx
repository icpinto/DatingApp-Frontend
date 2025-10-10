import { Card, CardContent, CardHeader, Divider, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from '../../../i18n';
import { Sections } from '../model/types';
import SectionCard from './SectionCard';
import EmptyState from './EmptyState';
import { ProfileOverviewSkeleton } from './Skeletons';

type ProfileOverviewCardProps = {
  sections?: Sections;
  loading?: boolean;
  onEdit?: (key: Sections[number]['key']) => void;
};

export default function ProfileOverviewCard({ sections, loading, onEdit }: ProfileOverviewCardProps) {
  const { t } = useTranslation();

  const content = useMemo(() => {
    if (loading) {
      return <ProfileOverviewSkeleton />;
    }

    if (!sections || sections.length === 0) {
      return <EmptyState />;
    }

    return (
      <Stack spacing={2.5}>
        {sections.map((section) => (
          <SectionCard
            key={section.key}
            title={section.title}
            percent={section.percent}
            completed={section.completed}
            total={section.total}
            onEdit={onEdit ? () => onEdit(section.key) : undefined}
          />
        ))}
      </Stack>
    );
  }, [loading, onEdit, sections]);

  return (
    <Card>
      <CardHeader
        title={
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {t('profile.overview.cardTitle', { defaultValue: 'Profile overview' })}
          </Typography>
        }
        subheader={t('profile.overview.cardSubtitle', {
          defaultValue: 'Complete each section to make your profile stand out.',
        })}
      />
      <Divider />
      <CardContent>{content}</CardContent>
    </Card>
  );
}
