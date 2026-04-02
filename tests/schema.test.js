const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const schema = require('../public/schema/design.v1.json');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const validDesign = {
  "$schema": "https://luongnv.com/sleek-ui/schema/design.v1.json",
  "name": "Sleek UI",
  "version": "1.0.0",
  "description": "A modern design system",
  "categories": ["ui", "component-library"],
  "author": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "tokens": {
    "colors": {
      "light": {
        "background": "0 0% 100%",
        "foreground": "240 10% 3.9%",
        "muted": "240 4.8% 95.9%",
        "muted-foreground": "240 3.8% 46.1%",
        "primary": "245 90% 73%",
        "primary-foreground": "0 0% 100%",
        "secondary": "240 4.8% 95.9%",
        "secondary-foreground": "240 10% 3.9%",
        "accent": "240 4.8% 95.9%",
        "accent-foreground": "240 10% 3.9%",
        "destructive": "0 84.2% 60.2%",
        "destructive-foreground": "0 0% 100%",
        "border": "240 5.9% 90%",
        "input": "240 5.9% 90%",
        "ring": "245 90% 73%",
        "card": "0 0% 100%",
        "card-foreground": "240 10% 3.9%"
      },
      "dark": {
        "background": "240 33% 14%",
        "foreground": "0 0% 95%",
        "muted": "240 33% 19%",
        "muted-foreground": "240 5% 64.9%",
        "primary": "245 90% 73%",
        "primary-foreground": "0 0% 100%",
        "secondary": "240 33% 19%",
        "secondary-foreground": "0 0% 95%",
        "accent": "240 33% 19%",
        "accent-foreground": "0 0% 95%",
        "destructive": "0 62.8% 30.6%",
        "destructive-foreground": "0 0% 100%",
        "border": "240 33% 22%",
        "input": "240 33% 22%",
        "ring": "245 90% 73%",
        "card": "240 33% 17%",
        "card-foreground": "0 0% 95%"
      }
    },
    "typography": {
      "fontFamily": {
        "sans": "Inter, sans-serif",
        "serif": "Merriweather, serif",
        "mono": "JetBrains Mono, monospace"
      },
      "fontSize": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem"
      },
      "fontWeight": {
        "normal": 400,
        "medium": 500,
        "semibold": 600,
        "bold": 700
      },
      "lineHeight": {
        "tight": "1.25",
        "normal": "1.5",
        "relaxed": "1.75"
      },
      "letterSpacing": {
        "tight": "-0.025em",
        "normal": "0",
        "wide": "0.025em"
      }
    },
    "spacing": {
      "unit": "4px",
      "xs": "4px",
      "sm": "8px",
      "md": "16px",
      "lg": "24px",
      "xl": "32px",
      "2xl": "48px"
    },
    "radius": {
      "sm": "0.125rem",
      "default": "0.375rem",
      "lg": "0.5rem",
      "full": "9999px"
    },
    "shadows": {
      "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
    }
  },
  "fonts": {
    "google": [
      {
        "family": "Inter",
        "weights": [400, 500, 600, 700]
      }
    ],
    "urls": [
      {
        "url": "https://fonts.example.com/inter.css",
        "format": "css",
        "family": "Inter"
      }
    ]
  },
  "accessibility": {
    "contrastTarget": 4.5,
    "focusRing": {
      "width": "2px",
      "color": "currentColor",
      "offset": "2px"
    },
    "reducedMotion": true
  },
  "components": {
    "button": {
      "primary": {
        "background": "#3b82f6",
        "color": "#ffffff",
        "borderRadius": "0.375rem",
        "padding": "0.5rem 1rem",
        "fontWeight": "600"
      },
      "secondary": {
        "background": "#6366f1",
        "color": "#ffffff",
        "borderRadius": "0.375rem",
        "padding": "0.5rem 1rem",
        "fontWeight": "600"
      },
      "ghost": {
        "background": "transparent",
        "color": "#3b82f6",
        "borderRadius": "0.375rem",
        "padding": "0.5rem 1rem",
        "fontWeight": "600"
      }
    },
    "card": {
      "background": "#ffffff",
      "borderRadius": "0.5rem",
      "padding": "1.5rem",
      "shadow": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      "border": "1px solid #e5e7eb"
    },
    "input": {
      "background": "#ffffff",
      "color": "#111827",
      "borderRadius": "0.375rem",
      "padding": "0.5rem 0.75rem",
      "border": "1px solid #d1d5db",
      "focusRing": "0 0 0 2px #3b82f6",
      "placeholderColor": "#9ca3af"
    }
  },
  "agentInstructions": {
    "steps": [
      "Analyze the design tokens",
      "Apply consistent spacing",
      "Ensure accessibility compliance"
    ]
  },
  "preview": {
    "thumbnail": "/preview/thumbnail.png",
    "screenshots": {
      "light": ["/preview/light/1.png", "/preview/light/2.png"],
      "dark": ["/preview/dark/1.png", "/preview/dark/2.png"]
    }
  }
};

describe('design.v1.json schema validation', () => {
  const validate = ajv.compile(schema);

  test('valid design JSON should pass validation', () => {
    const isValid = validate(validDesign);
    if (!isValid) {
      console.error('Validation errors:', validate.errors);
    }
    expect(isValid).toBe(true);
  });

  test('empty object should fail validation', () => {
    const isValid = validate({});
    expect(isValid).toBe(false);
    expect(validate.errors).toBeDefined();
    expect(validate.errors.length).toBeGreaterThan(0);
  });

  test('missing required top-level fields should fail', () => {
    const invalidDesign = JSON.parse(JSON.stringify(validDesign));
    delete invalidDesign.name;
    const isValid = validate(invalidDesign);
    expect(isValid).toBe(false);
  });

  test('missing tokens.colors.light should fail', () => {
    const invalidDesign = JSON.parse(JSON.stringify(validDesign));
    delete invalidDesign.tokens.colors.light;
    const isValid = validate(invalidDesign);
    expect(isValid).toBe(false);
  });

  test('missing 17 semantic color roles should fail', () => {
    const invalidDesign = JSON.parse(JSON.stringify(validDesign));
    delete invalidDesign.tokens.colors.light.primary;
    const isValid = validate(invalidDesign);
    expect(isValid).toBe(false);
  });

  test('missing fonts.urls should fail', () => {
    const invalidDesign = JSON.parse(JSON.stringify(validDesign));
    delete invalidDesign.fonts.urls;
    const isValid = validate(invalidDesign);
    expect(isValid).toBe(false);
  });

  test('missing accessibility.focusRing should pass (optional)', () => {
    const invalidDesign = JSON.parse(JSON.stringify(validDesign));
    delete invalidDesign.accessibility.focusRing;
    const isValid = validate(invalidDesign);
    expect(isValid).toBe(true);
  });

  test('missing components should pass (optional)', () => {
    const invalidDesign = JSON.parse(JSON.stringify(validDesign));
    delete invalidDesign.components;
    const isValid = validate(invalidDesign);
    expect(isValid).toBe(true);
  });

  test('missing agentInstructions.steps should fail', () => {
    const invalidDesign = JSON.parse(JSON.stringify(validDesign));
    delete invalidDesign.agentInstructions.steps;
    const isValid = validate(invalidDesign);
    expect(isValid).toBe(false);
  });

  test('missing preview.thumbnail should pass (optional)', () => {
    const invalidDesign = JSON.parse(JSON.stringify(validDesign));
    delete invalidDesign.preview.thumbnail;
    const isValid = validate(invalidDesign);
    expect(isValid).toBe(true);
  });
});
