# Bio Site

A responsive personal profile page with animated effects, a music player, Discord status integration, and an optional visitor counter for Vercel.

## Features

- Responsive profile card and social links
- Optional Discord status via Lanyard
- Background video and lightweight visual effects
- Music player with seek, skip, and shuffled playback
- Optional visitor counter backed by Upstash Redis on Vercel
- Intro screen with a **Click to Enter** interaction

## Project structure

```text
index.html
css/style.css
js/config.js
js/profile.js
js/player.js
js/fx.js
api/views.js
assets/
vercel.json
```

## Configuration

Edit `js/config.js` to customize the profile, links, social accounts, languages, visual effects, background media, and music tracks.

The supplied profile values are retained as an example. Replace IDs, URLs, profile text, and media with your own before deploying.

## Run locally

Open `index.html` in a browser to preview the front end. The visitor counter requires the Vercel serverless function and Redis environment variables, so it will not work from a plain local file.

For local Vercel development:

```bash
npx vercel dev
```

## Deploy to Vercel

1. Push this project to a Git repository.
2. Import the repository into Vercel and use the **Other** framework preset.
3. Create or connect an Upstash Redis database.
4. Ensure the Redis environment variables are available to the project.
5. Redeploy.

Supported Redis variables:

- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- or `KV_REST_API_URL` and `KV_REST_API_TOKEN`

Optional visitor-counter settings:

- `VIEWS_BASE`: starting offset (default `0`).
- `VIEWS_TTL_HOURS`: count a browser again after this many hours (default `24`; set to `0` to count every page load).
- `VIEWS_SALT`: optional value used when hashing visitor identifiers.

## Media and licensing

The original bio-site source code authored by Nero298 is released under the MIT License in `LICENSE`. **The MIT License does not cover the MP3/music files or other media/assets.** Music and other third-party assets remain subject to their respective copyright and licensing terms; no permission to redistribute them is granted by this repository. Remove them or verify you have permission before making the repository public.
