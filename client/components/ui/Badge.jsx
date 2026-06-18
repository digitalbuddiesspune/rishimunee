import clsx from "clsx";

export const Badge = ({ children, variant = "default", className }) => {
  const variants = {
    default: "bg-[color:var(--color-accent)] text-[color:var(--color-accent-foreground)]",
    outline: "border border-[color:var(--color-border)] text-[color:var(--color-text)]"
  };

  return (
    <span className={clsx("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
};



