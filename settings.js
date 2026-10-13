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

  // Shown as a small "New" note on the welcome screen.
  // Use "" (empty quotes) to hide it.
  flavorOfTheMonth: "Watermelon",

  // The gym name shown in the owner dashboard.
  gymName: "Iron Republic Fitness",

  // Safety cap: the most caffeine allowed in one drink, in mg.
  // Options that would go over this are greyed out in the builder.
  caffeineLimitMg: 300,

  // Shown on any drink that contains caffeine.
  caffeineAdvisory: "Contains caffeine. Not for anyone under 18, pregnant or nursing, or sensitive to caffeine.",

  // Shown under the allergens on the review screen.
  allergenNote: "Mixed on shared equipment that also handles milk. Rinsed after every drink.",

  // Small print shown under the drink builder.
  demoNote: "Demo values only. Amounts, nutrition and prices are placeholders, not nutrition or dosing advice.",


  // -------------------------------------------------------------------
  // DRINKS AND INGREDIENTS
  // -------------------------------------------------------------------
  // Each drink has a base price (cup, cold filtered water, mixing).
  // Each ingredient has a list of options. Each option has:
  //   label      what the customer taps, like "200 mg"
  //   price      what that option adds to the drink, like 0.75
  // and these optional extras:
  //   note       small text under the label, like "Light tingle"
  //   caffeineMg caffeine in that option, for the safety cap
  //   calories   calories it adds (placeholder numbers)
  //   proteinG   grams of protein it adds
  //   allergens  like "Milk" (separate several with commas)
  //   premium    true = Unlimited members pay extra for this option
  // An option labeled exactly "None" means "leave it out".
  // "start" is the option already selected when the screen opens.
  //   It must match one of that ingredient's labels exactly.

  drinks: {

    pre: {
      name: "Pre-Workout",
      tagline: "Energy, pump and focus. Mixed fresh, right before you lift.",
      basePrice: 3.00,

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
          name: "L-Theanine",
          about: "Smooth focus, takes the edge off caffeine",
          start: "None",
          options: [
            { label: "None",   price: 0 },
            { label: "200 mg", price: 0.50, note: "Smooth focus" },
          ],
        },
        {
          name: "L-Citrulline",
          about: "Blood flow and pump",
          start: "6 g",
          options: [
            { label: "None", price: 0 },
            { label: "6 g",  price: 1.25, calories: 25 },
            { label: "8 g",  price: 1.50, calories: 30 },
          ],
        },
        {
          name: "Beta-Alanine",
          about: "Endurance for high-rep sets. Works best taken daily.",
          start: "1.6 g",
          options: [
            { label: "None",  price: 0 },
            { label: "1.6 g", price: 0.40, note: "Light tingle" },
            { label: "3.2 g", price: 0.70, note: "Full tingle" },
          ],
        },
        {
          name: "Creatine",
          about: "Strength and power. Micronized, mixes smooth. Best daily.",
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
            { label: "Blue Razz",        price: 0, calories: 5 },
            { label: "Sour Green Apple", price: 0, calories: 5 },
            { label: "Mango Lime",       price: 0, calories: 5 },
            { label: "Watermelon",       price: 0, calories: 5, note: "Flavor of the month" },
            { label: "Cold Brew",        price: 1.00, calories: 5, caffeineMg: 100 },
          ],
        },
      ],

      // Taste rules. Each rule names two choices:
      //   ["Ingredient name", "option", "option", ...]
      // block: true  = those two can't be picked together (greyed out)
      // block: false = allowed, but the customer sees a taste tip
      tasteRules: [
        {
          block: false,
          when: ["L-Citrulline", "6 g", "8 g"],
          with: ["Flavor", "Unflavored"],
          message: "Citrulline tastes sour on its own. A fruity or sour flavor hides it.",
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
          picks: { "Caffeine": "100 mg", "Beta-Alanine": "3.2 g", "Electrolytes": "Full", "Flavor": "Sour Green Apple" },
        },
      ],
    },

    post: {
      name: "Post-Workout",
      tagline: "Protein and recovery, mixed fresh the minute you finish.",
      basePrice: 4.00,

      ingredients: [
        {
          name: "Protein",
          about: "Whey or plant-based",
          start: "Whey 25 g",
          options: [
            { label: "None",       price: 0 },
            { label: "Whey 25 g",  price: 2.00, calories: 100, proteinG: 25, allergens: "Milk" },
            { label: "Whey 40 g",  price: 3.00, calories: 160, proteinG: 40, allergens: "Milk", premium: true },
            { label: "Plant 25 g", price: 2.00, calories: 110, proteinG: 25 },
            { label: "Plant 40 g", price: 3.00, calories: 175, proteinG: 40, premium: true },
          ],
        },
        {
          name: "Creatine",
          about: "Strength and power. Micronized, mixes smooth. Best daily.",
          start: "None",
          options: [
            { label: "None", price: 0 },
            { label: "3 g",  price: 0.50 },
            { label: "5 g",  price: 0.75 },
          ],
        },
        {
          name: "Amino Acids",
          about: "Muscle repair, great when you skip protein",
          start: "None",
          options: [
            { label: "None",      price: 0 },
            { label: "EAAs 10 g", price: 1.25, calories: 40 },
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
            { label: "Oat Milk",      price: 1.50, calories: 140, proteinG: 1, allergens: "Oats", premium: true },
            { label: "Coconut Water", price: 1.75, calories: 45, allergens: "Coconut", premium: true },
          ],
        },
        {
          name: "Flavor",
          about: "Pick your taste",
          start: "Chocolate",
          options: [
            { label: "Unflavored",      price: 0 },
            { label: "Chocolate",       price: 0, calories: 15 },
            { label: "Vanilla Bean",    price: 0, calories: 15 },
            { label: "Salted Caramel",  price: 0, calories: 20, note: "New" },
            { label: "Berry Blast",     price: 0, calories: 10 },
            { label: "Tropical Citrus", price: 0, calories: 10 },
          ],
        },
      ],

      tasteRules: [
        {
          block: true,
          when: ["Mixed With", "Oat Milk"],
          with: ["Flavor", "Tropical Citrus"],
          message: "Citrus can curdle oat milk. Try Tropical Citrus with water or coconut water.",
        },
        {
          block: false,
          when: ["Protein", "Plant 25 g", "Plant 40 g"],
          with: ["Flavor", "Unflavored"],
          message: "Plant protein tastes earthy on its own. Chocolate or Salted Caramel taste best.",
        },
      ],

      signatureStacks: [
        {
          name: "Rebuild",
          picks: { "Protein": "Whey 40 g", "Creatine": "5 g", "Electrolytes": "Light", "Mixed With": "Cold Water", "Flavor": "Chocolate" },
        },
        {
          name: "Plant Power",
          picks: { "Protein": "Plant 25 g", "Mixed With": "Oat Milk", "Flavor": "Vanilla Bean" },
        },
        {
          name: "Refuel",
          picks: { "Protein": "Whey 25 g", "Electrolytes": "Full", "Mixed With": "Cold Water", "Flavor": "Tropical Citrus" },
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
  //   "unlimited" = one drink a day for a flat price. Options marked
  //                 premium: true cost extra, at the Club discount.
  //   "discount"  = small monthly fee, then a lower price on every drink

  memberships: [
    {
      kind: "pack",
      tag: "Pack plan",
      name: "8-Pack",
      monthlyPrice: 40,
      drinksPerMonth: 8,
      perks: [
        "8 custom stacks every month",
        "Any ingredients, any flavor",
        "Unused drinks roll over 1 month",
      ],
    },
    {
      kind: "unlimited",
      tag: "Unlimited",
      name: "Stackt Unlimited",
      monthlyPrice: 79,
      // Used to show "works out to about $X per drink".
      typicalVisitsPerMonth: 16,
      badge: "4+ visits a week",
      perks: [
        "One stack every day",
        "Pre or post, your choice",
        "Premium upgrades at Club prices",
        "Scan your member tag to order",
      ],
    },
    {
      kind: "discount",
      tag: "Member discount",
      name: "Stackt Club",
      monthlyPrice: 4.99,
      discountPercent: 25,
      perks: [
        "25% off every stack",
        "Pay only when you drink",
        "First taste of each new flavor",
      ],
    },
  ],


  // -------------------------------------------------------------------
  // DEMO MEMBER (what "Scan member tag" pretends to find)
  // -------------------------------------------------------------------
  // plan must be "pack", "unlimited" or "discount".
  demoMember: {
    name: "Jordan",
    plan: "unlimited",
    streakDays: 4,
    rewardsProgress: 7,     // drinks so far toward a free one
    drinksForFreeOne: 10,   // every 10th stack is free
    savedStacks: [
      {
        name: "Morning Igniter",
        drink: "pre",
        picks: { "Caffeine": "200 mg", "L-Theanine": "200 mg", "L-Citrulline": "6 g", "Beta-Alanine": "1.6 g", "Flavor": "Sour Green Apple" },
      },
      {
        name: "Leg Day Rebuild",
        drink: "post",
        picks: { "Protein": "Whey 25 g", "Creatine": "5 g", "Electrolytes": "Light", "Mixed With": "Cold Water", "Flavor": "Salted Caramel" },
      },
    ],
  },


  // -------------------------------------------------------------------
  // OWNER DASHBOARD (hidden view, sample numbers only)
  // -------------------------------------------------------------------
  owner: {
    monthLabel: "October 2026",

    // --- Results tab ---
    drinksSold: 1284,
    grossRevenue: 8090,         // total sales this month, in dollars
    changeVsLastMonthPercent: 18,
    activeMembers: 142,         // people on a Stackt membership
    gymMembers: 1200,           // everyone with a membership at this gym
    monthlyUsers: 410,          // gym members who bought at least one drink
    repeatRatePercent: 64,      // users who came back for a second drink

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

    // Drinks sold by hour of day, across the month.
    drinksByHour: [
      { time: "5 AM", drinks: 64 },  { time: "6 AM", drinks: 118 },
      { time: "7 AM", drinks: 102 }, { time: "8 AM", drinks: 71 },
      { time: "9 AM", drinks: 55 },  { time: "10 AM", drinks: 38 },
      { time: "11 AM", drinks: 34 }, { time: "12 PM", drinks: 61 },
      { time: "1 PM", drinks: 42 },  { time: "2 PM", drinks: 27 },
      { time: "3 PM", drinks: 33 },  { time: "4 PM", drinks: 58 },
      { time: "5 PM", drinks: 121 }, { time: "6 PM", drinks: 146 },
      { time: "7 PM", drinks: 112 }, { time: "8 PM", drinks: 69 },
      { time: "9 PM", drinks: 33 },
    ],

    uptimePercent: 99.6,
    stockLevels: [
      { name: "Whey protein",  percent: 64 },
      { name: "Plant protein", percent: 81 },
      { name: "Oat milk",      percent: 22 },
      { name: "L-Citrulline",  percent: 47 },
      { name: "Flavors",       percent: 70 },
    ],
    lastSanitized: "Today, 5:58 AM",

    // --- The deal tab ---
    revenueSharePercent: 15,         // the gym's cut of sales after tax and refunds
    bonusSharePercent: 20,           // the gym's cut on sales above the line below
    bonusAboveMonthlySales: 10000,   // in dollars per month
    dealTerms: [
      { label: "What it covers", value: "Every drink and every Stackt membership sold at your gym" },
      { label: "Payout",         value: "Monthly, by direct deposit, with a full statement" },
      { label: "Upfront cost",   value: "$0. We install, stock, clean and service the kiosk." },
      { label: "Contract",       value: "Cancel any time with 30 days' notice. Free removal." },
      { label: "Repairs",        value: "Fixed within 48 hours" },
    ],
    pilot: "Start with a 90-day pilot. We track drinks per day, the share of your members who use Stackt, and how many come back. If it's not working for you, we remove it free.",
    shakeBarAnswer: "Already have a shake bar or supplement shelf? Stackt covers the hours your bar is closed, and can sell your own supplement brand.",
    whatYouGet: [
      "No upfront cost. We install, stock, clean and service the kiosk.",
      "A share of every drink and membership, paid monthly.",
      "A premium perk that keeps members coming back.",
      "Calorie, allergen and caffeine info on every drink.",
    ],

    // --- Setup & safety tab ---
    // Set confirmed: true once a requirement is final. Until then
    // the demo shows it as "To be confirmed".
    siteRequirements: [
      { label: "Space",    value: "About 3 ft wide by 2.5 ft deep",            confirmed: false },
      { label: "Power",    value: "One standard wall outlet (110V)",           confirmed: false },
      { label: "Water",    value: "Water line, or a built-in tank we refill",  confirmed: false },
      { label: "Internet", value: "Gym Wi-Fi, or built-in cellular",           confirmed: false },
      { label: "Staff time", value: "None. Our team restocks and cleans.",     confirmed: true },
    ],
    compliance: [
      "We hold the health permits and handle inspections.",
      "Our liability insurance covers the kiosk.",
      "Temperature is logged around the clock. The kiosk shuts itself off if it gets too warm.",
      "Calories, allergens and caffeine are shown on every drink.",
      "Caffeine is capped at 300 mg per drink.",
    ],
    hygiene: [
      "Rinsed automatically after every drink",
      "Full sanitize cycle every night",
      "Restocked and wiped down by our team",
    ],
  },
};
