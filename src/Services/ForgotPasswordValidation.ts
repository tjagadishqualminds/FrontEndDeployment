export function validateForgotPasswordData(voterIdOrEmail: string): { [key: string]: string } {
  const errors: { [key: string]: string } = {};

  if (!voterIdOrEmail) {
    errors.voterId = 'Voter Id or Email is required.';
    return errors;
  }

  if (voterIdOrEmail.includes('@')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(voterIdOrEmail)) {
      errors.voterId = 'Invalid Email (please enter a valid email address).';
    }
  } else {
    const voterIdRegex = /^[A-Z]{2}\d{8}$/;
    if (!voterIdRegex.test(voterIdOrEmail)) {
      errors.voterId = 'Voter Id is invalid. It must start with 2 alphabets followed by 8 digits.';
    }
  }
  return errors;
}

export function validateCandidateForgotPasswordData(candidateIdOrEmail: string): { [key: string]: string } {
  const errors: { [key: string]: string } = {};

  if (!candidateIdOrEmail) {
    errors.candidateId = 'Candidate Id or Email is required.';
    return errors;
  }
  if (candidateIdOrEmail.includes('@')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidateIdOrEmail)) {
      errors.candidateId = 'Invalid Email (please enter a valid email address).';
    }
  } else {
    const candidateIdRegex = /^\d{5}$/; 
    if (!candidateIdRegex.test(candidateIdOrEmail)) {
      errors.candidateId = 'Candidate Id must be a 5-digit number';
    }
  }
  return errors;
}

