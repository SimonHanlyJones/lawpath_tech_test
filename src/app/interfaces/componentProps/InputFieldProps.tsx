"use client";
export interface InputFieldProps {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  value: string;
  error?: string;
  onChange: (name: string, value: string) => void;
}
