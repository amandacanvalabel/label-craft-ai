"use client";

import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  className?: string;
  required?: boolean;
}

const FormField = ({ label, children, error, hint, className, required }: FormFieldProps) => (
  <div className={cn("space-y-1.5", className)}>
    <label className="text-xs font-bold text-foreground">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

export const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      "w-full px-3.5 py-2.5 text-sm bg-muted/50 dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all",
      className
    )}
    {...props}
  />
);

export const Select = ({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className={cn(
      "w-full px-3.5 py-2.5 text-sm bg-muted/50 dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all appearance-none",
      className
    )}
    {...props}
  >
    {children}
  </select>
);

export const Textarea = ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={cn(
      "w-full px-3.5 py-2.5 text-sm bg-muted/50 dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none",
      className
    )}
    {...props}
  />
);

export const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="flex items-center gap-3"
  >
    <div className={cn("w-10 h-6 rounded-full transition-colors duration-200 relative", checked ? "bg-primary" : "bg-muted dark:bg-white/10")}>
      <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200", checked ? "left-5" : "left-1")} />
    </div>
    {label && <span className="text-sm text-foreground">{label}</span>}
  </button>
);

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}) => {
  const variants = {
    primary: "bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30",
    secondary: "bg-muted/60 dark:bg-white/5 text-foreground hover:bg-muted dark:hover:bg-white/10 border border-border/50 dark:border-white/10",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-white/5",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2.5 text-sm", lg: "px-6 py-3 text-sm" };

  return (
    <button
      className={cn("font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none", variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default FormField;
