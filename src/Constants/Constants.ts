export const Roles = {
  Voter: 1,
  Candidate: 2,
  Admin: 3
}

export const FIELD_KEYS = {
  PHONE_NUMBER: 'phoneNumber',
  FULL_NAME: 'fullName',
  EMAIL: 'email',
  ADDRESS: 'address',
  GENDER: 'gender',
  AADHAR_NUMBER: 'aadharNumber'
} as const

export interface UserDetails {
  id: number
  fullName: string
  email: string
  phoneNumber: string
  aadharNumber: string
  address: string
  gender: string
}

export type FieldKey = keyof UserDetails

export const CandidateStatus = {
  Approved: 0,
  Pending: 1,
  Rejected: 2,
} as const;


export const CandidateNominationStatus = {
  Approved: 1,
  Pending: 2,
  Rejected: 3,
} as const;