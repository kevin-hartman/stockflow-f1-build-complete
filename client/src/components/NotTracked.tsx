// The "not tracked" pill: meaning carried by text, never by an empty cell or a raw null.
export function NotTracked({ testId = "not-tracked" }: { testId?: string }) {
  return (
    <span className="pill pill--not-tracked" data-testid={testId}>
      not tracked
    </span>
  );
}
