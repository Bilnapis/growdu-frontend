import { type ChangeEvent, type InputHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  isPhone?: boolean;
};

const inputClassName =
  "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function normalizePhoneValue(value: string) {
  return value.replace(/\D/g, "").replace(/^0+/, "");
}

function normalizePhoneInputValue(
  value: InputHTMLAttributes<HTMLInputElement>["value"],
) {
  if (value === undefined) {
    return undefined;
  }

  return normalizePhoneValue(String(value));
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      isPhone = false,
      onChange,
      value,
      defaultValue,
      disabled,
      ...props
    },
    ref,
  ) => {
    const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
      event.currentTarget.value = normalizePhoneValue(
        event.currentTarget.value,
      );
      onChange?.(event);
    };

    if (isPhone) {
      return (
        <div
          className={cn(
            inputClassName,
            "items-center gap-2 px-3 py-0 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            disabled && "cursor-not-allowed opacity-50",
            className,
          )}
        >
          <span className="shrink-0 text-sm text-foreground">+62</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
            ref={ref}
            value={normalizePhoneInputValue(value)}
            defaultValue={normalizePhoneInputValue(defaultValue)}
            disabled={disabled}
            onChange={handlePhoneChange}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(inputClassName, className)}
        ref={ref}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
