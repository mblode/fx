import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";

export default defineConfig({
  extends: [core, next],
  ignorePatterns: core.ignorePatterns,
  // Rules relaxed for this codebase's pre-existing patterns. Each fires broadly
  // (shadcn-generated components, the canvas/pixel dithering hot loops, and the
  // sequential video-frame encoder) and needs a wide mechanical refactor with no
  // safe autofix, so they're deferred rather than disabled ad hoc. Every other
  // Ultracite rule is enforced.
  rules: {
    // Generated shadcn components and the dither helpers use `function`
    // declarations throughout; converting all also fights hoisting.
    "func-style": "off",
    "no-use-before-define": "off",
    // Sorting keys in config/style objects is churn with no behavioural benefit.
    "sort-keys": "off",
    // `++` and direct `await` in loops are idiomatic in the pixel and
    // frame-by-frame encoding loops, which must run sequentially.
    "no-plusplus": "off",
    "no-await-in-loop": "off",
    // Canvas image loading wraps `img.onload`/`new Promise` by design.
    "unicorn/prefer-add-event-listener": "off",
    "promise/avoid-new": "off",
    "promise/prefer-await-to-then": "off",
    // Remaining pre-existing patterns in generated/utility code.
    "no-inline-comments": "off",
    "no-shadow": "off",
    "no-param-reassign": "off",
    "prefer-destructuring": "off",
    "require-unicode-regexp": "off",
    "prefer-named-capture-group": "off",
    "require-await": "off",
    "unicorn/prefer-ternary": "off",
    "unicorn/prefer-number-coercion": "off",
    "unicorn/no-zero-fractions": "off",
    "unicorn/no-document-cookie": "off",
    "unicorn/require-post-message-target-origin": "off",
    "@next/next/no-img-element": "off",
  },
});
