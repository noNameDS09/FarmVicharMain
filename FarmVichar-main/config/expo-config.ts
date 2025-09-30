// src/config/expo‑constants.ts
import Constants from 'expo-constants';

export const PROJECT_ID: string = (() => {
  // Depending on expo version / config, extra config might reside in different places
  const easProjectId = Constants?.expoConfig?.extra?.eas?.projectId;
  const fallback = Constants?.easConfig?.projectId;
  if (typeof easProjectId === 'string') return easProjectId;
  if (typeof fallback === 'string') return fallback;
  throw new Error('Expo projectId not found in constants. Setup extra.eas.projectId in app config.');
})();
