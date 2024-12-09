"use client";
import React from "react";
import { DropdownProps } from "../../interfaces/componentProps/DropdownProps";

export function Dropdown({
  id,
  name,
  label,
  options,
  value,
  redField,
  error,
  onChange,
}: DropdownProps) {
  return (
    <div className="input-parent-div">
      <label className="text-label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.name, event.target.value)}
        className={error || redField ? "input-dropdown-error" : ""}
      >
        <option value="" disabled>
          Select state
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="client-error-text">{error}</span>}
    </div>
  );
}
