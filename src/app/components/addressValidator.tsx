"use client";
import React from "react";
import { useAddress } from "../../contexts/AddressContext";
import { Checkbox } from "./addressValidatorComponents/Checkbox";
import { InputField } from "./addressValidatorComponents/InputField";
import { Dropdown } from "./addressValidatorComponents/Dropdown";
import { ValidationStatus } from "./addressValidatorComponents/ValidationStatus";

function AddressValidator() {
  const addressContext = useAddress();

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

  return (
    <div className="form-container">
      <h1>Australian Address Validator</h1>
      <form onSubmit={addressContext.submitAddressForValidation}>
        <Checkbox
          id="validatorCheckbox"
          name="validationAi"
          label="API Validation"
          checked={addressContext.state.validationAi}
          onChange={addressContext.handleInputChange}
        />

        <InputField
          id="postcodeInput"
          name="postcode"
          label="Postcode"
          placeholder="Enter postcode"
          value={addressContext.state.postcode}
          redField={addressContext.state.badPostcode}
          error={addressContext.state.postcodeError}
          onChange={addressContext.handleInputChange}
        />

        <InputField
          id="suburbInput"
          name="suburb"
          label="Suburb"
          placeholder="Enter suburb"
          value={addressContext.state.suburb}
          redField={addressContext.state.badSuburb}
          error={addressContext.state.suburbError}
          onChange={addressContext.handleInputChange}
        />

        <Dropdown
          id="stateDropdown"
          name="geographicState"
          label="State"
          options={australianStates}
          value={addressContext.state.geographicState}
          redField={addressContext.state.badGeographicState}
          error={addressContext.state.geographicStateError}
          onChange={addressContext.handleInputChange}
        />

        <ValidationStatus
          isValid={addressContext.state.isValid}
          reasonInvalid={addressContext.state.reasonInvalid}
        />

        <button type="submit" disabled={addressContext.state.isLoading}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default AddressValidator;
