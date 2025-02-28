export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? null : 'Invalid Email (please enter a valid email address).';
};

export const validatePassword = (password: string): string | null => {
  return password.length >= 6 ? null : 'Password must be at least 6 characters long.';
};

export const validateCandidateId = (candidateId: string): string | null => {
  const candidateIdRegex = /^\d{5}$/; 
  return candidateIdRegex.test(candidateId) ? null : 'Candidate Id is invalid. It must be a 5-digit number.';
};


export const validateVoterId = (voterId: string): string | null => {
  const voterIdRegex = /^[A-Z]{2}\d{8}$/;
  return voterIdRegex.test(voterId) ? null : 'Voter Id is invalid';
};
