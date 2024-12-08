"use client";
import React from "react";
import { InputFieldProps } from "../../interfaces/componentProps/InputFieldProps";

export function InputField({
  id,
  name,
  label,
  placeholder,
  value,
  error,
  onChange,
}: InputFieldProps) {
  return (
    <div className="input-parent-div">
      <label className="text-label" htmlFor={id}>
        {label}
      </label>
      <input
        type="text"
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.name, event.target.value)}
        className={error ? "input-error" : ""}
      />
      {error && <span className="client-error-text">{error}</span>}
    </div>
  );
}
