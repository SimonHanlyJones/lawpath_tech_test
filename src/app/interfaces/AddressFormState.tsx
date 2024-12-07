"use client";
// TODO implement badFields for red errored fields

export interface AddressFormState {
  validationAi: boolean;
  postcode: string;
  suburb: string;
  geographicState: string;
  postcodeError: string;
  suburbError: string;
  geographicStateError: string;
  formError: string;
  isLoading: boolean;
  isValid: boolean | undefined;
  reasonInvalid: string | undefined;
  badFields: string[];
}
