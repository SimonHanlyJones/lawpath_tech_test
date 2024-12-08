export interface SearchPostcodeInterface {
  valid: boolean;
  reason: string | undefined;
  badPostcode: boolean;
  badState: boolean;
  badSuburb: boolean;
}
