import { type InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FormInput = ({ label, id, ...props }: FormInputProps) => {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="w-full rounded-md border border-(--input-border) bg-transparent px-3 py-2 text-(--text) outline-none transition-colors focus:border-(--accent)"
        {...props}
      />
    </div>
  );
};