"use client";

import * as React from "react";

function MarkdownTaskListInput({
  checked,
  disabled,
  type,
  onChange,
  ...props
}: React.ComponentProps<"input">) {
  const [isChecked, setIsChecked] = React.useState(Boolean(checked));

  if (type !== "checkbox" || !disabled) {
    return (
      <input
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        type={type}
        {...props}
      />
    );
  }

  return (
    <input
      {...props}
      checked={isChecked}
      disabled={false}
      type="checkbox"
      onChange={(event) => {
        setIsChecked(event.currentTarget.checked);
        onChange?.(event);
      }}
    />
  );
}

export { MarkdownTaskListInput };
