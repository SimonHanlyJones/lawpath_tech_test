export interface AddressFormState {
  validationAi: boolean;
  postcode: string;
  suburb: string;
  geographicState: string;
  postcodeError: string;
  suburbError: string;
  geographicStateError: string;
  isLoading: boolean;
  isValid: boolean | undefined;
  reasonInvalid: string | undefined;
  badGeographicState: boolean;
  badPostcode: boolean;
  badSuburb: boolean;
}
