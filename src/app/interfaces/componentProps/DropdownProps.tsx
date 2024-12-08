"use client";
export interface DropdownProps {
  id: string;
  name: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  error?: string;
  onChange: (name: string, value: string) => void;
}
