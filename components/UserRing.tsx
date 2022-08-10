export default function UserRing({ color, isTalking }) {
  return (
    <div
      style={{
        backgroundColor: color,
        borderRadius: 100,
        width: 16,
        height: 16,
        opacity: 0.3,
        border: isTalking ? "1px solid green" : "",
      }}
    />
  );
}
