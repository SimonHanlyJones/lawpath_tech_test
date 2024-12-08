import { render, screen, fireEvent } from "@testing-library/react";
import AddressValidator from "./AddressValidator";
import { AddressContext } from "../../contexts/AddressContext";

test("renders the form", () => {
  render(
    <AddressContext.Provider value={mockContext}>
      <AddressValidator />
    </AddressContext.Provider>
  );

  expect(screen.getByText("Australian Address Validator")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Enter postcode")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Enter suburb")).toBeInTheDocument();
});

test("disables submit button when loading", () => {
  const mockContext = {
    state: { isLoading: true },
    handleInputChange: jest.fn(),
    submitAddressForValidation: jest.fn(),
  };

  render(
    <AddressContext.Provider value={mockContext}>
      <AddressValidator />
    </AddressContext.Provider>
  );

  const submitButton = screen.getByText("Submit");
  expect(submitButton).toBeDisabled();
});
