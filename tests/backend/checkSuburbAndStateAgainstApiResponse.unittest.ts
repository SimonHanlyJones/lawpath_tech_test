import { checkSuburbAndStateAgainstApiResponse } from "@/app/lib/serverSide/austpostPostcodeValidator/austpostPostcodeValidatorFunctions";

describe("checkSuburbAndStateAgainstApiResponse", () => {
  const mockResponse = [
    { location: "Sydney", state: "NSW", postcode: 2000 },
    { location: "Bondi", state: "NSW", postcode: 2026 },
  ];

  it("validates correctly for a perfect match", () => {
    const result = checkSuburbAndStateAgainstApiResponse(
      "Sydney",
      "NSW",
      mockResponse
    );
    expect(result).toEqual({
      valid: true,
      reason: "",
      badPostcode: false,
      badState: false,
      badSuburb: false,
    });
  });

  it("returns invalid for correct suburb but wrong state", () => {
    const result = checkSuburbAndStateAgainstApiResponse(
      "Sydney",
      "VIC",
      mockResponse
    );
    expect(result).toEqual({
      valid: false,
      reason:
        "The provided postcode and suburb does not appear to exist in the provided state. Please check you have entered the correct state.",
      badPostcode: false,
      badState: true,
      badSuburb: false,
    });
  });

  it("returns invalid for no match", () => {
    const result = checkSuburbAndStateAgainstApiResponse(
      "Melbourne",
      "VIC",
      mockResponse
    );
    expect(result).toEqual({
      valid: false,
      reason:
        "The provided suburb does not appear to match the postcode. Please check the postcode and suburb.",
      badPostcode: true,
      badState: true,
      badSuburb: true,
    });
  });

  it("returns invalid for an empty response array", () => {
    const result = checkSuburbAndStateAgainstApiResponse("Sydney", "NSW", []);
    expect(result).toEqual({
      valid: false,
      reason:
        "The provided postcode does not match any suburb. Please check the postcode.",
      badPostcode: true,
      badState: true,
      badSuburb: true,
    });
  });
});
