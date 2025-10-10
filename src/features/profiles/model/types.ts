export type SectionKey =
  | 'identity'
  | 'personal'
  | 'residency'
  | 'education'
  | 'family'
  | 'horoscope';

export type SectionProgress = {
  key: SectionKey;
  title: string;
  completed: number;
  total: number;
  percent: number;
};

export type Sections = SectionProgress[];

export type Profile = {
  visibility: boolean;
  language: string;
  createdAt: string;
};

export type ProfileSectionUpdate = {
  section: SectionKey;
  data: Record<string, unknown>;
};
