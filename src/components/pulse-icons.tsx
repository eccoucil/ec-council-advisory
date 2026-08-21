import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

function Icon({
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function IconCircleCheck(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m8 12 2.5 2.5L16 9" />
    </Icon>
  );
}

export function IconPencil(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Icon>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.1a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.8 2.1Z" />
    </Icon>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  );
}

export function IconCloudCheck(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2" />
      <path d="m8 13 2.5 2.5L16 10" />
    </Icon>
  );
}

export function IconPen(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Icon>
  );
}

export function IconDashed(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10.1 2.2a11 11 0 0 1 3.8 0" />
      <path d="M13.9 21.8a11 11 0 0 1-3.8 0" />
      <path d="m17.8 3.9 1.6 1.6" />
      <path d="m4.6 18.5 1.6 1.6" />
      <path d="M2.2 13.9a11 11 0 0 1 0-3.8" />
      <path d="M21.8 10.1a11 11 0 0 1 0 3.8" />
      <path d="m3.9 6.2 1.6-1.6" />
      <path d="m18.5 19.4 1.6-1.6" />
    </Icon>
  );
}

export function IconShield(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.7 8.9a1.8 1.8 0 0 1-1.3 0C6.5 20.5 3 18 3 13V6a1 1 0 0 1 .6-.9l8-3.3a1 1 0 0 1 .8 0l8 3.3A1 1 0 0 1 21 6Z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </Icon>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </Icon>
  );
}

export function IconThumbsUp(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 10v12" />
      <path d="M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.4 7A2 2 0 0 1 18.4 21H7a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.8a2 2 0 0 0 1.9-1.3L13 3a1.7 1.7 0 0 1 2 2.9Z" />
    </Icon>
  );
}

export function IconThumbsDown(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M17 14V2" />
      <path d="M9 18.1 10 14H4.2a2 2 0 0 1-2-2.3l1.4-7A2 2 0 0 1 5.6 3H17a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.8a2 2 0 0 0-1.9 1.3L11 21a1.7 1.7 0 0 1-2-2.9Z" />
    </Icon>
  );
}

export function IconArrowLeft(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </Icon>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </Icon>
  );
}
