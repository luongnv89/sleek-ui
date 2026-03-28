// Type definitions for Sleek UI Design System

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
}

export interface DesignData {
  $schema: string;
  name: string;
  version: string;
  description: string;
  categories: string[];
  author?: {
    name: string;
    email: string;
    url: string;
  };
  tokens: DesignTokens;
  fonts: Fonts;
  accessibility?: Accessibility;
  components?: unknown;
  agentInstructions: AgentInstructions;
  preview?: Preview;
}

export interface TransformedDesign {
  slug: string;
  name: string;
  categories: string[];
  colors: {
    primary: string;
    secondary: string;
  };
  defaultMode: 'light' | 'dark';
  jsonUrl: string;
  thumbnailUrl: string;
  detailUrl: string;
  description: string;
}
