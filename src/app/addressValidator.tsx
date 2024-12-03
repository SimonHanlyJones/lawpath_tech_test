"use client";
import React, { FormEvent, useState } from "react";

interface addressValidatorInterface {
  validationAi: boolean;
  postcode: string;
  suburb: string;
  state: string;
  postcodeError: string;
  suburbError: string;
  formError: string;
}

function AddressValidator() {
  // TODO move form data to provider
  const [addressFormData, setAddressFormData] =
    useState<addressValidatorInterface>({
      validationAi: false,
      postcode: "",
      suburb: "",
      state: "",
      postcodeError: "",
      suburbError: "",
      formError: "",
    });

  const australianStates = [
    { value: "NSW", label: "New South Wales" },
    { value: "VIC", label: "Victoria" },
    { value: "QLD", label: "Queensland" },
    { value: "WA", label: "Western Australia" },
    { value: "SA", label: "South Australia" },
    { value: "TAS", label: "Tasmania" },
    { value: "ACT", label: "Australian Capital Territory" },
    { value: "NT", label: "Northern Territory" },
  ];

  function setSelectedState(event: React.ChangeEvent<HTMLSelectElement>) {
    setAddressFormData((prevData) => ({
      ...prevData,
      state: event.target.value,
    }));
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setAddressFormData((prevData) => ({
      ...prevData,
      [name]: value.trim(), // Dynamically update the corresponding field
    }));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const postcode = formData.get("postcode")?.toString();
    const suburb = formData.get("suburb")?.toString();
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
    }

    if (hasError) return;

    console.log(event);
  }

  return (
    <div>
      <h1>Australian Address Validator</h1>
      <form onSubmit={onSubmit}>
        <div>
          <input
            type="checkbox"
            id="validatorCheckbox"
            name="validatorCheckbox"
          />
          <label htmlFor="validatorCheckbox">API Validation</label>
        </div>
        <label htmlFor="postcodeInput">Postcode</label>
        <input
          type="text"
          placeholder="Enter postcode"
          onChange={handleInputChange}
          id="postcodeInput"
        />

        <div>
          <label>Suburb</label>
          <input
            type="text"
            placeholder="Enter suburb"
            onChange={handleInputChange}
            id="suburbInput"
          />
        </div>

        <div>
          {/* TODO type to filter */}
          <label htmlFor="stateDropdown">State</label>
          <select
            id="stateDropdown"
            value={addressFormData.state}
            onChange={setSelectedState}
            style={{ marginLeft: "10px" }}
          >
            <option value="" disabled>
              Select state
            </option>
            {australianStates.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <text>{addressFormData.postcodeError}</text>
        </div>
        <div>
          <text>{addressFormData.suburbError}</text>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default AddressValidator;
