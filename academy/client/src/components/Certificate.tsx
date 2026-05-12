import { Logo } from "./Logo";

type Props = {
  studentName: string;
  score: number;
  total: number;
  date?: Date;
};

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function Certificate({ studentName, score, total, date }: Props) {
  const when = date ?? new Date();
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div
      className="certificate-print"
      aria-hidden="true"
      data-testid="certificate"
      style={{
        position: "fixed",
        left: "-10000px",
        top: 0,
        width: "8.5in",
        height: "11in",
        background: "#ffffff",
        color: "#0b1a2b",
        padding: "0.75in",
        boxSizing: "border-box",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          border: "6px double #0b1a2b",
          padding: "0.5in",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "center",
        }}
      >
        <div style={{ width: "100%" }}>
          <div
            style={{
              fontSize: "14pt",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "#2a6f3a",
              fontWeight: 700,
            }}
          >
            Flag Football Academy
          </div>
          <div
            style={{
              fontSize: "44pt",
              fontWeight: 800,
              margin: "0.25in 0 0.1in",
              letterSpacing: "0.02em",
            }}
          >
            Certificate of Completion
          </div>
          <div style={{ fontSize: "12pt", color: "#5a6473" }}>
            Coach Cam Final Exam
          </div>
        </div>

        <div style={{ color: "#2a6f3a", display: "flex", alignItems: "center", gap: "0.25in" }}>
          <Logo size={72} />
          <div style={{ fontSize: "28pt" }}>🏈</div>
        </div>

        <div style={{ width: "100%" }}>
          <div style={{ fontSize: "14pt", color: "#5a6473" }}>This certifies that</div>
          <div
            style={{
              fontSize: "36pt",
              fontWeight: 700,
              fontStyle: "italic",
              margin: "0.15in 0",
              borderBottom: "2px solid #0b1a2b",
              paddingBottom: "0.1in",
              display: "inline-block",
              minWidth: "60%",
            }}
            data-testid="certificate-name"
          >
            {studentName}
          </div>
          <div style={{ fontSize: "14pt", marginTop: "0.15in", lineHeight: 1.45 }}>
            has completed the Coach Cam Final Exam with a score of{" "}
            <strong data-testid="certificate-score">
              {score}/{total}
            </strong>{" "}
            ({pct}%).
          </div>
        </div>

        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: "0.4in",
          }}
        >
          <div style={{ textAlign: "center", minWidth: "2.5in" }}>
            <div
              style={{
                borderTop: "2px solid #0b1a2b",
                paddingTop: "0.08in",
                fontSize: "11pt",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Date
            </div>
            <div style={{ fontSize: "13pt", marginTop: "0.05in" }} data-testid="certificate-date">
              {formatDate(when)}
            </div>
          </div>
          <div style={{ textAlign: "center", minWidth: "2.5in" }}>
            <div
              style={{
                fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
                fontSize: "26pt",
                marginBottom: "-0.05in",
              }}
            >
              Coach Cam
            </div>
            <div
              style={{
                borderTop: "2px solid #0b1a2b",
                paddingTop: "0.08in",
                fontSize: "11pt",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Coach Cam
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
