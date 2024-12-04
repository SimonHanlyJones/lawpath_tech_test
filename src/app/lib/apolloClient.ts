import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: "/api/validatorProxy",
    fetch: fetch,
  }),
  cache: new InMemoryCache(),
});

export default client;
