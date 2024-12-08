"use client";
import { AddressFormState } from "@/app/interfaces/contextProps/AddressFormState";
import React from "react";

export interface AddressContextInterface {
  state: AddressFormState;
  handleInputChange: (name: string, value: string | boolean) => void;
  submitAddressForValidation: (event: React.FormEvent<HTMLFormElement>) => void;
}
