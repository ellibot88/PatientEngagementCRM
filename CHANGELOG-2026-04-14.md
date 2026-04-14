# PatientEngagementCRM — Dataset Migration (2026-04-14)

## Context

Migrated the app from the old employee-style dataset (`7f0ac090-c4d7-4364-87c4-ffdac5282d0a`) to a new appointments dataset in the **modocorp** Domo instance (`4aa1d00e-cc74-40f6-89a3-3f6c1eb1a176`).

### New Dataset

- **Name:** VTV - Appointments Schema
- **Instance:** modocorp
- **ID:** `4aa1d00e-cc74-40f6-89a3-3f6c1eb1a176`

**All columns:**

| Column | Type | Displayed |
|--------|------|-----------|
| Patient Account Number | LONG | Yes |
| Patient First Name | STRING | Yes |
| Patient Last Name | STRING | Yes |
| Patient Phone | STRING | Yes |
| Patient Date Of Birth | DATE | Yes |
| Resources | STRING | No (excluded per request) |
| Location | STRING | No (excluded per request) |
| Appointment Type Name | STRING | No (excluded per request) |

## Files Changed

### `public/manifest.json`
- Updated `dataSetId` from `7f0ac090-...` to `4aa1d00e-...`

### `src/types.ts`
- Replaced `Patient` interface fields (`ID`, `FULL_NAME`, `JOB_TITLE`, `DEPARTMENT`, `BUSINESS_UNIT`, `EMAIL`, `CURRENT_SALARY`) with new dataset fields (`Patient Account Number`, `Patient First Name`, `Patient Last Name`, `Patient Phone`, `Patient Date Of Birth`)

### `src/services/patients.ts`
- Updated query `select()` to fetch the 5 included columns
- Changed `orderBy` from `FULL_NAME` to `Patient Last Name`
- Rewrote `searchPatients()` to query both first and last name fields in parallel and deduplicate results by `Patient Account Number`

### `src/components/PatientTable.tsx`
- Updated table headers: Account #, First Name, Last Name, Phone, Date of Birth
- Changed row key from `p.ID` to `p['Patient Account Number']`
- Updated `patientStates.get()` lookup to use `String(p['Patient Account Number'])`

### `src/components/PatientRow.tsx`
- Replaced old cell rendering (`FULL_NAME`, `JOB_TITLE`, `EMAIL`) with new fields
- Removed `patient-name-cell` / `patient-name` CSS classes from first name cell to fix column alignment issue

### `src/App.tsx`
- Added `patientKey()` and `patientDisplayName()` helpers to derive the string ID and combined name from split fields
- Updated all engagement log calls (`logAssign`, `logUnassign`, `logCalled`, `logUncalled`, `logComment`) and the comment modal to use the new helpers

## Bug Fix

The first name column had misaligned cells because it retained `patient-name-cell` and `patient-name` CSS classes from the old layout. These classes applied extra styling (padding/font-weight) that caused the data cells to be wider than the header. Removed the classes so the column renders as a plain `<td>`.
