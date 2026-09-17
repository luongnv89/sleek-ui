export interface ColorTokens {
  light: Record<string, string>;
  dark: Record<string, string>;
}

export interface TypographyTokens {
  fontFamily: {
    sans?: string;
    serif?: string;
    mono?: string;
  };
  fontSize: {
    xs?: string;
    sm?: string;
    base?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
    '3xl'?: string;
    '4xl'?: string;
  };
  fontWeight: {
    normal?: number;
    medium?: number;
    semibold?: number;
    bold?: number;
  };
  lineHeight: {
    tight?: string;
    normal?: string;
    relaxed?: string;
  };
  letterSpacing: {
    tight?: string;
    normal?: string;
    wide?: string;
  };
}

export interface SpacingTokens {
  unit: string;
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
}

export interface RadiusTokens {
  sm: string;
  default: string;
  lg: string;
  full: string;
}

export interface ShadowTokens {
  sm?: string;
  default?: string;
  lg?: string;
}

/** CSS duration — '150ms'-style string or a {value, unit} object. */
export type MotionDuration = string | { value: number; unit: 'ms' | 's' };

/** CSS easing — keyword/library name string, or cubic-bezier control points (W3C DTCG cubicBezier). Stored as a 4-number array, never a 'cubic-bezier(...)' function string. */
export type MotionEasing = string | [number, number, number, number];

/** A single transition/interaction effect — hover, focus, entrance, exit, scroll. */
export interface MotionEffect {
  name: string;
  trigger: 'hover' | 'focus' | 'active' | 'entrance' | 'exit' | 'scroll' | 'load' | 'custom';
  /** Element or component the effect applies to (e.g. 'button', 'card', 'nav'). */
  target?: string;
  /** Animated CSS properties, e.g. ['opacity', 'transform']. */
  properties?: string[];
  /** Duration token name or CSS duration string. */
  duration?: string;
  /** Delay token name or CSS duration string. */
  delay?: string;
  /** Easing token name, CSS keyword, or cubic-bezier control points. */
  easing?: MotionEasing;
  iteration?: number | string;
  /** Name of a motion.keyframes entry this effect plays. */
  keyframes?: string;
  description?: string;
}

export interface MotionTokens {
  /** Named duration scale, e.g. { fast: '150ms', slow: { value: 0.5, unit: 's' } }. */
  duration?: Record<string, MotionDuration>;
  /** Named delay scale — same value shapes as duration. */
  delay?: Record<string, MotionDuration>;
  /** Named easings, e.g. { standard: [0.4, 0, 0.2, 1], bounce: 'ease-out' }. */
  easing?: Record<string, MotionEasing>;
  /** Named iteration counts, e.g. { once: 1, loop: 'infinite' }. */
  iteration?: Record<string, number | string>;
  /** Named @keyframes rules — { name: { offset: { property: value } } }, offsets like '0%', 'from', 'to'. */
  keyframes?: Record<string, Record<string, Record<string, string | number>>>;
  /** Transitions and interaction effects — hover, focus, entrance, exit, scroll behaviors. */
  effects?: MotionEffect[];
}

/** An external library required to reproduce the design. */
export interface DesignLibrary {
  /** Display name, e.g. 'GSAP'. */
  name: string;
  /** npm package name, e.g. 'gsap'. */
  package: string;
  /** Version constraint observed or recommended, e.g. '^3.12.5'. */
  version?: string;
  /** Shell command to install, e.g. 'npm install gsap'. */
  installCommand: string;
  /** What the library is needed for, e.g. 'scroll-driven entrance animations'. */
  purpose: string;
}

export interface FocusRing {
  width: string;
  color: string;
  offset: string;
}

export interface Accessibility {
  contrastTarget?: number;
  focusRing?: FocusRing;
  reducedMotion?: boolean;
}

export interface FontUrl {
  url: string;
  format: string;
  family: string;
}

export interface GoogleFont {
  family: string;
  weights: number[];
}

export interface Fonts {
  google?: GoogleFont[];
  urls: FontUrl[];
}

export interface AgentInstructions {
  defaultMode?: 'light' | 'dark';
  steps: string[];
}

export interface Preview {
  thumbnail?: string;
  screenshots?: {
    light?: string[];
    dark?: string[];
  };
}

export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  shadows?: ShadowTokens;
  motion?: MotionTokens;
}

export interface DesignData {
  $schema: string;
  name: string;
  version: string;
  description: string;
  categories: string[];
  collection?: Collection;
  appTargets?: AppTarget[];
  defaultMode?: 'light' | 'dark';
  author?: {
    name: string;
    email: string;
    url: string;
  };
  tokens: DesignTokens;
  fonts: Fonts;
  accessibility?: Accessibility;
  components?: unknown;
  tokenColors?: Array<{ scope: string; color: string; fontStyle?: string }>;
  libraries?: DesignLibrary[];
  agentInstructions: AgentInstructions;
  preview?: Preview;
}

export type Collection = 'web' | 'terminal' | 'coding';

export type AppTarget = 'pi' | 'ghostty' | 'iterm2' | 'warp' | 'opencode' | 'vscode';

export interface TransformedDesign {
  slug: string;
  name: string;
  categories: string[];
  collection?: Collection;
  appTargets?: AppTarget[];
  colors: {
    primary: string;
    secondary: string;
  };
  defaultMode: 'light' | 'dark';
  jsonUrl: string;
  thumbnailUrl: string;
  detailUrl: string;
  description: string;
  /** Light-mode token colors kept as a compact swatch fallback for catalog cards. */
  palette?: Record<string, string>;
}
