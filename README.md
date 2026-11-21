# Rohit Patil — Full Stack Developer

A professional portfolio with an original responsive design: warm paper, dark ink, restrained cobalt accents, editorial typography, and a monochrome portrait panel. The page introduces Rohit's focus on full stack engineering, enterprise solutions, banking and FinTech applications. It includes his supplied LinkedIn and GitHub links, a featured LoanPro application, two public code repositories, and an interactive Angular / Node.js / PostgreSQL toolkit.

## Preview

Open the accompanying `portfolio-preview.html` directly in a browser. The preview bundles its CSS, JavaScript and artwork into one file. For the editable website, open `dist/index.html` or run `node serve.mjs` and open the printed local address. No build step or npm installation is required. Google Fonts are optional, with local font fallbacks.

## Personal information

Edit `dist/profile.js` for profile details and project links. The page's static HTML, metadata and social cover should be updated alongside the profile for a consistent preview when JavaScript is disabled or the page is shared.

An email address, résumé and location were not supplied. The page uses LinkedIn as its primary contact and omits unavailable controls. The portrait on Rohit's supplied GitHub profile is used for the about photo; a transparent AI-styled monochrome desk composition based on that portrait is used for the hero. This styled image is not an original photograph taken at this desk. See `IMAGE-NOTES.md` for the source, method and prompt. Replace the hero with a real desk photograph at any time.

## Featured project

LoanPro · KredPool Bank — https://loanprobank.kredpool.ai/

The public page identifies the application as loan origination and management software and opens at sign-in. The portfolio does not claim unprovided responsibilities, project technologies, security certifications or business results. The embedded interface study is an authored interactive UI concept with fictional records and sample counts. It is labeled as a concept and does not reproduce private application screens or live financial data. Its Overview and Activity tabs can be used with a pointer or keyboard.

The repository cards link to [`ticket_system`](https://github.com/Rohit6030/ticket_system) (EJS) and [`Assignment`](https://github.com/Rohit6030/Assignment) (Java), public repositories verified on Rohit's GitHub profile. Their descriptions do not claim features or business results that were not supplied.

## Behaviour

The toolkit explorer has three selectable layers: Interface / Angular, Services / Node.js, and Data / PostgreSQL. Diagram buttons and keyboard-operable tabs update the matching description and technology focus. This is Rohit's personal toolkit; it is not presented as LoanPro's verified architecture.

The page includes responsive mobile navigation, a keyboard-accessible project overview dialog and a full motion layer: staged headline reveals, an animated particle background, a continuous skills strip, staggered content entrances, pointer-responsive portrait and repository cards, project highlights, animated toolkit panels, moving connection dots, contact orbits, rotating focus words and scroll progress.

The floating Pause motion control stops decorative movement and remains available throughout the page. Device reduced-motion preferences are respected unless a visitor explicitly enables motion. The canvas pauses when the hero is outside the viewport or the tab is hidden; narrow screens use fewer background particles, and touch devices omit pointer tilt. Animation settings are remembered locally when storage is available. Edit `dist/motion.css` and `dist/motion.js` to adjust the effects; the core navigation, profile, projects and motion preference are in `dist/app.js`.

The UI/UX layer adds a sticky glass header, visible focus states, tactile button feedback, subtle click ripples, keyboard-accessible concept tabs, outside-click dismissal of the mobile menu, and a Copy LinkedIn link action with honest success or failure feedback. Edit `dist/ux.css` and `dist/ux.js` to adjust these interactions. The interface concept uses fictional sample data.

LinkedIn, GitHub and repository destinations are ordinary external links. The featured project offers both an overview and a direct application link; without JavaScript, its overview link still opens the application and all portfolio content remains readable.

The current social artwork is `dist/assets/social-cover-v3.svg` with a 1200 × 630 PNG export at `dist/assets/social-cover-v3.png`. These are authored typography graphics matching the portfolio's RP monogram, colors and headline. Use the PNG for social previews, including LinkedIn.

## Hosting

The site was uploaded to Netlify at https://nimble-marshmallow-2bf41e.netlify.app/ and its rendered website was verified. The owner reported claiming it on 21 October 2026. A fresh visitor check still returns HTTP 401 and a password page at this address; the claimed project's current Production URL and public visibility need verification. See `PUBLIC-LINK.md` for current status and `DEPLOYMENT.md` for hosting instructions.

The original Sites project configuration remains in `.openai/hosting.json`; that publishing route was blocked by automatic approval review because sandbox approvals are disabled in this environment. Set `og:image` to the final public hostname followed by `/assets/social-cover-v3.png` after publication, then upload the updated source.
