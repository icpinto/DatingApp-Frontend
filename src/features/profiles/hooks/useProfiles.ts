import { useMutation, useQuery, useQueryClient } from 'lib/react-query';
import * as api from '../api/profiles.api';
import type { ProfileSectionUpdate } from '../model/types';

const key = {
  profile: ['profiles', 'profile'] as const,
  sections: ['profiles', 'sections'] as const,
};

export function useProfile() {
  return useQuery({ queryKey: key.profile, queryFn: api.getProfile });
}

export function useSections() {
  return useQuery({ queryKey: key.sections, queryFn: api.getSections });
}

export function useUpdateSection() {
  const qc = useQueryClient();
  return useMutation<ProfileSectionUpdate, unknown>({
    mutationFn: api.updateSection,
    onSuccess: () => qc.invalidateQueries({ queryKey: key.sections }),
  });
}

export function useVisibility() {
  const qc = useQueryClient();
  return useMutation<boolean, unknown>({
    mutationFn: api.setVisibility,
    onSuccess: () => qc.invalidateQueries({ queryKey: key.profile }),
  });
}

export function useRemoveAccount() {
  return useMutation<void, unknown>({ mutationFn: api.removeAccount });
}

export { key as profilesQueryKey };
