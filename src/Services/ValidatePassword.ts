export const validatePassword = (password: string): {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  specialCharacter: boolean;
} => {
  const length = password.length >= 8;
  const uppercase = /[A-Z]/.test(password);
  const lowercase = /[a-z]/.test(password);
  const number = /[0-9]/.test(password);
  const specialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return { length, uppercase, lowercase, number, specialCharacter };
};