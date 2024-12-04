import { gql } from "@apollo/client";
import client from "./lib/apolloClient";

export async function fetchHello() {
  const query = gql`
    query {
      hello
    }
  `;

  try {
    const { data } = await client.query({ query });
    return data.hello; // Returns the "hello" field's value
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
