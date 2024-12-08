"use client";
import React from "react";

import { ValidationStatusProps } from "../../interfaces/componentProps/ValidationStatusProps";

export function ValidationStatus({
  isValid,
  reasonInvalid,
}: ValidationStatusProps) {
  if (isValid === undefined) return null;

  return (
    <div className="validation-results">
      <div className={`status-box ${isValid ? "valid" : "invalid"}`}>
        <div className="status-row">
          {isValid ? (
            <>
              <span className="icon">✔</span>
              <span>Address Valid</span>
            </>
          ) : (
            <>
              <span className="icon">✘</span>
              <span>Address Not Valid</span>
            </>
          )}
        </div>
        {reasonInvalid && <div className="reason-row">{reasonInvalid}</div>}
      </div>
    </div>
  );
}
