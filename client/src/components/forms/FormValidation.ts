export interface ValidationRule {
  type:
    | 'required'
    | 'email'
    | 'minLength'
    | 'maxLength'
    | 'pattern'
    | 'custom'
    | 'number'
    | 'min'
    | 'max';
  message: string;
  value?: string | number;
  validator?: (value: string) => boolean;
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule[];
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return /^[\d\s\-\+\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function validateMinLength(value: string, min: number): boolean {
  return value.length >= min;
}

export function validateMaxLength(value: string, max: number): boolean {
  return value.length <= max;
}

export function validateNumber(value: string): boolean {
  return !isNaN(Number(value)) && value.trim().length > 0;
}

export function validateMin(value: string, min: number): boolean {
  const num = Number(value);
  return !isNaN(num) && num >= min;
}

export function validateMax(value: string, max: number): boolean {
  const num = Number(value);
  return !isNaN(num) && num <= max;
}

export function validatePattern(value: string, pattern: string): boolean {
  return new RegExp(pattern).test(value);
}

export function validateField(
  value: string,
  rules: ValidationRule[]
): string | undefined {
  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (!validateRequired(value)) {
          return rule.message;
        }
        break;

      case 'email':
        if (value && !validateEmail(value)) {
          return rule.message;
        }
        break;

      case 'minLength':
        if (value && !validateMinLength(value, rule.value as number)) {
          return rule.message;
        }
        break;

      case 'maxLength':
        if (!validateMaxLength(value, rule.value as number)) {
          return rule.message;
        }
        break;

      case 'number':
        if (value && !validateNumber(value)) {
          return rule.message;
        }
        break;

      case 'min':
        if (value && !validateMin(value, rule.value as number)) {
          return rule.message;
        }
        break;

      case 'max':
        if (value && !validateMax(value, rule.value as number)) {
          return rule.message;
        }
        break;

      case 'pattern':
        if (value && !validatePattern(value, rule.value as string)) {
          return rule.message;
        }
        break;

      case 'custom':
        if (rule.validator && !rule.validator(value)) {
          return rule.message;
        }
        break;
    }
  }

  return undefined;
}

export function validateForm(
  formData: Record<string, string>,
  validationRules: FieldValidation
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const [fieldName, rules] of Object.entries(validationRules)) {
    const error = validateField(formData[fieldName] || '', rules);
    if (error) {
      errors[fieldName] = error;
    }
  }

  return errors;
}
