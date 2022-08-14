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
        color: colors[color],
        fontWeight: weights[weight],
        fontSize: sizes[size],
      }}
    >
      {children}
    </span>
  );
}

const colors = {
  primary: "var(--text)",
  header: "var(--header-text)",
  ["header-light"]: "var(--header-text-light)",
  white: "var(--white)",
  secondary: "var(--secondary-text)",
};

const sizes = {
  h1: 25,
  h2: 20,
  h3: 16,
  body1: 15,
  body2: 12,
};

const weights = {
  regular: 400,
  semibold: 600,
  bold: 700,
};
