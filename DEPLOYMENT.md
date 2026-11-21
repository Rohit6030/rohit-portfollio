# Publish the portfolio

The website is hosted on Netlify at https://portfoliorohit14.netlify.app/.

## Publishing configuration

`netlify.toml` configures Netlify to deploy `dist/` as the publish directory. `dist/index.html` is served at the site root (`/`) along with all assets, stylesheets, and scripts.

```toml
[build]
  publish = "dist"
```

## Local preview

Run `npm start` (or `node serve.mjs`) to test the site locally at http://127.0.0.1:4173.
The editable source files are in `dist/`.
