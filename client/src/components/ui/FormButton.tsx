import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface FormButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'outline';
  children: ReactNode;
}

export const FormButton = ({ 
  loading, 
  loadingText, 
  variant = 'primary', 
  children, 
  className = '', 
  ...props 
}: FormButtonProps) => {
    const baseStyles = "w-full rounded-md py-2 font-semibold flex items-center justify-center gap-2 transition-all duration-200 ease-in-out disabled:opacity-50 cursor-pointer";
  
  const variants = {
    primary: "bg-(--accent) text-white hover:opacity-80",
    outline: "border border-(--input-border) bg-transparent text-(--text) hover:bg-(--bg) hover:border-(--border-subtle)"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (loadingText || 'Loading...') : children}
    </button>
  );
};