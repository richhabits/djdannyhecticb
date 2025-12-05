import { useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

interface FormAnalyticsOptions {
  formName: string;
  formId?: string;
}

export function useFormAnalytics({ formName, formId }: FormAnalyticsOptions) {
  const startTimeRef = useRef<number>(Date.now());
  const fieldInteractionsRef = useRef<Set<string>>(new Set());
  const errorsRef = useRef<number>(0);
  const trackEvent = trpc.analytics.track.useMutation();

  const trackFieldInteraction = (fieldName: string) => {
    fieldInteractionsRef.current.add(fieldName);
  };

  const trackError = () => {
    errorsRef.current++;
  };

  const trackSubmit = (success: boolean, fields?: Record<string, any>) => {
    const timeToComplete = Math.round((Date.now() - startTimeRef.current) / 1000);
    
    trackEvent.mutate({
      eventType: "form_submission",
      eventName: `${formName} - ${success ? "Success" : "Error"}`,
      properties: {
        formName,
        formId,
        timeToComplete,
        fieldsInteracted: fieldInteractionsRef.current.size,
        errors: errorsRef.current,
        success,
        fields: fields ? Object.keys(fields).length : 0,
      },
    });
  };

  const trackConversion = (step: string, data?: Record<string, any>) => {
    trackEvent.mutate({
      eventType: "form_conversion",
      eventName: `${formName} - ${step}`,
      properties: {
        formName,
        formId,
        step,
        ...data,
      },
    });
  };

  return {
    trackFieldInteraction,
    trackError,
    trackSubmit,
    trackConversion,
  };
}
