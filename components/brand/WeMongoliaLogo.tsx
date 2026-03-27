import { cn } from "@/lib/utils";

export type WeMongoliaLogoVariant = "default" | "white";

const SRC: Record<WeMongoliaLogoVariant, string> = {
  default: "/brand/wemongolia.svg",
  white: "/brand/wemongolia-white.png",
};

export interface WeMongoliaLogoProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  variant?: WeMongoliaLogoVariant;
}

export function WeMongoliaLogo({
  variant = "default",
  className,
  alt = "WeMongolia",
  ...rest
}: WeMongoliaLogoProps) {
  return (
    <img
      src={SRC[variant]}
      alt={alt}
      className={cn("h-9 w-auto object-contain object-left", className)}
      {...rest}
    />
  );
}
