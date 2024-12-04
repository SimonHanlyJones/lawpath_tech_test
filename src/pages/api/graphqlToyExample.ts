import { graphql, buildSchema } from "graphql";

const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

const rootValue = {
  hello: () => "Hello, world!",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Only POST requests allowed");
    return;
  }
  const { query } = req.body;
  if (!query) {
    res.status(400).send("Bad request");
    return;
  }

  const response = await graphql({ schema, source: query, rootValue });
  res.status(200).json(response);
  return;
}
