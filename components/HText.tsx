type Props = {
  children: React.ReactNode;
  color?:
    | "primary"
    | "header"
    | "header-light"
    | "white"
    | "secondary"
    | "inherit";
  weight?: "regular" | "bold" | "semibold" | "inherit";
  size?: "h1" | "h2" | "h3" | "body1" | "body2" | "inherit";
};
export default function HText({
  color = "inherit",
  weight = "inherit",
  size = "inherit",
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
            : color === "white"
            ? "var(--white)"
            : color === "secondary"
            ? "var(--secondary-text)"
            : undefined,
        fontWeight:
          weight === "regular"
            ? 400
            : weight === "bold"
            ? 700
            : weight === "semibold"
            ? 600
            : undefined,
        fontSize:
          size === "h1"
            ? 25
            : size === "h2"
            ? 20
            : size === "h3"
            ? 16
            : size === "body1"
            ? 15
            : size === "body2"
            ? 12
            : undefined,
      }}
    >
      {children}
    </span>
  );
}
