import { LinearProgress, linearProgressClasses, styled } from '@mui/material';

type ProgressBarProps = {
  value: number;
  colorStart?: string;
  colorEnd?: string;
};

const GradientProgress = styled(LinearProgress, {
  shouldForwardProp: (prop) => prop !== 'colorStart' && prop !== 'colorEnd',
})<{ colorStart?: string; colorEnd?: string }>(({ colorStart = '#a855f7', colorEnd = '#ec4899' }) => ({
  height: 10,
  borderRadius: 999,
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 999,
    backgroundImage: `linear-gradient(90deg, ${colorStart}, ${colorEnd})`,
  },
}));

export default function ProgressBar({ value, colorStart, colorEnd }: ProgressBarProps) {
  return <GradientProgress variant="determinate" value={value} colorStart={colorStart} colorEnd={colorEnd} />;
}
