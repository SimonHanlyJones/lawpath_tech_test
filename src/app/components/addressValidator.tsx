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
      <h1>Australian Address Validator</h1>
      <form onSubmit={addressContext.submitAddressForValidation}>
        <div>
          <input
            type="checkbox"
            id="validatorCheckbox"
            name="validatorAi"
            onChange={(event) =>
              addressContext.handleInputChange(
                event.target.name,
                event.target.value
              )
            }
          />
          <label htmlFor="validatorCheckbox">API Validation</label>
        </div>
        <label htmlFor="postcodeInput">Postcode</label>
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

        <div>
          <label>Suburb</label>
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
        </div>

        <div>
          {/* TODO type to filter */}
          <label htmlFor="stateDropdown">State</label>
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
          <text>{addressContext.state.postcodeError}</text>
        </div>
        <div>
          <text>{addressContext.state.suburbError}</text>
        </div>
        <div>
          <text>{addressContext.state.geographicStateError}</text>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default AddressValidator;
