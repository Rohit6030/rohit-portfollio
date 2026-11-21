# Publish the portfolio

The website has been checked locally and uploaded to Netlify. The owner reported claiming the upload, but the previous address still returns a password page to fresh visitors. Unrestricted public access remains unverified; see `PUBLIC-LINK.md`. A localhost address such as http://127.0.0.1:4173 works only on the computer running its server.

## Files to publish

Publish the contents of `dist/`, or upload `website-for-hosting.zip`. The hosting ZIP has `index.html` at its top level and includes all styles, scripts and image assets. No build step or dependencies are required.

The included `portfolio-preview.html` is a self-contained local preview. The editable source files are in `dist/`.

## Manual hosting option

1. Open https://app.netlify.com/drop in your browser.
2. Sign in to the Netlify account where you want to keep the website.
3. Upload `website-for-hosting.zip`, or drop the `dist` folder.
4. Choose public project visibility if it is private by default.
5. Open the resulting `https://...netlify.app` link while signed out to confirm that visitors can view it, then use that URL on LinkedIn.

Anonymous Netlify Drop projects are protected with a temporary password until claimed. They are not the same as an unrestricted public website.

Official instructions: https://docs.netlify.com/start/quickstarts/netlify-drop-quickstart/

## Social preview

After the final public hostname is known, update `og:image` in `dist/index.html` to that hostname followed by `/assets/social-cover-v3.png`, and upload the updated source again.

## Existing Sites registration

The existing project identity is retained in `.openai/hosting.json`. The supported publishing helper was blocked by automatic approval review because sandbox approvals are disabled in this environment. Reuse this project if publishing through Sites becomes available; do not register a duplicate solely because publication has not completed.
