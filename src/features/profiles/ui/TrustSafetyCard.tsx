import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useTranslation } from '../../../i18n';

const TRUST_SECTIONS = ['privacy', 'fairPlay', 'membership', 'support'] as const;

type TrustSectionKey = (typeof TRUST_SECTIONS)[number];

type TrustSectionContent = {
  key: TrustSectionKey;
  title: string;
  body: string;
};

function useTrustSections(): TrustSectionContent[] {
  const { t } = useTranslation();
  return TRUST_SECTIONS.map((key) => ({
    key,
    title: t(`profile.trust.${key}.title`, {
      defaultValue:
        key === 'privacy'
          ? 'Privacy & data safety'
          : key === 'fairPlay'
          ? 'Fair play guarantee'
          : key === 'membership'
          ? 'Membership support'
          : 'Help & community care',
    }),
    body: t(`profile.trust.${key}.body`, {
      defaultValue:
        key === 'privacy'
          ? 'Control who sees your profile and learn how we protect your personal information.'
          : key === 'fairPlay'
          ? 'Understand our guidelines for respectful communication and reporting tools.'
          : key === 'membership'
          ? 'Get answers about billing, subscriptions, and upgrading your experience.'
          : 'Reach out to our support team or browse common questions for quick help.',
    }),
  }));
}

export default function TrustSafetyCard() {
  const { t } = useTranslation();
  const sections = useTrustSections();

  return (
    <Card>
      <CardHeader
        avatar={<ShieldOutlinedIcon color="primary" fontSize="large" />}
        title={
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {t('profile.trust.title', { defaultValue: 'Trust & Safety' })}
          </Typography>
        }
        subheader={t('profile.trust.subtitle', {
          defaultValue: 'Stay informed about privacy, safety tools, and support resources.',
        })}
      />
      <Divider />
      <CardContent>
        <Stack spacing={1.5}>
          {sections.map((section) => (
            <Accordion key={section.key} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {section.title}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {section.body}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
