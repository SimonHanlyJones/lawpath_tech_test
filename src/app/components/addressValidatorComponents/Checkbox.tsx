"use client";
import React from "react";
import { CheckboxProps } from "../../interfaces/componentProps/CheckboxProps";

export function Checkbox({
  id,
  name,
  label,
  checked,
  onChange,
}: CheckboxProps) {
  return (
    <div className="checkbox-parent-div">
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={(event) => onChange(event.target.name, event.target.checked)}
      />
      <label className="checkbox-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
}
