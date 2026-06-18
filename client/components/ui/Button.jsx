import clsx from "clsx";

const variants = {
  primary:
    "bg-[color:var(--color-primary)] !text-white !text-[color:var(--color-primary-foreground)] hover:bg-opacity-90",
  secondary:
    "bg-[color:var(--color-secondary)] !text-[color:var(--color-secondary-foreground)] hover:bg-opacity-90",
  outline:
    "border border-[color:var(--color-border)] hover:bg-[color:var(--color-secondary)] ",
  ghost: "text-[color:var(--color-text)] hover:bg-[color:var(--color-card)]",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = ({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className,
  isLoading = false,
  disabled,
  children,
  ...props
}) => {
  const isDisabled = disabled || isLoading;
  return (
    <Component
      className={clsx(
        "inline-flex items-center justify-center rounded-full font-medium transition-colors",
        variants[variant],
        sizes[size],
        isDisabled && "opacity-70 cursor-not-allowed",
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[color:var(--color-primary-foreground)] border-t-transparent" />
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </Component>
  );
};
