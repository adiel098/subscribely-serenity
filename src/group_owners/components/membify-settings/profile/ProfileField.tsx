
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LucideIcon } from "lucide-react";

interface ProfileFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  icon: LucideIcon;
  emoji?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
  className?: string;
  rightIcon?: React.ReactNode;
  helperText?: React.ReactNode;
}

export const ProfileField = ({
  id,
  name,
  label,
  value,
  icon: Icon,
  emoji,
  onChange,
  disabled = false,
  placeholder,
  type = "text",
  className = "",
  rightIcon,
  helperText
}: ProfileFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-1.5 text-indigo-700">
        <Icon className="h-3.5 w-3.5" />
        {label} {emoji && <span>{emoji}</span>}
      </Label>
      <div className="relative">
        <Input 
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${disabled ? "bg-gray-50" : ""} w-full border-indigo-200 focus-visible:ring-indigo-400 ${className}`}
          placeholder={placeholder}
          type={type}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {rightIcon}
          </div>
        )}
      </div>
      {helperText && (
        <p className="text-xs text-indigo-400 flex items-center gap-1">
          {helperText}
        </p>
      )}
    </div>
  );
};
