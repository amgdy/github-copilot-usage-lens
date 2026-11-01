export type { LicenseKind, LicenseParse, LicenseSeat, SeatSource } from './types';
export { parseLicenseFile, parseLicenseValue } from './parse';
export { SNIFF_CHARS, classifyUpload, looksLikeLicenseFile, type UploadKind } from './detect';
export { mergeSeats } from './merge';
export { isLoginLike, loginKey, readLogin } from './login';
export { readPlan } from './plan';
export { earlierDay, laterDay, readDay, todayIso } from './dates';
export {
  applyLicenseImport,
  entryFromSeat,
  mergeRoster,
  rosterFromParse,
  rosterFromSeats,
  sanitizeRoster,
  sanitizeRosterDetailed,
  type ImportResult,
  type RosterMode,
  type SanitizedRoster,
} from './roster';
export {
  RECENT_DAYS,
  RECLAIM_DAYS,
  STALE_EXPORT_DAYS,
  buildLicenseIndex,
  dayOf,
  entryLicense,
  isNewSeat,
  profileLicense,
  seatActivity,
  type ActivityStatus,
  type AsOfSource,
  type LicenseIndex,
  type ProfileLicense,
  type SeatActivity,
} from './activity';
export {
  buildLicenseReport,
  lastUsageDays,
  type LicenseFinding,
  type LicenseReport,
  type ReclaimReason,
  type UnmatchedUser,
} from './insights';
export { activityStatusText, licenseKindText, reclaimReasonText } from './labels';
