# Stackt Demo

A clickable kiosk demo for **Stackt**, a smart vending kiosk that mixes fresh pre-workout and post-workout drinks at the gym. Nothing in it is real: there are no payments, no backend and no accounts.

**Live link (after you turn on GitHub Pages):** https://seanali1891.github.io/Stackt-Demo/

## What's in the demo

1. **Welcome screen**: "Fresh-mixed. Built by you." with a big Start button.
2. **Choose** Pre-Workout or Post-Workout.
3. **Build your stack**: pick every ingredient and amount, or start from a signature stack. The cup, the "Your stack" summary and the price update as you tap. A caffeine meter blocks anything over the limit.
4. **Review**: the full recipe, the total and a "Members save" callout.
5. **Fake checkout**: Tap to pay, a 5-second "mixing your stack" animation, then "Your Stackt is ready. Grab it below."
6. **Memberships**: three swipeable plan ideas (Pack, Unlimited, Member discount). You can open this from the welcome screen or from Review. Choosing a plan from Review applies member pricing.
7. **Owner view (hidden)**: tap the Stackt logo 3 times quickly, or press and hold it, on any screen that shows the logo. Close it with the X.

## Turn on GitHub Pages (one time)

1. Merge this work into the `main` branch. On the repository page, open **Pull requests**, open the pull request for this branch, then click **Merge pull request** and **Confirm merge**.
2. Click **Settings** (top of the repository page), then **Pages** in the left menu.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Set **Branch** to `main` and the folder to `/ (root)`, then click **Save**.
5. Wait 1 to 2 minutes and open https://seanali1891.github.io/Stackt-Demo/

## Add it to an iPhone home screen

1. Open the link in **Safari** (it has to be Safari).
2. Tap the **Share** button (the square with an arrow pointing up).
3. Scroll down and tap **Add to Home Screen**, then **Add**.
4. Open Stackt from the new home screen icon. It runs full screen with no Safari bars.

## Change a price or anything else

Everything you might want to change is in **`settings.js`**: prices, ingredients, amounts, signature stacks, membership plans and owner dashboard numbers.

1. On GitHub, open `settings.js` and click the **pencil** icon (Edit).
2. Change the number, for example `price: 0.75` to `price: 0.95`. Keep the comma at the end of the line and keep words inside "quotes".
3. Click **Commit changes**.
4. Wait about a minute, then reload the demo. On the home screen app, swipe it closed and reopen it.

If the demo shows **"settings.js has a typo"**, look at the line you changed last. The usual cause is a missing comma or quote mark.

## Files

| File | What it is |
|---|---|
| `settings.js` | All prices, ingredients, plans and dashboard numbers. The only file you need to edit. |
| `index.html` | The page itself |
| `assets/` | Styles, app code and icons |
| `manifest.webmanifest`, `sw.js` | Make it work as a full-screen home screen app, including offline |
