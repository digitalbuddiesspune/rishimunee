import clsx from "clsx";

export const Input = ({ className, ...props }) => (
  <input
    className={clsx(
      "w-full rounded-full border border-[color:var(--color-border)] bg-transparent px-4 py-3 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]",
      className
    )}
    {...props}
  />
);

export const TextArea = ({ className, ...props }) => (
  <textarea
    className={clsx(
      "w-full rounded-2xl border border-[color:var(--color-border)] bg-transparent px-4 py-3 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]",
      className
    )}
    {...props}
  />
);



