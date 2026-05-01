import { createContext, useContext } from 'react';

export interface FormContextType {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
  setErrors: (errors: Record<string, string>) => void;
  setTouched: (touched: Record<string, boolean>) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setIsDirty: (isDirty: boolean) => void;
}

const FormContext = createContext<FormContextType | null>(null);

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}

export { FormContext };
export default FormContext;
