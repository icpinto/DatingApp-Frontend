import { http } from '../../../shared/lib/http';
import { Profile, ProfileSectionUpdate, Sections } from '../model/types';

export const getProfile = async (): Promise<Profile> => http.get('/me/profile');

export const getSections = async (): Promise<Sections> => http.get('/me/profile/sections');

export const updateSection = async (payload: ProfileSectionUpdate) =>
  http.patch(`/me/profile/${payload.section}`, payload.data);

export const setVisibility = async (visible: boolean) =>
  http.patch('/me/profile/visibility', { visible });

export const removeAccount = async () => http.post('/me/profile/remove', {});
