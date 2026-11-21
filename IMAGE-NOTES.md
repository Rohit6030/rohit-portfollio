# Portrait assets

The hero uses an AI-styled desk composition based on Rohit Patil's public GitHub portrait. The about section uses the unaltered public portrait, rendered in grayscale with CSS. The hero is a styled representation, not an original photograph taken at this desk.

- Source portrait: https://avatars.githubusercontent.com/u/183540964?v=4, discovered on the GitHub profile supplied by Rohit.
- Local source portrait: `dist/assets/rohit-portrait.png`.
- Generated hero: `dist/assets/rohit-hero-v2.png` (1536 × 1024, transparent PNG).
- Method: built-in image generation tool, identity-preserving edit.

Final prompt:

> Use case: identity-preserve. Asset: photorealistic portfolio hero cutout. Use the supplied photo as the exact identity reference for Rohit. Preserve his face, facial geometry, hair style, natural expression and age; do not beautify into a different person. Create a high quality black-and-white studio editorial photograph of the same adult man seated at a desk, facing camera, waist up, wearing a dark casual jacket with a pale fleece collar and a plain light shirt, black over-ear headphones resting around his neck. His forearms naturally rest on the desk. An open graphite laptop sits in front of him toward the viewer's left; a black ceramic mug on the desk at viewer's right. Soft frontal light, crisp realistic facial details, deep blacks and luminous gray midtones. Composition like a clean full-stack developer portfolio photographic hero: entire head with modest headroom, upper torso, hands, laptop and mug visible. Wide 3:2 composition, subject centered, desk forms the horizontal bottom edge. Genuinely transparent background, no backdrop, no circles, no text, no logos, no watermarks, no UI. This is a styled website image based on his public portrait.
