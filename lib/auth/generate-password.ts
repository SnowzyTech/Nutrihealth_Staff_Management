export function generateSecurePassword(length: number = 12): string {
  // Use characters that are unambiguous and easy to read/type
  // Removed: l, 1, I, O, 0 (easily confused)
  // Using only email-safe symbols that won't cause HTML/URL issues
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I, O
  const lowercase = 'abcdefghjkmnpqrstuvwxyz'; // Removed i, l, o
  const numbers = '23456789'; // Removed 0, 1
  const symbols = '#$%!'; // Reduced to only completely safe symbols (no &, <, >, @, *)
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  // Use crypto for better randomness - works in both Node.js and browser
  const getRandomIndex = (max: number): number => {
    // Use Node.js crypto module for server-side
    if (typeof globalThis !== 'undefined' && typeof globalThis.crypto !== 'undefined') {
      const array = new Uint32Array(1);
      globalThis.crypto.getRandomValues(array);
      return array[0] % max;
    }
    // Fallback for older environments
    return Math.floor(Math.random() * max);
  };
  
  let password = '';
  // Ensure at least one character from each category for password strength
  password += uppercase[getRandomIndex(uppercase.length)];
  password += lowercase[getRandomIndex(lowercase.length)];
  password += numbers[getRandomIndex(numbers.length)];
  password += symbols[getRandomIndex(symbols.length)];
  
  // Fill the rest with random characters from all categories
  for (let i = password.length; i < length; i++) {
    password += allChars[getRandomIndex(allChars.length)];
  }
  
  // Shuffle the password using Fisher-Yates algorithm
  const passwordArray = password.split('');
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = getRandomIndex(i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }
  
  return passwordArray.join('');
}
