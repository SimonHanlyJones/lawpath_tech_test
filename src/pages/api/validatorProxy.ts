import { graphql, buildSchema } from "graphql";
import { NextApiRequest, NextApiResponse } from "next";

import { GraphQlSearchPostcodeArgs } from "../../app/interfaces/GraphQlSearchPostcodeArgs";
import {
  callAustraliaPostApiPostcode,
  checkSuburbAndStateAgainstApiResponse,
} from "@/app/lib/serverSide/austpostPostcodeValidator/austpostPostcodeValidatorFunctions";

import { SearchPostcodeInterface } from "@/app/interfaces/SearchPostcodeInterface";
import { openAiAddressValidator } from "@/app/lib/serverSide/openAiPostcodeValidator/openAiPostcodeValidatorFunctions";

const schema = buildSchema(`
  type PostcodeValidationResult {
    valid: Boolean
    reason: String
    badPostcode: Boolean
    badState: Boolean
    badSuburb: Boolean
  }

  type Query {
    searchPostcode(suburb: String!, postcode: String!, state: String!, useAi: Boolean!): PostcodeValidationResult
  }
`);

/**
 * Resolves a postcode search by utilizing either the Australia Post API or an AI validator,
 * based on the `useAi` flag. If `useAi` is false, it calls the Australia Post API to verify
 * the postcode, suburb, and state, and returns the validation result. If `useAi` is true, it
 * leverages an AI-based validator to perform the validation and returns the result.
 *
 * @param {GraphQlSearchPostcodeArgs} args - The arguments containing the suburb, postcode,
 * state, and a flag to determine whether to use AI for validation.
 * @returns {Promise<SearchPostcodeInterface>} - The validation result containing validity
 * status and error reasons, if any.
 */
const rootValue = {
  searchPostcode: async ({
    suburb,
    postcode,
    state,
    useAi,
  }: GraphQlSearchPostcodeArgs): Promise<
    SearchPostcodeInterface | undefined
  > => {
    if (!useAi) {
      const ausPostResponse = await callAustraliaPostApiPostcode(postcode);
      const response = checkSuburbAndStateAgainstApiResponse(
        suburb,
        state,
        ausPostResponse
      );
      return response;
    }

    if (useAi) {
      const response = await openAiAddressValidator(postcode, suburb, state);
      return response;
    }
  },
};

/**
 * API handler for GraphQL queries to validate Australian postcodes.
 *
 * This handler processes POST requests with a GraphQL query that validates
 * postcodes, suburbs, and states using either the Australia Post API or an
 * AI-based validator. The API ensures the presence of required variables
 * (suburb, postcode, state) in the request body before executing the query.
 *
 * Supported query:
 * - `searchPostcode`: Validates a postcode, suburb, and state using either the
 *   Australia Post API or AI, based on the `useAi` flag.
 *
 * @param {NextApiRequest} req - The HTTP request object from Next.js.
 *    - Expected body:
 *      - `query`: The GraphQL query string.
 *      - `variables`: An object containing:
 *          - `suburb`: Name of the suburb (required).
 *          - `postcode`: Postcode to validate (required).
 *          - `state`: State abbreviation (required).
 *          - `useAi`: Boolean flag to use AI for validation (optional).
 * @param {NextApiResponse} res - The HTTP response object from Next.js.
 *    - Responds with:
 *      - 200: JSON response with GraphQL execution results if successful.
 *      - 400: Bad request if required fields are missing or malformed.
 *      - 405: Method not allowed if the request method is not POST.
 *      - 500: Internal server error if GraphQL execution fails.
 *
 * Example usage:
 * ```json
 * {
 *   "query": "query ($suburb: String!, $postcode: String!, $state: String!, $useAi: Boolean!) { searchPostcode(suburb: $suburb, postcode: $postcode, state: $state, useAi: $useAi) { valid reason badPostcode badState badSuburb } }",
 *   "variables": {
 *     "suburb": "Melbourne",
 *     "postcode": "3000",
 *     "state": "VIC",
 *     "useAi": false
 *   }
 * }
 * ```
 *
 * @returns {void}
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).send("Only POST requests allowed");
    return;
  }
  const { query, variables } = req.body;
  if (!query) {
    res.status(400).send("Bad request");
    return;
  }
  if (!variables || !variables.suburb || variables.suburb === "") {
    res.status(400).send("Bad request, missing suburb");
    return;
  }

  if (!variables || !variables.postcode || variables.postcode === "") {
    res.status(400).send("Bad request, missing postcode");
    return;
  }

  if (!variables || !variables.state || variables.state === "") {
    res.status(400).send("Bad request, missing state");
    return;
  }

  try {
    const response = await graphql({
      schema,
      source: query,
      rootValue,
      variableValues: variables,
    });
    if (response.errors) {
      console.error("errors:", response.errors);
      res.status(500).json({ errors: response.errors });
      return;
    }
    res.status(200).json(response);
  } catch (error) {
    console.error("Error executing GraphQL query:", error);
    res.status(500).send("Internal server error");
  }
  return;
}
