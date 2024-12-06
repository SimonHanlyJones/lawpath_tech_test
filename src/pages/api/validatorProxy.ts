import { graphql, buildSchema } from "graphql";
import axios from "axios";
import { SearchPostcodeInterface } from "@/app/lib/clientSide/postcodeValidatorFunctions";
import { NextApiRequest, NextApiResponse } from "next";
import { openAiAddressValidator } from "@/app/lib/serverSide/openAIValidatorFunctions";

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

// interface AuspostPostcodeSearchApiResponse {
//   localities: {
//     locality: [
//       {
//         category: string;
//         id: number;
//         latitude: number;
//         location: string;
//         longitude: number;
//         postcode: number;
//         state: string;
//       }
//     ];
//   };
// }

interface AuspostParsedResponse {
  location: string;
  state: string;
  postcode: number;
}

export async function callAustraliaPostApiPostcode(
  postcode: string
): Promise<AuspostParsedResponse[]> {
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
    const parsedResponse: AuspostParsedResponse[] = unpackedResponse.map(
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

export function checkSuburbAndStateAgainstApiResponse(
  suburb: string,
  inputState: string,
  response: AuspostParsedResponse[]
): SearchPostcodeInterface {
  // if there are no matching postcodes
  if (response.length === 0) {
    return {
      valid: false,
      reason:
        "the provided postcode does not match any suburb. Please check the postcode.",
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
      "the provided suburb does not appear to match the postcode. Please check the postcode and suburb.",
    badPostcode: true,
    badState: true,
    badSuburb: true,
  };
}

type GraphQlSearchPostcodeArgs = {
  suburb: string;
  postcode: string;
  state: string;
  useAi: boolean;
};

const rootValue = {
  searchPostcode: async ({
    suburb,
    postcode,
    state,
    useAi,
  }: GraphQlSearchPostcodeArgs) => {
    console.log("useAi", useAi);
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

  console.log(variables);

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
