const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const schema = require('../public/schema/design.v1.json');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const validDesign = {
  "$schema": "https://json-schema.org/draft-07/schema",
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
        "background": "#ffffff",
        "surface": "#f9fafb",
        "text": "#111827",
        "textSecondary": "#6b7280",
        "primary": "#3b82f6",
        "primaryHover": "#2563eb",
        "primaryActive": "#1d4ed8",
        "secondary": "#6366f1",
        "secondaryHover": "#4f46e5",
        "secondaryActive": "#4338ca",
        "accent": "#8b5cf6",
        "success": "#10b981",
        "warning": "#f59e0b",
        "error": "#ef4444",
        "info": "#3b82f6",
        "border": "#e5e7eb",
        "divider": "#f3f4f6"
      },
      "dark": {
        "background": "#111827",
        "surface": "#1f2937",
        "text": "#f9fafb",
        "textSecondary": "#9ca3af",
        "primary": "#60a5fa",
        "primaryHover": "#3b82f6",
        "primaryActive": "#2563eb",
        "secondary": "#818cf8",
        "secondaryHover": "#6366f1",
        "secondaryActive": "#4f46e5",
        "accent": "#a78bfa",
        "success": "#34d399",
        "warning": "#fbbf24",
        "error": "#f87171",
        "info": "#60a5fa",
        "border": "#374151",
        "divider": "#1f2937"
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
        "xl": "1.25rem"
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
      "0": "0",
      "1": "0.25rem",
      "2": "0.5rem",
      "3": "0.75rem",
      "4": "1rem",
      "5": "1.25rem",
      "6": "1.5rem",
      "8": "2rem",
      "10": "2.5rem",
      "12": "3rem"
    },
    "radius": {
      "none": "0",
      "sm": "0.125rem",
      "md": "0.375rem",
      "lg": "0.5rem",
      "xl": "0.75rem",
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
        "weights": [400, 500, 600, 700],
        "styles": ["normal"]
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
      "color": "#3b82f6",
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

  test('missing fonts.google should fail', () => {
    const invalidDesign = JSON.parse(JSON.stringify(validDesign));
    delete invalidDesign.fonts.google;
    const isValid = validate(invalidDesign);
    expect(isValid).toBe(false);
  });

  test('missing accessibility fields should fail', () => {
    const invalidDesign = JSON.parse(JSON.stringify(validDesign));
    delete invalidDesign.accessibility.contrastTarget;
    const isValid = validate(invalidDesign);
    expect(isValid).toBe(false);
  });

  test('missing components.button should fail', () => {
    const invalidDesign = JSON.parse(JSON.stringify(validDesign));
    delete invalidDesign.components.button;
    const isValid = validate(invalidDesign);
    expect(isValid).toBe(false);
  });

  test('missing agentInstructions.steps should fail', () => {
    const invalidDesign = JSON.parse(JSON.stringify(validDesign));
    delete invalidDesign.agentInstructions.steps;
    const isValid = validate(invalidDesign);
    expect(isValid).toBe(false);
  });

  test('missing preview.thumbnail should fail', () => {
    const invalidDesign = JSON.parse(JSON.stringify(validDesign));
    delete invalidDesign.preview.thumbnail;
    const isValid = validate(invalidDesign);
    expect(isValid).toBe(false);
  });

  test('missing preview.screenshots.dark should fail', () => {
    const invalidDesign = JSON.parse(JSON.stringify(validDesign));
    delete invalidDesign.preview.screenshots.dark;
    const isValid = validate(invalidDesign);
    expect(isValid).toBe(false);
  });
});
