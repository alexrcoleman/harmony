export default function UserRing({ color, isTalking }) {
  return (
    <div
      style={{
        backgroundColor: color,
        borderRadius: 100,
        width: 16,
        height: 16,
        opacity: isTalking ? 1 : 0.8,
        border: isTalking ? "2px solid #3ba55d" : undefined,
      }}
    />
  );
}
