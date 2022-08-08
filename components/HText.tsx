type Props = {
  children: React.ReactNode;
  color?: "primary" | "header" | "header-light" | "inherit";
  weight?: "regular" | "bold" | "semibold" | "inherit";
};
export default function HText({
  color = "inherit",
  weight = "inherit",
  children,
}: Props) {
  return (
    <span
      style={{
        color:
          color === "primary"
            ? "var(--text)"
            : color === "header"
            ? "var(--header-text)"
            : color === "header-light"
            ? "var(--header-text-light)"
            : undefined,
        fontWeight:
          weight === "regular"
            ? 400
            : weight === "bold"
            ? 700
            : weight === "semibold"
            ? 600
            : undefined,
      }}
    >
      {children}
    </span>
  );
}
