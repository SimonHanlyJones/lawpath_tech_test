import { AddressProvider } from "@/contexts/AddressContext";
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
