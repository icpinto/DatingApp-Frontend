import { Button } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { useTranslation } from '../../../i18n';

type BillingButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
};

export default function BillingButton({ onClick, disabled }: BillingButtonProps) {
  const { t } = useTranslation();

  return (
    <Button variant="contained" startIcon={<CreditCardIcon />} onClick={onClick} disabled={disabled}>
      {t('profile.settings.manageBilling', { defaultValue: 'Manage billing' })}
    </Button>
  );
}
