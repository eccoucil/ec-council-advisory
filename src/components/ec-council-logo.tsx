import Image from "next/image";

/**
 * `public/ec-council-logo.jpg` is 1527x801. The rendered width is derived from
 * the requested height rather than taken from the file: next/image builds its
 * srcset from whatever size it is handed, so passing the intrinsic 1527 would
 * have the browser fetch a 3840px master to paint a 42px-tall header mark.
 */
const ASPECT_RATIO = 1527 / 801;

type EcCouncilLogoProps = {
  /** Rendered height in CSS pixels. The width follows from the logo's ratio. */
  height: number;
  className?: string;
  /** Set on the sign-in gate, where the logo is above the fold. */
  priority?: boolean;
};

export function EcCouncilLogo({
  height,
  className,
  priority = false,
}: EcCouncilLogoProps) {
  const width = Math.round(height * ASPECT_RATIO);

  return (
    <Image
      className={className ? `ec-logo ${className}` : "ec-logo"}
      src="/ec-council-logo.jpg"
      // The wordmark reads "EC-Council"; the strapline beneath it is decorative
      // here, so it stays out of the accessible name.
      alt="EC-Council"
      height={height}
      width={width}
      priority={priority}
      // Tailwind's preflight puts `height: auto` on every img. That changes one
      // dimension without the other, which trips next/image's aspect-ratio
      // warning, so both are pinned here instead of left to the attributes.
      style={{ height: `${height}px`, width: "auto" }}
    />
  );
}
