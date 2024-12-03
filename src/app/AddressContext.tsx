"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface AddressFormState {
  validationAi: boolean;
  postcode: string;
  suburb: string;
  state: string;
  postcodeError: string;
  suburbError: string;
  formError: string;
}

interface AddressContextInterface {
  state: AddressFormState;
  handleInputChange: (name: string, value: string) => void;
  setSelectedState: (value: string) => void;
  setAddressFormData: React.Dispatch<React.SetStateAction<AddressFormState>>;
}

const AddressContext = createContext<AddressContextInterfac | undefined>(
  undefined
);

interface AddressProviderProps {
  children: ReactNode;
}

export const AddressProvider: React.FC<AddressProviderProps> = ({
  children,
}) => {
  const [postcode, setPostcode] = useState<string | undefined>();
  const [postcodeError, setPostcodeError] = useState<string | null>(null);

  const validatePostcode = (postcode: string) => {
    if (!/^\d{4}$/.test(postcode)) {
      setPostcodeError("Postcode must be a 4-digit number");
      return false;
    }
    setPostcodeError(null);
    return true;
  };

  const handleSetPostcode = (postcode: string) => {
    if (validatePostcode(postcode)) {
      setPostcode(postcode);
    }
  };

  const addressContext = {
    postcode,
    setPostcode: handleSetPostcode,
    postcodeError,
  };

  return (
    <AddressContext.Provider value={{ addressContext }}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error("useAddress must be used within an AddressProvider");
  }
  return context;
};
