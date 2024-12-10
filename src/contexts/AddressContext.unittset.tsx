import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import "@testing-library/jest-dom";
import { queryPostcodeValidationProxy } from "@/app/lib/clientSide/postcodeValidatorFunctions";
import { AddressProvider, useAddress } from "./AddressContext";

jest.mock("@/app/lib/clientSide/postcodeValidatorFunctions", () => ({
  queryPostcodeValidationProxy: jest.fn(),
}));

const mockedQueryPostcodeValidationProxy =
  queryPostcodeValidationProxy as jest.Mock;

// Mock component to test the context
const TestComponent = () => {
  const { state, handleInputChange, submitAddressForValidation } = useAddress();

  return (
    <div>
      <form onSubmit={submitAddressForValidation}>
        <input
          name="postcode"
          value={state.postcode}
          onChange={(e) => handleInputChange("postcode", e.target.value)}
          data-testid="postcode-input"
        />
        <input
          name="suburb"
          value={state.suburb}
          onChange={(e) => handleInputChange("suburb", e.target.value)}
          data-testid="suburb-input"
        />
        <select
          name="geographicState"
          value={state.geographicState}
          onChange={(e) => handleInputChange("geographicState", e.target.value)}
          data-testid="state-select"
        >
          <option value="">Select State</option>
          <option value="NSW">NSW</option>
          <option value="VIC">VIC</option>
        </select>
        <button type="submit" data-testid="submit-button">
          Submit
        </button>
      </form>
      <div data-testid="validation-status">
        {state.isValid !== undefined
          ? state.isValid
            ? "Valid"
            : "Invalid"
          : "Not validated"}
      </div>
    </div>
  );
};

describe("AddressProvider", () => {
  const setup = () => {
    return render(
      <AddressProvider>
        <TestComponent />
      </AddressProvider>
    );
  };

  beforeEach(() => {
    mockedQueryPostcodeValidationProxy.mockReset();
  });

  it("should update the form state when inputs change", () => {
    setup();

    const postcodeInput = screen.getByTestId("postcode-input");
    const suburbInput = screen.getByTestId("suburb-input");
    const stateSelect = screen.getByTestId("state-select");

    fireEvent.change(postcodeInput, { target: { value: "2000" } });
    fireEvent.change(suburbInput, { target: { value: "Sydney" } });
    fireEvent.change(stateSelect, { target: { value: "NSW" } });

    expect(postcodeInput).toContain("2000");
    expect(suburbInput).toContain("Sydney");
    expect(stateSelect).toContain("NSW");
  });

  it("should show validation errors for empty inputs", async () => {
    setup();

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    expect(
      screen.getByText("A postcode is required. Please enter a postcode.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("A suburb is required. Please enter a suburb.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("A state is required. Please select a state.")
    ).toBeInTheDocument();
  });

  it("should call the validation proxy and update the context state on successful validation", async () => {
    mockedQueryPostcodeValidationProxy.mockResolvedValueOnce({
      valid: true,
      reason: "",
      badPostcode: false,
      badState: false,
      badSuburb: false,
    });

    setup();

    fireEvent.change(screen.getByTestId("postcode-input"), {
      target: { value: "2000" },
    });
    fireEvent.change(screen.getByTestId("suburb-input"), {
      target: { value: "Sydney" },
    });
    fireEvent.change(screen.getByTestId("state-select"), {
      target: { value: "NSW" },
    });

    fireEvent.click(screen.getByTestId("submit-button"));

    await screen.findByText("Valid");
    expect(mockedQueryPostcodeValidationProxy).toHaveBeenCalledWith(
      "Sydney",
      "2000",
      "NSW",
      false
    );
  });

  it("should update the state with errors if the proxy validation fails", async () => {
    mockedQueryPostcodeValidationProxy.mockResolvedValueOnce({
      valid: false,
      reason: "Postcode does not match suburb.",
      badPostcode: true,
      badState: false,
      badSuburb: false,
    });

    setup();

    fireEvent.change(screen.getByTestId("postcode-input"), {
      target: { value: "9999" },
    });
    fireEvent.change(screen.getByTestId("suburb-input"), {
      target: { value: "Unknown" },
    });
    fireEvent.change(screen.getByTestId("state-select"), {
      target: { value: "NSW" },
    });

    fireEvent.click(screen.getByTestId("submit-button"));

    await screen.findByText("Invalid");
    expect(mockedQueryPostcodeValidationProxy).toHaveBeenCalledWith(
      "Unknown",
      "9999",
      "NSW",
      false
    );
  });
});
