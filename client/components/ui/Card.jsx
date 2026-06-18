import clsx from "clsx";

export const Card = ({ className, children }) => {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-5",
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }) => (
  <div
    className={clsx("mb-4 flex items-start justify-between gap-3", className)}
  >
    {children}
  </div>
);

export const CardTitle = ({ children, className }) => (
  <h3
    className={clsx(
      "text-lg font-semibold text-[color:var(--color-text)]",
      className
    )}
  >
    {children}
  </h3>
);

export const CardDescription = ({ children, className }) => (
  <p className={clsx("text-sm text-[color:var(--color-text-soft)]", className)}>
    {children}
  </p>
);

export const CardContent = ({ children, className }) => (
  <div className={clsx("space-y-4", className)}>{children}</div>
);

export const CardFooter = ({ children, className }) => (
  <div className={clsx("mt-6 flex items-center justify-between", className)}>
    {children}
  </div>
);
