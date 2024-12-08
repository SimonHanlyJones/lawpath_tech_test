"use client";
export interface CheckboxProps {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onChange: (name: string, checked: boolean) => void;
}
