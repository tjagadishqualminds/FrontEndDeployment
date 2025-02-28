import { validateEmail } from './Validation';
import { validatePassword } from '../Services/ValidatePassword';

interface RegistrationErrors {
  fullName?: string;
  dateOfBirth?: string;
  email?: string;
  password?: string | { [key: string]: boolean };
  confirmPassword?: string;
  gender?: string;
  address?: string;
  stateId?: number; 
  constituencyId?: number;
  phoneNumber?: string; 
  aadharNumber?: string; 
  identityProofUrl?: string;
  general?: string;
}

const validateDateOfBirth = (dateOfBirth: string): string | null => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age < 18 ? 'You must be at least 18 years old to register.' : null;
};

export const validateRegistrationData = (data: {
  fullName: string;
  dateOfBirth: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
  address: string;
  stateId: number;
  constituencyId: number;
  phoneNumber: number; 
  aadharNumber: number; 
  identityProofUrl: string;
}): RegistrationErrors => {
  const errors: RegistrationErrors = {};

  // Full Name
  // Full Name Validation
if (!data.fullName) {
  errors.fullName = 'Full Name is required';
} else if (data.fullName.length < 3) {
  errors.fullName = 'Full Name must be at least 3 characters long';
}


  // Date of Birth
  if (!data.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  } else {
    const dobError = validateDateOfBirth(data.dateOfBirth);
    if (dobError) {
      errors.dateOfBirth = dobError;
    }
  }

  // Email
  if (!data.email) {
    errors.email = 'Email is required';
  } else {
    const emailError = validateEmail(data.email);
    if (emailError) {
      errors.email = emailError;
    }
  }

  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  } else {
    const passwordConditions = validatePassword(data.password);
    const passwordErrors: { [key: string]: boolean } = {
      length: !passwordConditions.length,
      uppercase: !passwordConditions.uppercase,
      lowercase: !passwordConditions.lowercase,
      number: !passwordConditions.number,
      specialCharacter: !passwordConditions.specialCharacter,
    };

    const invalidConditions = Object.entries(passwordErrors).filter(([_, isValid]) => isValid);
    if (invalidConditions.length) {
      errors.password = {
        ...passwordErrors,
      };
    }
  }

  // Confirm Password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Confirm Password is required';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Gender
  if (!data.gender) {
    errors.gender = 'Gender is required';
  }

  // Address
  if (!data.address) {
    errors.address = 'Address is required';
  }

  // Phone Number validation
  if (!data.phoneNumber) {
    errors.phoneNumber = 'Phone Number is required.';
  } else if (!/^\d{10}$/.test(data.phoneNumber.toString())) { 
    errors.phoneNumber = 'Phone Number must be exactly 10 digits.';
  }

  // Aadhar Number validation
  if (!data.aadharNumber) {
    errors.aadharNumber = 'Aadhar Number is required.';
  } else if (!/^\d{12}$/.test(data.aadharNumber.toString())) { 
    errors.aadharNumber = 'Aadhar Number must be exactly 12 digits.';
  }
  // Identity Proof (Aadhar File)
  if (!data.identityProofUrl) {
    errors.identityProofUrl = 'Identity Proof (Aadhar) is required';
  }

  return errors;
};
