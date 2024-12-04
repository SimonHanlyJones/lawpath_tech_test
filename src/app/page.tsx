// TODO remove use client and push further down component tree

"use client";
// import Image from "next/image";
// import { AddressProvider } from "../contexts/AddressContext";
// import AddressValidator from "./components/addressValidator";
// import HelloPage from "./helloPage";
import { ApolloProvider } from "@apollo/client";
import client from "./lib/apolloClient";
import HelloPageApollo from "./helloPageApollo";

export default function Home() {
  return (
    <div>
      <div>
        <ApolloProvider client={client}>
          <HelloPageApollo />
        </ApolloProvider>
        {/* <AddressProvider>
          <AddressValidator />
        </AddressProvider> */}
      </div>
    </div>
  );
}
