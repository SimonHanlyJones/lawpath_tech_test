// TODO remove use client and push further down component tree

"use client";
import { AddressProvider } from "@/contexts/AddressContext";
// import Image from "next/image";
// import { AddressProvider } from "../contexts/AddressContext";
// import AddressValidator from "./components/addressValidator";
// import HelloPage from "./helloPage";

// import HelloPageApollo from "./helloPageApollo";
import AddressValidator from "./components/addressValidator";

export default function Home() {
  return (
    <div>
      <div>
        {/* <HelloPageApollo /> */}

        <AddressProvider>
          <AddressValidator />
        </AddressProvider>
      </div>
    </div>
  );
}
