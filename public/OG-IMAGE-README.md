# Open Graph Image

## Required Image: og-image.png

The SEO setup references `/og-image.png` for social media sharing (Open Graph and Twitter Cards).

### Specifications
- **Filename**: `og-image.png`
- **Location**: `/public/og-image.png`
- **Dimensions**: 1200x630px (optimal for all platforms)
- **Format**: PNG or JPG
- **File size**: < 1MB recommended

### Content Suggestions
Your OG image should include:
1. App name: "Blue Noise Dither"
2. Tagline: "High-Quality Image Dithering Tool"
3. Visual example: Before/after dithering comparison
4. Brand colors from your design system
5. Clean, professional design

### How to Create

#### Option 1: Design Tool (Recommended)
- Use Figma, Canva, or Photoshop
- Create a 1200x630px canvas
- Include branding and example
- Export as PNG

#### Option 2: Screenshot
- Take a screenshot of your app in action
- Crop/resize to 1200x630px
- Add text overlay if needed

#### Option 3: Online Generator
- Use tools like https://www.opengraph.xyz/
- Upload example images
- Add text and branding
- Download result

### Once Created

1. Save the image as `og-image.png`
2. Place it in the `/public` directory
3. Test with validators:
   - Twitter: https://cards-dev.twitter.com/validator
   - Facebook: https://developers.facebook.com/tools/debug/
   - LinkedIn: https://www.linkedin.com/post-inspector/

## Current Status

⚠️ **Action Required**: The OG image is referenced in metadata but needs to be created.

The metadata in `app/layout.tsx` is already configured to use this image. Once you add `og-image.png` to the public directory, social sharing will work automatically.
