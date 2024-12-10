import { gql } from "@apollo/client";
import client from "./apolloClient";
import { SearchPostcodeInterface } from "../../interfaces/frontendBackendCommunication/SearchPostcodeInterface";

const SEARCH_POSTCODE_QUERY = gql`
  query SearchPostcode(
    $suburb: String!
    $postcode: String!
    $state: String!
    $useAi: Boolean!
  ) {
    searchPostcode(
      suburb: $suburb
      postcode: $postcode
      state: $state
      useAi: $useAi
    ) {
      valid
      reason
      badPostcode
      badState
      badSuburb
    }
  }
`;

/**
 * Calls the postcodeValidator GraphQL API to validate a postcode, suburb, and state.
 * It returns a {SearchPostcodeInterface} object with the validation result.
 *
 * @param {string} suburb - The suburb to validate
 * @param {string} postcode - The postcode to validate
 * @param {string} state - The state to validate
 * @param {boolean} useAi - A flag indicating whether to use the AI-based validator
 * @returns {Promise<SearchPostcodeInterface>} - A promise that resolves with the validation result
 */
export async function queryPostcodeValidationProxy(
  suburb: string,
  postcode: string,
  state: string,
  useAi: boolean
): Promise<SearchPostcodeInterface> {
  try {
    const { data } = await client.query({
      query: SEARCH_POSTCODE_QUERY,
      variables: { suburb, postcode, state, useAi },
    });

    return {
      valid: data?.searchPostcode?.valid ?? false,
      reason: data?.searchPostcode?.reason ?? "Unknown reason",
      badPostcode: data?.searchPostcode?.badPostcode ?? false,
      badState: data?.searchPostcode?.badState ?? false,
      badSuburb: data?.searchPostcode?.badSuburb ?? false,
    };
  } catch (error: unknown) {
    throw new Error(`Error calling postcodeValidator graphQl: ${error}`);
  }
}
