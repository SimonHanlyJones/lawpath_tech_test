"use client";
import React, { createContext, useContext, useState } from "react";
import { ApolloProvider } from "@apollo/client";
import client from "@/app/lib/clientSide/apolloClient";
import { queryPostcodeValidationProxy } from "@/app/lib/clientSide/postcodeValidatorFunctions";
import { AddressFormState } from "../app/interfaces/contextProps/AddressFormState";
import { AddressContextInterface } from "../app/interfaces/contextProps/AddressContextInterface";
import { AddressProviderProps } from "../app/interfaces/contextProps/AddressProviderProps";

const AddressContext = createContext<AddressContextInterface | undefined>(
  undefined
);

/**
 * AddressProvider is a React functional component that provides context for managing address form data.
 * It uses an ApolloProvider to set up the GraphQL client and supplies the AddressContext to its children.
 *
 * It manages address form state, including fields for postcode, suburb, geographic state, and various error states.
 * It includes methods for handling form input changes, client-side form validation, and submitting the form
 * for further validation via a GraphQL query.
 *
 * @param {React.ReactNode} children - The child components that will have access to the AddressContext.
 */
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
    isLoading: false,
    isValid: undefined,
    reasonInvalid: undefined,
    badGeographicState: false,
    badPostcode: false,
    badSuburb: false,
  });

  /**
   * Handles updating the address form state with user input.
   * @param {string} name The name of the field to update, must be a valid key in the AddressFormState interface.
   * @param {boolean|string} value The new value of the field.
   * @throws {Error} If the field name is not valid.
   */
  function handleInputChange(name: string, value: boolean | string) {
    // Check we have tried to update a valid field
    const validNames = Object.keys(addressFormData) as Array<
      keyof AddressFormState
    >;

    if (!validNames.includes(name as keyof AddressFormState)) {
      throw new Error(`Invalid field name provided: ${name}`);
    }

    // If we are updating an input field, reset our errors and validation results
    if (
      name === "validationAi" ||
      name === "geographicState" ||
      name === "suburb" ||
      name === "postcode"
    ) {
      setAddressFormData((prevData) => ({
        ...prevData,
        [name]: value,
        postcodeError: "",
        suburbError: "",
        geographicStateError: "",
        isValid: undefined,
        reasonInvalid: undefined,
        badGeographicState: false,
        badPostcode: false,
        badSuburb: false,
      }));

      // otherwise just update the field
    } else {
      setAddressFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  }

  /**
   * Validate the address form fields client-side, checking for empty fields,
   * postcode length and contents, suburb contents, and geographic state selection.
   * Updates the addressFormData state with any errors found.
   *
   * @param {string | undefined} postcode - The postcode input
   * @param {string | undefined} suburb - The suburb input
   * @param {string | undefined} geographicState - The geographic state input
   * @returns {boolean} - Whether any errors were found.
   */
  function validateAddressFormClientSide(
    postcode: string | undefined,
    suburb: string | undefined,
    geographicState: string | undefined
  ): boolean {
    let hasError = false;
    let postcodeError = "";
    let suburbError = "";
    let geographicStateError = "";

    if (!postcode || postcode === "") {
      postcodeError = "A postcode is required. Please enter a postcode.";
      hasError = true;
    } else if (postcode && 4 !== postcode.length) {
      postcodeError =
        "The postcode you have entered is not valid, it must be 4 digits long.";
      hasError = true;
    } else if (!/^\d+$/.test(postcode)) {
      postcodeError = "The postcode must contain only digits.";
      hasError = true;
    }

    if (!suburb || suburb === "") {
      suburbError = "A suburb is required. Please enter a suburb.";
      hasError = true;
    } else if (!/^[a-zA-Z\s]+$/.test(suburb)) {
      suburbError = "The suburb must contain only letters.";
      hasError = true;
    }

    if (!geographicState || geographicState === "") {
      geographicStateError = "A state is required. Please select a state.";
      hasError = true;
    }

    if (hasError) {
      setAddressFormData((prevData) => ({
        ...prevData,
        geographicStateError: geographicStateError,
        suburbError: suburbError,
        postcodeError: postcodeError,
      }));
    }

    return hasError;
  }

  /**
   * Handles the submission of the address form, preventing the default form
   * submission action. It validates the address fields client-side, and if any
   * errors are found, it updates the addressFormData state with the errors. If
   * no errors are found, it calls the queryPostcodeValidationProxy function
   * with the form data and updates the addressFormData state with the response
   * data. If an error occurs, it updates the addressFormData state with a
   * generic error message and throws the error.
   *
   * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
   * @returns {Promise<void>} - An empty promise that resolves when the
   *   validation is complete.
   */
  async function submitAddressForValidation(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setAddressFormData((prevData) => ({
      ...prevData,
      isLoading: true,
    }));

    // perform clientside validation
    const formData = new FormData(event.currentTarget);
    const postcode = formData.get("postcode")?.toString();
    const suburb = formData.get("suburb")?.toString();
    const geographicState = formData.get("geographicState")?.toString();
    const useAi = formData.get("validationAi") === "on";

    const hasError = validateAddressFormClientSide(
      postcode,
      suburb,
      geographicState
    );

    if (hasError) {
      setAddressFormData((prevData) => ({
        ...prevData,
        isLoading: false,
      }));
      return;
    }

    try {
      const validationResponse = await queryPostcodeValidationProxy(
        suburb!,
        postcode!,
        geographicState!,
        useAi!
      );
      console.log("validationResponse: ", validationResponse);

      setAddressFormData((prevData) => ({
        ...prevData,
        isValid: validationResponse.valid,
        reasonInvalid: validationResponse.reason,
        badPostcode: validationResponse.badPostcode,
        badGeographicState: validationResponse.badState,
        badSuburb: validationResponse.badSuburb,
        isLoading: false,
      }));
    } catch (error: unknown) {
      setAddressFormData((prevData) => ({
        ...prevData,
        isValid: false,
        reasonInvalid: "Something went wrong. Please try again.",
        isLoading: false,
      }));
      throw new Error(`${error}`);
    }
  }

  const addressContext: AddressContextInterface = {
    state: addressFormData,
    handleInputChange,
    submitAddressForValidation,
  };

  return (
    <ApolloProvider client={client}>
      <AddressContext.Provider value={addressContext}>
        {children}
      </AddressContext.Provider>
    </ApolloProvider>
  );
};

/**
 * A hook that returns the current address form state and functions to update it.
 * Use this hook to access the state and functions of the AddressProvider.
 *
 * @returns {AddressContextInterface} - An object containing the state and functions
 *   of the AddressProvider.
 *
 * @throws {Error} - If the hook is used outside of an AddressProvider component.
 */
export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error("useAddress must be used within an AddressProvider");
  }
  return context;
};
