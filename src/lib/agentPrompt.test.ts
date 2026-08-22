import { buildAgentPrompt } from './agentPrompt';

describe('buildAgentPrompt', () => {
  it('renders the exact prompt unchanged from the pre-refactor output', () => {
    const url = 'https://luongnv.com/sleek-ui/designs/stripe.json';
    expect(buildAgentPrompt(url)).toBe(
      `Fetch the design system at: https://luongnv.com/sleek-ui/designs/stripe.json

Read the JSON, then follow the steps in agentInstructions.steps to apply this design system to my project:

1. Set CSS custom properties from tokens.colors on :root (light) and .dark (dark mode)
2. Set --radius from tokens.radius.default
3. Load fonts by adding the Google Fonts URL from fonts.urls as a <link> tag
4. Set font-family from tokens.typography.fontFamily
5. Apply component styles from the components field (Tailwind class names for shadcn projects)
6. Ensure focus states match accessibility.focusRing specification
7. Test both light and dark modes

Target framework: Tailwind CSS + shadcn/ui. For other frameworks, map token names to CSS custom properties semantically.`,
    );
  });

  it('interpolates any design URL', () => {
    expect(buildAgentPrompt('https://example.com/x.json').startsWith('Fetch the design system at: https://example.com/x.json')).toBe(true);
  });
});
