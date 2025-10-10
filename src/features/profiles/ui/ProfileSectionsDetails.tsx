import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useTranslation } from '../../../i18n';
import type { SectionKey } from '../model/types';

type DisplayableSectionKey = SectionKey | 'verification';

type SectionDefinition = {
  key: DisplayableSectionKey;
  titleKey: string;
};

const SECTION_DEFINITIONS: SectionDefinition[] = [
  { key: 'verification', titleKey: 'profile.headers.verification' },
  { key: 'personal', titleKey: 'profile.headers.personal' },
  { key: 'residency', titleKey: 'profile.headers.residency' },
  { key: 'education', titleKey: 'profile.headers.education' },
  { key: 'family', titleKey: 'profile.headers.family' },
  { key: 'horoscope', titleKey: 'profile.headers.horoscope' },
];

type SectionRecord = Record<string, unknown>;

type ProfileSectionsDetailsProps = {
  data?: Partial<Record<DisplayableSectionKey, SectionRecord>> & { profile_image?: string };
};

const normalizeValue = (
  value: unknown,
  translate: (key: string, options?: Record<string, unknown>) => string
): string | string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item, translate) as string);
  }
  if (typeof value === 'boolean') {
    return value
      ? translate('common.boolean.true', { defaultValue: 'Yes' })
      : translate('common.boolean.false', { defaultValue: 'No' });
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

const isEmptyValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'string') {
    return value.trim().length === 0;
  }
  return value === null || value === undefined;
};

const formatLabel = (label: string) =>
  label
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function ProfileSectionsDetails({ data }: ProfileSectionsDetailsProps) {
  const { t } = useTranslation();
  const availableSections = SECTION_DEFINITIONS.filter(({ key }) => {
    const section = data?.[key];
    if (!section || typeof section !== 'object') {
      return false;
    }
    return Object.values(section).some((value) => !isEmptyValue(value));
  });

  if (availableSections.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t('common.messages.noAdditionalInfo', { defaultValue: 'No additional information provided yet.' })}
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {availableSections.map(({ key, titleKey }) => {
        const section = data?.[key] || {};
        const fields = Object.entries(section).filter(([, value]) => !isEmptyValue(value));
        const isComplete = fields.length > 0;

        return (
          <Accordion key={key} disableGutters elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t(titleKey)}
                </Typography>
                {isComplete && <CheckCircleOutlineIcon color="success" fontSize="small" />}
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1.5}>
                {fields.map(([field, value]) => {
                  const normalized = normalizeValue(value, t);
                  return (
                    <Stack key={field} spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        {t(`profile.fields.${field}`, {
                          defaultValue: formatLabel(field),
                        })}
                      </Typography>
                      {Array.isArray(normalized) ? (
                        <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
                          {normalized.map((item, index) => (
                            <Chip key={`${field}-${index}`} label={item} size="small" />
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body1">{normalized}</Typography>
                      )}
                    </Stack>
                  );
                })}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
}
