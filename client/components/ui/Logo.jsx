import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

const sizeMap = {
  sm: { width: 40, height: 40, className: "h-10 w-auto" },
  md: { width: 56, height: 56, className: "h-14 w-auto" },
  lg: { width: 80, height: 80, className: "h-20 w-auto" },
  xl: { width: 96, height: 96, className: "h-24 w-auto" },
};

export function Logo({
  size = "md",
  href = "/",
  className,
  imageClassName,
  priority = false,
}) {
  const dimensions = sizeMap[size] || sizeMap.md;

  const image = (
    <Image
      src="/assets/logoR.png"
      alt="RisheeMuni"
      width={dimensions.width}
      height={dimensions.height}
      priority={priority}
      className={clsx(dimensions.className, "object-contain", imageClassName)}
    />
  );

  if (href) {
    return (
      <Link href={href} className={clsx("inline-flex shrink-0 items-center", className)}>
        {image}
      </Link>
    );
  }

  return <span className={clsx("inline-flex shrink-0 items-center", className)}>{image}</span>;
}
