# Stackt Demo

A clickable kiosk demo for **Stackt**, a smart vending kiosk that mixes fresh pre-workout and post-workout drinks at the gym. Nothing in it is real: there are no payments, no backend and no accounts.

**Live link (after you turn on GitHub Pages):** https://seanali1891.github.io/Stackt-Demo/

## What's in the demo

1. **Welcome screen**: the slogan, a big Start button, a "New flavor of the month" note, and an **Aa** button for larger text and higher contrast.
2. **Member tag**: tap "Member tag", then the scanner, to pretend a member scanned their gym key tag. You'll see their saved stacks with one-tap reorder, a visit streak, rewards progress and an "order ahead from your phone" preview.
3. **Choose** Pre-Workout or Post-Workout.
4. **Build your stack**: pick every ingredient and amount, or start from a signature stack. The cup, the "Your stack" summary, calories, protein and the price update as you tap. A caffeine meter blocks anything over the limit, and taste rules block bad mixes (like citrus with oat milk) or show a taste tip.
5. **Review**: the full recipe, total, calories, protein, caffeine, allergens and a "Members save" callout.
6. **Fake checkout**: Tap to pay, a 5-second "mixing your stack" animation, then "Your Stackt is ready. Grab it below." Members also see rewards progress.
7. **Memberships**: three swipeable plans (8-Pack, Unlimited, Club). You can open this from the welcome screen or from Review. Choosing a plan from Review applies member pricing.
8. **Owner view (hidden)**: tap the Stackt logo 3 times quickly, or press and hold it, on any screen that shows the logo. It has three tabs: **Results** (sales, the gym's share, revenue per member, busiest hours, machine health), **The deal** (contract terms, pilot offer) and **Setup** (what the kiosk needs, permits and insurance, cleaning). Close it with the X.

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

Everything you might want to change is in **`settings.js`**: prices, ingredients, amounts, nutrition, taste rules, signature stacks, membership plans, the demo member, and the owner dashboard numbers and deal terms.

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
