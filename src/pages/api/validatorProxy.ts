import { graphql, buildSchema } from "graphql";
// import axios from "axios";

const apiURL = "https://digitalapi.auspost.com.au/postcode/search.json";

const schema = buildSchema(`
  type PostcodeValidationResult {
    valid: Boolean
    reason: String
  }

  type Query {
    searchPostcode(suburb: String!, postcode: String!, state: String!): PostcodeValidationResult
  }
`);

const rootValue = {
  searchPostcode: async ({ suburb, postcode, state }) => {
    console.log("Arguments received:", { suburb, postcode, state });
    // Logic to fetch or compute data
    // TODO CALL AUST POST API HERE
    return { valid: true, reason: "Success!" };
  },
};

export default async function handler(req, res) {
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

  const response = await graphql({
    schema,
    source: query,
    rootValue,
    variableValues: variables,
  });
  res.status(200).json(response);
  return;
}
