import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

// ── Brand ──────────────────────────────────────────────────────────────────
const FONT_SANS = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FONT_MONO = "'Fira Code', 'JetBrains Mono', Consolas, monospace";

const C = {
  bg: "#090909",
  card: "#111111",
  border: "#1f1f1f",
  green: "#00FF41",
  text: "#ffffff",
  muted: "#71717a",
};

// ── Helpers ────────────────────────────────────────────────────────────────
function fadeIn(frame: number, fps: number, delay = 0, damping = 200) {
  return spring({ frame: frame - delay, fps, config: { damping } });
}

function slideUp(opacity: number, distance = 80) {
  return `translateY(${interpolate(opacity, [0, 1], [distance, 0])}px)`;
}

// ── Logo mark (SVG) ────────────────────────────────────────────────────────
const LogoMark = ({ size = 96 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" width={size} height={size}>
    <line x1="10" y1="14" x2="38" y2="14" stroke="white" strokeWidth="4" strokeLinecap="square" />
    <line x1="38" y1="14" x2="20" y2="50" stroke="white" strokeWidth="4" strokeLinecap="square" />
    <line x1="20" y1="50" x2="54" y2="50" stroke="white" strokeWidth="4" strokeLinecap="square" />
    <circle cx="29" cy="32" r="3.5" fill={C.green} />
  </svg>
);

// ── Scene 1: Hero ──────────────────────────────────────────────────────────
const Scene1_Hero = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logo = fadeIn(frame, fps, 0);
  const tagline = fadeIn(frame, fps, 10);
  const title1 = fadeIn(frame, fps, 20);
  const title2 = fadeIn(frame, fps, 30);
  const sub = fadeIn(frame, fps, 50);
  const url = fadeIn(frame, fps, 70);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      {/* Subtle grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: "120px 120px",
      }} />
      {/* Green glow */}
      <div style={{
        position: "absolute",
        top: "30%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 1200, height: 1200,
        background: `radial-gradient(circle, ${C.green}18 0%, transparent 70%)`,
        opacity: sub,
      }} />

      <div style={{ opacity: logo, transform: slideUp(logo), marginBottom: 80 }}>
        <LogoMark size={128} />
      </div>

      <div style={{ opacity: tagline, transform: slideUp(tagline), marginBottom: 48 }}>
        <span style={{
          fontFamily: FONT_SANS, fontSize: 28, fontWeight: 600,
          color: C.muted, letterSpacing: "0.15em", textTransform: "uppercase",
        }}>
          The Unsplash of Design Systems for AI Agents
        </span>
      </div>

      <h1 style={{
        fontFamily: FONT_SANS, fontSize: 220, fontWeight: 900, lineHeight: 1,
        color: C.text, margin: 0, textAlign: "center",
        opacity: title1, transform: slideUp(title1, 100),
      }}>
        sleek<span style={{ color: C.green }}>ui</span>
      </h1>

      <p style={{
        fontFamily: FONT_SANS, fontSize: 52, color: C.muted,
        margin: "64px 0 0", textAlign: "center", maxWidth: 1400, lineHeight: 1.6,
        opacity: sub, transform: slideUp(sub),
      }}>
        Paste a URL. Get a professional UI.<br />
        <strong style={{ color: C.text }}>59+ curated design systems</strong> ready for any AI coding agent.
      </p>

      <div style={{
        marginTop: 120, opacity: url,
        fontFamily: FONT_MONO, fontSize: 36, color: C.green,
      }}>
        luongnv.com/sleek-ui
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: How it works ─────────────────────────────────────────────────
const Scene2_HowItWorks = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const title = fadeIn(frame, fps, 0);
  const s1 = fadeIn(frame, fps, 20, 15);
  const s2 = fadeIn(frame, fps, 50, 15);
  const s3 = fadeIn(frame, fps, 80, 15);

  const steps = [
    { n: "01", label: "Browse the catalog", desc: "Pick a design that matches your brand vibe.", spring: s1 },
    { n: "02", label: "Copy the prompt", desc: "One click — the full agent prompt is ready.", spring: s2 },
    { n: "03", label: "Send to your AI agent", desc: "Paste into Claude Code, Cursor, Codex — any agent.", spring: s3 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: "120px 120px",
      }} />

      <h2 style={{
        fontFamily: FONT_SANS, fontSize: 120, fontWeight: 800,
        color: C.text, margin: "0 0 128px", textAlign: "center",
        opacity: title, transform: slideUp(title),
      }}>
        Three steps to a <span style={{ color: C.green }}>beautiful UI</span>
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 48, width: 1720 }}>
        {steps.map((step) => (
          <div key={step.n} style={{
            display: "flex", alignItems: "center", gap: 64,
            opacity: step.spring, transform: slideUp(step.spring, 60),
          }}>
            <span style={{
              fontFamily: FONT_MONO, fontSize: 32, fontWeight: 700,
              color: C.green, width: 64, flexShrink: 0,
            }}>{step.n}</span>
            <div style={{
              flex: 1, backgroundColor: C.card, borderRadius: 32,
              border: `1px solid ${C.border}`, padding: "48px 64px",
            }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 44, fontWeight: 700, color: C.text }}>{step.label}</div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 32, color: C.muted, marginTop: 12 }}>{step.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: Prompt demo ──────────────────────────────────────────────────
const PROMPT = `Fetch the design system at:
https://luongnv.com/sleek-ui/designs/stripe.json

Read the JSON, then follow agentInstructions.steps:
1. Set CSS custom properties on :root and .dark
2. Set --radius from tokens.radius.default
3. Load fonts via Google Fonts <link> tag
4. Apply component styles (Tailwind + shadcn/ui)
5. Test both light and dark modes`;

const Scene3_Prompt = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const title = fadeIn(frame, fps, 0);
  const card = fadeIn(frame, fps, 20);

  // Typewriter: reveal characters one by one
  const charsPerFrame = 2.5;
  const typewriterStart = 30;
  const charsVisible = Math.floor(Math.max(0, frame - typewriterStart) * charsPerFrame);
  const visibleText = PROMPT.slice(0, charsVisible);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: "120px 120px",
      }} />

      <h2 style={{
        fontFamily: FONT_SANS, fontSize: 104, fontWeight: 800,
        color: C.text, margin: "0 0 96px", textAlign: "center",
        opacity: title, transform: slideUp(title),
      }}>
        Just paste this <span style={{ color: C.green }}>prompt</span>
      </h2>

      <div style={{
        width: 1800, backgroundColor: C.card, borderRadius: 40,
        border: `1px solid ${C.border}`, overflow: "hidden",
        opacity: card, transform: slideUp(card, 40),
      }}>
        {/* Terminal bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          padding: "28px 40px", borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: "#ef4444" }} />
          <div style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: "#eab308" }} />
          <div style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: "#22c55e" }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 26, color: C.muted, marginLeft: 16 }}>claude — AI Agent Prompt</span>
        </div>
        <pre style={{
          fontFamily: FONT_MONO, fontSize: 34, color: C.text,
          margin: 0, padding: "64px 72px", lineHeight: 1.8,
          whiteSpace: "pre-wrap", minHeight: 520,
        }}>
          {visibleText}
          <span style={{ opacity: frame % 30 < 15 ? 1 : 0, color: C.green }}>▌</span>
        </pre>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: Design showcase ──────────────────────────────────────────────
const DESIGNS = [
  { name: "Stripe", accent: "#635BFF", desc: "Clean & professional" },
  { name: "Linear", accent: "#5E6AD2", desc: "Developer-focused" },
  { name: "Vercel", accent: "#ffffff", desc: "Minimal & sharp" },
  { name: "Supabase", accent: "#3ECF8E", desc: "Open-source green" },
  { name: "Raycast", accent: "#FF6363", desc: "Focused & fast" },
  { name: "Notion", accent: "#e9e9e7", desc: "Clean workspace" },
];

const Scene4_Showcase = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const title = fadeIn(frame, fps, 0);
  const count = fadeIn(frame, fps, 15);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: "120px 120px",
      }} />

      <h2 style={{
        fontFamily: FONT_SANS, fontSize: 104, fontWeight: 800,
        color: C.text, margin: "0 0 24px", textAlign: "center",
        opacity: title, transform: slideUp(title),
      }}>
        Inspired by the <span style={{ color: C.green }}>world's best brands</span>
      </h2>
      <p style={{
        fontFamily: FONT_SANS, fontSize: 40, color: C.muted,
        margin: "0 0 96px", textAlign: "center",
        opacity: count, transform: slideUp(count),
      }}>
        59+ design systems and counting
      </p>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: 40, width: 1920,
      }}>
        {DESIGNS.map((d, i) => {
          const s = fadeIn(frame, fps, 20 + i * 12, 20);
          return (
            <div key={d.name} style={{
              backgroundColor: C.card, borderRadius: 32,
              border: `1px solid ${C.border}`, padding: "56px 56px",
              opacity: s, transform: slideUp(s, 60),
            }}>
              {/* Color preview bar */}
              <div style={{
                height: 12, borderRadius: 6,
                backgroundColor: d.accent,
                marginBottom: 40,
                width: "40%",
              }} />
              <div style={{ fontFamily: FONT_SANS, fontSize: 40, fontWeight: 700, color: C.text }}>{d.name}</div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 28, color: C.muted, marginTop: 8 }}>{d.desc}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 5: CTA ──────────────────────────────────────────────────────────
const Scene5_CTA = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logo = fadeIn(frame, fps, 0);
  const line1 = fadeIn(frame, fps, 15);
  const line2 = fadeIn(frame, fps, 30);
  const url = fadeIn(frame, fps, 50, 10);
  const tagline = fadeIn(frame, fps, 70);

  const glow = interpolate(frame, [0, 60], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: "120px 120px",
      }} />
      <div style={{
        position: "absolute", top: "40%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 1400, height: 1400,
        background: `radial-gradient(circle, ${C.green}14 0%, transparent 65%)`,
        opacity: glow,
      }} />

      <div style={{ opacity: logo, transform: slideUp(logo), marginBottom: 80 }}>
        <LogoMark size={144} />
      </div>

      <h2 style={{
        fontFamily: FONT_SANS, fontSize: 192, fontWeight: 900,
        color: C.text, margin: 0, textAlign: "center", lineHeight: 1,
        opacity: line1, transform: slideUp(line1, 100),
      }}>
        Build beautifully.
      </h2>
      <h2 style={{
        fontFamily: FONT_SANS, fontSize: 192, fontWeight: 900,
        color: C.green, margin: "16px 0 0", textAlign: "center", lineHeight: 1,
        opacity: line2, transform: slideUp(line2, 80),
      }}>
        Instantly.
      </h2>

      <div style={{
        marginTop: 112,
        backgroundColor: C.card, borderRadius: 28,
        border: `1px solid ${C.border}`, padding: "40px 80px",
        opacity: url, transform: slideUp(url),
      }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 44, color: C.green }}>
          luongnv.com/sleek-ui
        </span>
      </div>

      <p style={{
        fontFamily: FONT_SANS, fontSize: 32, color: C.muted,
        margin: "80px 0 0", opacity: tagline,
      }}>
        Free · Open source · Apache 2.0 Licensed
      </p>
    </AbsoluteFill>
  );
};

// ── Root composition ──────────────────────────────────────────────────────
// Scene durations (frames @ 30fps)
const D = {
  hero: 150,
  howItWorks: 180,
  prompt: 210,
  showcase: 180,
  cta: 150,
  transition: 20,
};

export const PromotionalVideo = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={D.hero}>
        <Scene1_Hero />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: D.transition })}
      />

      <TransitionSeries.Sequence durationInFrames={D.howItWorks}>
        <Scene2_HowItWorks />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: D.transition })}
      />

      <TransitionSeries.Sequence durationInFrames={D.prompt}>
        <Scene3_Prompt />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: D.transition })}
      />

      <TransitionSeries.Sequence durationInFrames={D.showcase}>
        <Scene4_Showcase />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: D.transition })}
      />

      <TransitionSeries.Sequence durationInFrames={D.cta}>
        <Scene5_CTA />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

// Total frames: 150+180+210+180+150 - 4*20 = 790
