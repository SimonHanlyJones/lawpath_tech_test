"use client";
import React from "react";
import { useAddress } from "../../contexts/AddressContext";

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
    <div>
      <div className="form-container">
        <h1>Australian Address Validator</h1>
        <form onSubmit={addressContext.submitAddressForValidation}>
          <div className="checkbox-parent-div">
            <input
              className="checkbox-label"
              type="checkbox"
              id="validatorCheckbox"
              name="validationAi"
              onChange={(event) =>
                addressContext.handleInputChange(
                  event.target.name,
                  event.target.checked
                )
              }
            />
            <label className="checkbox-label" htmlFor="validatorCheckbox">
              API Validation
            </label>
          </div>
          <div className="input-parent-div">
            <label className="text-label" htmlFor="postcodeInput">
              Postcode
            </label>
            <input
              type="text"
              name="postcode"
              placeholder="Enter postcode"
              onChange={(event) =>
                addressContext.handleInputChange(
                  event.target.name,
                  event.target.value
                )
              }
              id="postcodeInput"
            />
            <span className="client-error-text">
              {addressContext.state.postcodeError}
            </span>
          </div>

          <div className="input-parent-div">
            <label className="text-label" htmlFor="suburbInput">
              Suburb
            </label>
            <input
              type="text"
              placeholder="Enter suburb"
              name="suburb"
              onChange={(event) =>
                addressContext.handleInputChange(
                  event.target.name,
                  event.target.value
                )
              }
              id="suburbInput"
            />
            <span className="client-error-text">
              {addressContext.state.suburbError}
            </span>
          </div>

          <div className="input-parent-div">
            <label className="text-label" htmlFor="stateDropdown">
              State
            </label>
            <select
              id="stateDropdown"
              value={addressContext.state.geographicState}
              name="geographicState"
              onChange={(event) =>
                addressContext.handleInputChange(
                  event.target.name,
                  event.target.value
                )
              }
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
            <span className="client-error-text">
              {addressContext.state.geographicStateError}
            </span>
          </div>
          <div className="validation-results">
            <div>
              {addressContext.state.isValid !== undefined && (
                <div
                  className={`status-box ${
                    addressContext.state.isValid ? "valid" : "invalid"
                  }`}
                >
                  {addressContext.state.isValid ? (
                    <>
                      <span className="icon">✔</span>
                      <span>Address Valid</span>
                    </>
                  ) : (
                    <>
                      <span className="icon">✘</span>
                      <span>Address Not Valid</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {addressContext.state.isValid &&
            addressContext.state.reasonInvalid! &&
            addressContext.state.reasonInvalid.length > 0 ? (
              <span></span>
            ) : (
              <span>{addressContext.state.reasonInvalid}</span>
            )}
          </div>
          <div>
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddressValidator;
