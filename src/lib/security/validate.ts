/**
 * Input validation and security bounds checking.
 */

export interface ValidationBounds {
  maxTextLength?: number;
  maxFileSizeMb?: number;
  allowedExtensions?: string[];
}

const DEFAULT_BOUNDS: ValidationBounds = {
  maxTextLength: 150000, // 150,000 chars (~30,000 words)
  maxFileSizeMb: 10,     // 10 MB
  allowedExtensions: ['.pdf', '.docx', '.txt'],
};

export function validateInputPayload(
  text?: string,
  fileName?: string,
  fileSizeBytes?: number,
  customBounds?: ValidationBounds
): { isValid: boolean; error?: string } {
  const bounds = { ...DEFAULT_BOUNDS, ...customBounds };

  if (text && text.length > bounds.maxTextLength!) {
    return {
      isValid: false,
      error: `Payload exceeds maximum character limit of ${bounds.maxTextLength} characters.`,
    };
  }

  if (fileSizeBytes && fileSizeBytes > bounds.maxFileSizeMb! * 1024 * 1024) {
    return {
      isValid: false,
      error: `File size exceeds maximum limit of ${bounds.maxFileSizeMb} MB.`,
    };
  }

  if (fileName) {
    const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    if (!bounds.allowedExtensions!.includes(ext)) {
      return {
        isValid: false,
        error: `Unsupported file format '${ext}'. Allowed formats: ${bounds.allowedExtensions!.join(', ')}`,
      };
    }
  }

  return { isValid: true };
}
