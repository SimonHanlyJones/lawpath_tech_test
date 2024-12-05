import { gql } from "@apollo/client";
import client from "./apolloClient";

const SEARCH_POSTCODE_QUERY = gql`
  query SearchPostcode($suburb: String!, $postcode: String!, $state: String!) {
    searchPostcode(suburb: $suburb, postcode: $postcode, state: $state) {
      valid
      reason
      badPostcode
      badState
      badSuburb
    }
  }
`;

export interface SearchPostcodeInterface {
  valid: boolean;
  reason: string | undefined;
  badPostcode: boolean;
  badState: boolean;
  badSuburb: boolean;
}

export async function queryPostcodeValidationProxyNoAI(
  suburb: string,
  postcode: string,
  state: string
): Promise<SearchPostcodeInterface> {
  try {
    const { data } = await client.query({
      query: SEARCH_POSTCODE_QUERY,
      variables: { suburb, postcode, state },
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
