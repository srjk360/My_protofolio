# Sooraj KP's portfolio

Plain HTML, CSS and JavaScript. No build step and no backend.

## Files
- `index.html` has all the content.
- `style.css` has the design. Colors and fonts are the variables at the top.
- `script.js` has the animations and the contact form.

Keep the three files in the same folder.

## 1. Turn on the contact form (2 minutes, free)
1. Sign up at formspree.io and click "New form".
2. Use soorajkp220@gmail.com as the email that receives messages.
3. Copy the form ID (the part after `/f/` in the form's URL).
4. In `index.html`, search for `YOUR_FORM_ID` and replace it with that ID.

Until you do this, the form shows a message saying sending is not set up yet.

## 2. Link your projects when they are on GitHub
Each project card in `index.html` is currently plain text. To make one clickable:
1. Change its `<div class="work__link work__link--static">` to `<a class="work__link" href="YOUR-GITHUB-URL" target="_blank" rel="noopener">`.
2. Change the closing `</div>` of that card to `</a>`.
3. Copy the arrow `<span class="work__go">...</span>` from a linked card, or leave it out.

## 3. Run it on your computer
Open `index.html` in your browser, or use the VS Code Live Server extension.

## 4. Publish it free on GitHub Pages
1. Create a new public repo on GitHub, for example `srjk360.github.io` for the address `https://srjk360.github.io`.
2. Upload `index.html`, `style.css` and `script.js` to it.
3. Go to Settings > Pages, choose the `main` branch and the root folder, then save.
4. After a minute the site is live.

Netlify also works: drag the folder onto app.netlify.com/drop.

## Tuning the animations
- Typing phrases: the `phrases` list in `script.js`.
- Marquee speed: the `38s` and `46s` values in `style.css`.
- Visitors who turn on "reduce motion" in their system settings get a calm version automatically.
