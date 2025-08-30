"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";

type Option = Record<"value" | "label", string>;

interface MultiSelectProps
  extends Omit<React.ComponentProps<typeof CommandPrimitive>, "onChange"> {
  options: Option[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  onCreate?: (value: string) => void;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  className,
  onCreate,
  ...props
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleUnselect = React.useCallback(
    (optionValue: string) => {
      onChange(selected.filter((s) => s !== optionValue));
    },
    [onChange, selected]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "" && selected.length > 0) {
            handleUnselect(selected[selected.length - 1]);
          }
        }
        if (e.key === "Escape") {
          input.blur();
        }
      }
    },
    [handleUnselect, selected]
  );

  const selectables = options.filter(
    (option) => !selected.includes(option.value)
  );

  const handleCreate = () => {
    if (onCreate && inputValue.length > 0) {
      const newOptionValue = inputValue;
      // Check if option already exists
      if (
        !options.some(
          (option) =>
            option.value.toLowerCase() === newOptionValue.toLowerCase()
        )
      ) {
        onCreate(newOptionValue);
      }
      onChange([...selected, newOptionValue]);
      setInputValue("");
    }
  };

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={cn("overflow-visible bg-transparent", className)}
      {...props}
    >
      <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex gap-1 flex-wrap">
          {selected.map((optionValue) => {
            const option = options.find((opt) => opt.value === optionValue);
            return (
              <Badge key={optionValue} variant="secondary">
                {option ? option.label : optionValue}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(optionValue);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(optionValue)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => {
              handleCreate();
              setOpen(false);
            }}
            onFocus={() => setOpen(true)}
            placeholder={selected.length ? "" : placeholder}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && (selectables.length > 0 || (onCreate && inputValue)) ? (
          <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto">
              {selectables.map((option) => {
                return (
                  <CommandItem
                    key={option.value}
                    onMouseDown={(e: {
                      preventDefault: () => void;
                      stopPropagation: () => void;
                    }) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={() => {
                      setInputValue("");
                      onChange([...selected, option.value]);
                    }}
                    className={"cursor-pointer"}
                  >
                    {option.label}
                  </CommandItem>
                );
              })}
              {onCreate &&
                inputValue &&
                !options.some(
                  (option) =>
                    option.value.toLowerCase() === inputValue.toLowerCase()
                ) && (
                  <CommandItem
                    onMouseDown={(e: {
                      preventDefault: () => void;
                      stopPropagation: () => void;
                    }) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={() => {
                      handleCreate();
                    }}
                    className={"cursor-pointer"}
                  >
                    Create "{inputValue}"
                  </CommandItem>
                )}
            </CommandGroup>
          </div>
        ) : null}
      </div>
    </Command>
  );
}
