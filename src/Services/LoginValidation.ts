import { validateEmail, validatePassword, validateCandidateId, validateVoterId } from './Validation';

export const validateLoginData = (candidateIdOrEmail: string, password: string): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  if (!candidateIdOrEmail) {
    errors.CandidateIdOrEmail = 'Candidate ID or Email is required.';
  } else if (candidateIdOrEmail.includes('@')) {
    if (!validateEmail(candidateIdOrEmail)) {
      errors.CandidateIdOrEmail = 'Invalid email address.';
    }
  } else {
    const candidateIdError = validateCandidateId(candidateIdOrEmail);
    if (!/^\d{5}$/.test(candidateIdOrEmail)) {
      errors.CandidateIdOrEmail = 'Candidate ID must be exactly 5 digits.';
    } else if (candidateIdError) {
      errors.CandidateIdOrEmail = candidateIdError;
    }
  }

  if (!password) {
    errors.Password = 'Password is required.';
  } else {
    const passwordError = validatePassword(password);
    if (passwordError) {
      errors.Password = passwordError;
    }
  }

  return errors;
};

export const voterValidateLoginData = (voterIdOrEmail: string, password: string): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  if (!voterIdOrEmail) {
    errors.VoterIdOrEmail = 'Voter ID or Email is required.';
  } 
  else if (voterIdOrEmail.includes('@')) {
    if (!validateEmail(voterIdOrEmail)) {
      errors.VoterIdOrEmail = 'Invalid email address.';
    }
  } 
  else {
    if (voterIdOrEmail.length !== 10) {
      errors.VoterIdOrEmail = 'Voter ID must be exactly 10 characters long.';
    } else {
      const voterIdError = validateVoterId(voterIdOrEmail);
      if (voterIdError) {
        errors.VoterIdOrEmail = voterIdError;
      }
    }
  }

  if (!password) {
    errors.Password = 'Password is required.';
  } else {
    const passwordError = validatePassword(password);
    if (passwordError) {
      errors.Password = passwordError;
    }
  }

  return errors;
};
