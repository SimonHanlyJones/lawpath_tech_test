"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

// TODO move to interface folder
interface AddressFormState {
  validationAi: boolean;
  postcode: string;
  suburb: string;
  geographicState: string;
  postcodeError: string;
  suburbError: string;
  geographicStateError: string;
  formError: string;
}

interface AddressContextInterface {
  state: AddressFormState;
  handleInputChange: (name: string, value: string) => void;
  submitAddressForValidation: (event: React.FormEvent<HTMLFormElement>) => void;
}

const AddressContext = createContext<AddressContextInterface | undefined>(
  undefined
);

interface AddressProviderProps {
  children: ReactNode;
}

export const AddressProvider: React.FC<AddressProviderProps> = ({
  children,
}) => {
  const [addressFormData, setAddressFormData] = useState<AddressFormState>({
    validationAi: false,
    postcode: "",
    suburb: "",
    geographicState: "",
    postcodeError: "",
    suburbError: "",
    geographicStateError: "",
    formError: "",
  });

  function handleInputChange(name: string, value: string) {
    setAddressFormData((prevData) => ({
      ...prevData,
      [name]: value.trim(), // Dynamically update the corresponding field
    }));
  }

  function submitAddressForValidation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const postcode = formData.get("postcode")?.toString();
    const suburb = formData.get("suburb")?.toString();
    const geographicState = formData.get("geographicState")?.toString();
    let hasError = false;

    if (!postcode || postcode === "") {
      setAddressFormData((prevData) => ({
        ...prevData,
        postcodeError: "A postcode is required. Please enter a postcode.",
      }));
      hasError = true;
    } else if (postcode && 4 !== postcode.length) {
      setAddressFormData((prevData) => ({
        ...prevData,
        postcodeError:
          "The postcode you have entered is not valid, it must be 4 digits long.",
      }));
      hasError = true;
    } else if (!/^\d+$/.test(postcode)) {
      setAddressFormData((prevData) => ({
        ...prevData,
        postcodeError: "The postcode must contain only digits.",
      }));
      hasError = true;
    } else {
      setAddressFormData((prevData) => ({
        ...prevData,
        postcodeError: "",
      }));
    }

    if (!suburb || suburb === "") {
      setAddressFormData((prevData) => ({
        ...prevData,
        suburbError: "A suburb is required. Please enter a suburb.",
      }));
    } else if (!/^[a-zA-Z\s]+$/.test(suburb)) {
      setAddressFormData((prevData) => ({
        ...prevData,
        suburbError: "The suburb must contain only letters.",
      }));
      hasError = true;
    } else {
      setAddressFormData((prevData) => ({
        ...prevData,
        suburbError: "",
      }));
    }

    if (!geographicState || geographicState === "") {
      setAddressFormData((prevData) => ({
        ...prevData,
        geographicStateError: "A state is required, Please select a state.",
      }));
      hasError = true;
    } else {
      setAddressFormData((prevData) => ({
        ...prevData,
        geographicStateError: "",
      }));
    }
    console.log(addressContext);

    if (hasError) return;
  }

  const addressContext: AddressContextInterface = {
    state: addressFormData,
    handleInputChange,
    submitAddressForValidation,
    // setAddressFormData,
  };

  return (
    <AddressContext.Provider value={addressContext}>
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
