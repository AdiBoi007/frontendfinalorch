type BadgeProps = {
  variant: "HEALTHY" | "AT RISK" | "Critical";
};

function getTone(variant: BadgeProps["variant"]) {
  if (variant === "HEALTHY") {
    return "text-[#78716C]";
  }

  if (variant === "AT RISK") {
    return "text-[#78716C]";
  }

  return "text-[#1A1612]";
}

export function Badge({ variant }: BadgeProps) {
  const label = variant === "AT RISK" ? "At risk" : variant.toLowerCase();

  return (
    <span className={`inline-flex font-sans text-[11px] font-normal tracking-wide ${getTone(variant)}`}>
      {label}
    </span>
  );
}
