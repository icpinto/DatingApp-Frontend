import { MenuItem, TextField } from '@mui/material';

export type LanguageOption = {
  value: string;
  label: string;
};

type LanguageSelectProps = {
  value?: string;
  options: LanguageOption[];
  onChange?: (value: string) => void;
  disabled?: boolean;
};

export default function LanguageSelect({ value, options, onChange, disabled }: LanguageSelectProps) {
  return (
    <TextField
      select
      fullWidth
      size="small"
      value={value ?? ''}
      onChange={(event) => onChange?.(event.target.value)}
      disabled={disabled}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
