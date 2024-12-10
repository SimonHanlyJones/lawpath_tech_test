import { ParsedResponseFromAusPost } from "@/app/interfaces/backend/ParsedResponseFromAusPost";
import { SearchPostcodeInterface } from "@/app/interfaces/frontendBackendCommunication/SearchPostcodeInterface";
import axios from "axios";

/**
 * Call the AustPost API to validate a postcode.
 *
 * @param {string} postcode the postcode to validate
 * @returns {Promise<ParsedResponseFromAusPost[]>} a promise that resolves to an array of matching locations. Each location is an object with "location", "state", and "postcode" properties. If there are no matching locations an empty array is returned.
 * @throws {Error} if there is an error with the API call or parsing the response
 */
export async function callAustraliaPostApiPostcode(
  postcode: string
): Promise<ParsedResponseFromAusPost[]> {
  try {
    const response = await axios({
      method: "get",
      url: process.env.AUS_POST_POSTCODE_SEARCH_URL,
      headers: {
        "auth-key": process.env.AUS_POST_KEY,
      },
      params: {
        q: postcode,
      },
    });

    if (!response) {
      throw new Error(`AustPost API did not respond`);
    }

    // unpack and parse response to get only what we need, the suburb, state and postcode
    const unpackedResponse = response.data.localities.locality;

    // if we have no matching locations return an empty array
    if (!unpackedResponse) return [];

    // if we have only one location parse appropriately
    if (!Array.isArray(unpackedResponse)) {
      const parsedResponse = [
        {
          location: unpackedResponse.location,
          state: unpackedResponse.state,
          postcode: unpackedResponse.postcode,
        },
      ];
      return parsedResponse;
    }

    // if we have many candidate locations, parse appropriately
    const parsedResponse: ParsedResponseFromAusPost[] = unpackedResponse.map(
      (res: {
        category: string;
        id: number;
        latitude: number;
        location: string;
        longitude: number;
        postcode: number;
        state: string;
      }) => ({
        location: res.location,
        state: res.state,
        postcode: res.postcode,
      })
    );

    return parsedResponse;
  } catch (error) {
    throw new Error(`Error parsing AustPost API call: ${error}`);
  }
}
/**
 * Checks a suburb and state against the response from the AustPost API
 *
 * @param {string} suburb - the suburb to check
 * @param {string} inputState - the state to check
 * @param {ParsedResponseFromAusPost[]} response - the response from the AustPost API
 * @returns {SearchPostcodeInterface} an object with the keys "valid", "reason", "badPostcode", "badState", and "badSuburb"
 * - "valid" is a boolean indicating whether the postcode, suburb, and state are valid
 * - "reason" is a string describing the reason for the validation result
 * - "badPostcode", "badState", and "badSuburb" are booleans indicating which fields are invalid
 */
export function checkSuburbAndStateAgainstApiResponse(
  suburb: string,
  inputState: string,
  response: ParsedResponseFromAusPost[]
): SearchPostcodeInterface {
  // if there are no matching postcodes
  if (response.length === 0) {
    return {
      valid: false,
      reason:
        "The provided postcode does not match any suburb. Please check the postcode.",
      badPostcode: true,
      badState: true,
      badSuburb: true,
    };
  }

  // search for perfect match
  for (const { location, state } of response) {
    if (
      location.toLowerCase() === suburb.toLowerCase() &&
      state.toLowerCase() === inputState.toLowerCase()
    ) {
      return {
        valid: true,
        reason: "",
        badPostcode: false,
        badState: false,
        badSuburb: false,
      };
    }
  }

  // search for partial match -> suburb and postcode, but wrong state
  for (const { location } of response) {
    if (location.toLowerCase() === suburb.toLowerCase()) {
      return {
        valid: false,
        reason:
          "The provided postcode and suburb does not appear to exist in the provided state. Please check you have entered the correct state.",
        badPostcode: false,
        badState: true,
        badSuburb: false,
      };
    }
  }

  // case for no match between postcode and suburb
  return {
    valid: false,
    reason:
      "The provided suburb does not appear to match the postcode. Please check the postcode and suburb.",
    badPostcode: true,
    badState: true,
    badSuburb: true,
  };
}
