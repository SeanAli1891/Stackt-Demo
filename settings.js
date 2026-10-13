/* =====================================================================
   STACKT DEMO SETTINGS
   =====================================================================

   This is the ONLY file you need to edit to change the demo.
   Every price, ingredient, membership plan, and owner-dashboard number
   lives here. Nothing in here is real: no payments, no accounts.

   HOW TO EDIT SAFELY
   ------------------
   * Change the numbers and the words inside "quotes". Leave everything
     else (commas, colons, brackets) exactly as it is.
   * Prices are plain numbers with no dollar sign:  price: 0.75
   * Words must stay inside straight double quotes: "Blue Razz"
   * Every item in a list ends with a comma. If the demo shows a
     "settings.js has a typo" message, the usual cause is a missing
     comma or a missing quote near the line you last changed.
   * Lines starting with // are notes for you. The app ignores them.

   After you save (commit) a change on GitHub, wait about 1 minute,
   then reload the demo. On the iPhone home-screen app, close it fully
   and reopen it.
   ===================================================================== */

window.STACKT_SETTINGS = {

  // -------------------------------------------------------------------
  // GENERAL
  // -------------------------------------------------------------------
  currencySymbol: "$",

  // The big headline on the welcome screen, one line each.
  // The last line is shown in the bright accent color.
  slogan: [
    "Pre-workout.",
    "Post-workout.",
    "Your workout.",
    "Built by you.",
  ],

  // The gym name shown in the owner dashboard.
  gymName: "Iron Republic Fitness",

  // Safety cap: the most caffeine allowed in one drink, in mg.
  // Options that would go over this are greyed out in the builder.
  caffeineLimitMg: 300,

  // Small print shown under the drink builder.
  demoNote: "Demo values only. Amounts and prices are placeholders, not nutrition or dosing advice.",


  // -------------------------------------------------------------------
  // DRINKS AND INGREDIENTS
  // -------------------------------------------------------------------
  // Each drink has a base price (cup, cold filtered water, mixing).
  // Each ingredient has a list of options. Each option has:
  //   label      what the customer taps, like "200 mg"
  //   price      what that option adds to the drink, like 0.75
  //   caffeineMg (optional) caffeine in that option, for the safety cap
  // An option labeled exactly "None" means "leave it out".
  // "start" is the option already selected when the screen opens.
  //   It must match one of that ingredient's labels exactly.

  drinks: {

    pre: {
      name: "Pre-Workout",
      tagline: "Energy, pump and focus. Mixed fresh, right before you lift.",
      basePrice: 2.50,

      ingredients: [
        {
          name: "Caffeine",
          about: "Clean energy and focus",
          start: "100 mg",
          options: [
            { label: "None",   price: 0 },
            { label: "100 mg", price: 0.50, caffeineMg: 100 },
            { label: "200 mg", price: 0.75, caffeineMg: 200 },
          ],
        },
        {
          name: "Green Tea Extract",
          about: "Natural caffeine, smoother lift",
          start: "None",
          options: [
            { label: "None",              price: 0 },
            { label: "50 mg caffeine",    price: 0.40, caffeineMg: 50 },
            { label: "100 mg caffeine",   price: 0.60, caffeineMg: 100 },
          ],
        },
        {
          name: "L-Citrulline",
          about: "Blood flow and pump",
          start: "6 g",
          options: [
            { label: "None", price: 0 },
            { label: "3 g",  price: 0.75 },
            { label: "6 g",  price: 1.25 },
            { label: "8 g",  price: 1.50 },
          ],
        },
        {
          name: "Beta-Alanine",
          about: "Endurance for high-rep sets",
          start: "3.2 g",
          options: [
            { label: "None",  price: 0 },
            { label: "1.6 g", price: 0.40 },
            { label: "3.2 g", price: 0.70 },
          ],
        },
        {
          name: "Creatine",
          about: "Strength and power output",
          start: "None",
          options: [
            { label: "None", price: 0 },
            { label: "3 g",  price: 0.50 },
            { label: "5 g",  price: 0.75 },
          ],
        },
        {
          name: "Electrolytes",
          about: "Hydration for long sessions",
          start: "None",
          options: [
            { label: "None",  price: 0 },
            { label: "Light", price: 0.35 },
            { label: "Full",  price: 0.60 },
          ],
        },
        {
          name: "Flavor",
          about: "Pick your taste",
          start: "Blue Razz",
          options: [
            { label: "Unflavored",       price: 0 },
            { label: "Blue Razz",        price: 0 },
            { label: "Sour Green Apple", price: 0 },
            { label: "Mango Lime",       price: 0 },
            { label: "Cold Brew",        price: 0.50, caffeineMg: 100 },
          ],
        },
      ],

      // Ready-made stacks shown as shortcuts at the top of the builder.
      // Use the exact ingredient names and option labels from above.
      // Anything you leave out is set to "None".
      signatureStacks: [
        {
          name: "The Igniter",
          picks: { "Caffeine": "200 mg", "L-Citrulline": "6 g", "Beta-Alanine": "3.2 g", "Flavor": "Blue Razz" },
        },
        {
          name: "Stim-Free Pump",
          picks: { "L-Citrulline": "8 g", "Creatine": "5 g", "Electrolytes": "Light", "Flavor": "Mango Lime" },
        },
        {
          name: "Endurance",
          picks: { "Green Tea Extract": "100 mg caffeine", "Beta-Alanine": "3.2 g", "Electrolytes": "Full", "Flavor": "Sour Green Apple" },
        },
      ],
    },

    post: {
      name: "Post-Workout",
      tagline: "Protein and recovery, mixed fresh the minute you finish.",
      basePrice: 3.00,

      ingredients: [
        {
          name: "Protein",
          about: "Whey or plant-based",
          start: "Whey 25 g",
          options: [
            { label: "None",       price: 0 },
            { label: "Whey 25 g",  price: 1.75 },
            { label: "Whey 40 g",  price: 2.50 },
            { label: "Plant 25 g", price: 2.00 },
            { label: "Plant 40 g", price: 2.75 },
          ],
        },
        {
          name: "Creatine",
          about: "Strength and power output",
          start: "5 g",
          options: [
            { label: "None", price: 0 },
            { label: "3 g",  price: 0.50 },
            { label: "5 g",  price: 0.75 },
          ],
        },
        {
          name: "Amino Acids",
          about: "Muscle repair",
          start: "None",
          options: [
            { label: "None",       price: 0 },
            { label: "BCAAs 5 g",  price: 0.75 },
            { label: "EAAs 10 g",  price: 1.25 },
          ],
        },
        {
          name: "Electrolytes",
          about: "Rehydrate after you sweat",
          start: "Light",
          options: [
            { label: "None",  price: 0 },
            { label: "Light", price: 0.35 },
            { label: "Full",  price: 0.60 },
          ],
        },
        {
          name: "Mixed With",
          about: "Your base liquid",
          start: "Cold Water",
          options: [
            { label: "Cold Water",    price: 0 },
            { label: "Oat Milk",      price: 0.75 },
            { label: "Coconut Water", price: 0.75 },
          ],
        },
        {
          name: "Flavor",
          about: "Pick your taste",
          start: "Chocolate",
          options: [
            { label: "Unflavored",      price: 0 },
            { label: "Chocolate",       price: 0 },
            { label: "Vanilla Bean",    price: 0 },
            { label: "Berry Blast",     price: 0 },
            { label: "Tropical Citrus", price: 0 },
          ],
        },
      ],

      signatureStacks: [
        {
          name: "Rebuild",
          picks: { "Protein": "Whey 40 g", "Creatine": "5 g", "Electrolytes": "Light", "Mixed With": "Cold Water", "Flavor": "Chocolate" },
        },
        {
          name: "Plant Power",
          picks: { "Protein": "Plant 25 g", "Amino Acids": "EAAs 10 g", "Mixed With": "Oat Milk", "Flavor": "Vanilla Bean" },
        },
        {
          name: "Refuel",
          picks: { "Protein": "Whey 25 g", "Electrolytes": "Full", "Mixed With": "Coconut Water", "Flavor": "Tropical Citrus" },
        },
      ],
    },
  },


  // -------------------------------------------------------------------
  // MEMBERSHIP PLANS
  // -------------------------------------------------------------------
  // Three pricing ideas shown side by side so the gym owner can react.
  // Do NOT change "kind". It tells the app how each plan works:
  //   "pack"      = a set number of drinks per month for a flat price
  //   "unlimited" = one drink per gym visit for a flat price
  //   "discount"  = small monthly fee, then a lower price on every drink

  memberships: [
    {
      kind: "pack",
      tag: "Pack plan",
      name: "10-Pack",
      monthlyPrice: 45,
      drinksPerMonth: 10,
      perks: [
        "10 custom stacks every month",
        "Any size, any ingredients",
        "Unused drinks do not roll over",
      ],
    },
    {
      kind: "unlimited",
      tag: "Unlimited",
      name: "Stackt Unlimited",
      monthlyPrice: 69,
      // Used to show "works out to about $X per drink".
      typicalVisitsPerMonth: 16,
      badge: "Best value",
      perks: [
        "One stack every gym visit",
        "Pre or post, your choice",
        "Skip the line with your member tag",
      ],
    },
    {
      kind: "discount",
      tag: "Member discount",
      name: "Stackt Club",
      monthlyPrice: 9.99,
      discountPercent: 25,
      perks: [
        "25% off every stack",
        "Pay only when you drink",
        "Free flavor upgrades",
      ],
    },
  ],


  // -------------------------------------------------------------------
  // OWNER DASHBOARD (hidden view, sample numbers only)
  // -------------------------------------------------------------------
  owner: {
    monthLabel: "October 2026",

    drinksSold: 1284,
    grossRevenue: 7420,         // total sales this month, in dollars
    revenueSharePercent: 15,    // the gym's cut of gross revenue
    activeMembers: 142,         // people on a Stackt membership
    changeVsLastMonthPercent: 18,

    // Share of drinks that were pre-workout (the rest are post-workout).
    preWorkoutPercent: 58,

    // Most popular stacks this month, biggest first.
    topStacks: [
      { name: "The Igniter",    sold: 312 },
      { name: "Rebuild",        sold: 268 },
      { name: "Stim-Free Pump", sold: 191 },
      { name: "Plant Power",    sold: 140 },
      { name: "Refuel",         sold: 97 },
    ],

    // Drinks sold each day for the last 14 days, oldest first.
    drinksPerDay: [38, 44, 51, 29, 47, 55, 60, 41, 49, 57, 33, 52, 63, 58],

    // What the gym gets, shown as a checklist.
    whatYouGet: [
      "No upfront cost. We install, stock, clean and service the kiosk.",
      "A share of every drink and membership, paid monthly.",
      "A premium perk that keeps members coming back.",
      "All you provide is floor space and a power outlet.",
    ],
  },
};
