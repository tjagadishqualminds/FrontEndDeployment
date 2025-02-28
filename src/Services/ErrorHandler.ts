export const handleLoginError = (errorType: string | undefined): string => {
    const messages: Record<string, string> = {
      InvalidId: 'Your ID is invalid.',
      InvalidEmail: 'Your email is invalid.',
      InvalidPassword: 'You have entered the wrong password.',
      default: 'Invalid login credentials.'
    };
  
    return messages[errorType || 'default'] || messages.default;
  };
  