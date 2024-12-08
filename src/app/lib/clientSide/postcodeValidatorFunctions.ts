import { gql } from "@apollo/client";
import client from "./apolloClient";
import { SearchPostcodeInterface } from "../../interfaces/frontend-BackendCommunication/SearchPostcodeInterface";

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
