# Lesson 3 Plan: Royal Treasure Bags

## Title and Concept

**Title:** Lesson 3: Royal Treasure Bags

**Concept:** Combinations where order does not matter.

**Core idea:** Choosing Ruby + Sapphire makes the same treasure bag as choosing Sapphire + Ruby. When the final group is the same, the picking order should not create a new answer.

**Brilliant-style lesson length:** 5-10 minutes.

**Learner level:** 3rd grade, concrete-first, princess/royal themed.

**Math target:** Build intuition for combinations by comparing ordered picks to unordered groups. Introduce the shortcut "divide out the repeated orders" for pairs, without requiring formal combination notation.

## Why It Follows Lesson 2

Lesson 2 taught that **order matters** for royal arrangements: Ruby, Sapphire, Gold is a different lineup from Sapphire, Ruby, Gold.

Lesson 3 starts from the final Lesson 2 idea: sometimes **order does not matter**. A treasure bag only cares which treasures are inside. If the same two jewels end up in the bag, it is the same bag, even if the princess picked them in a different order.

This creates a clean contrast:

- **Lesson 2:** arranging jewels in display spots means order matters, so count permutations.
- **Lesson 3:** choosing jewels for a treasure bag means order does not matter, so count combinations.

## Learning Goals

By the end of the lesson, the learner should be able to:

- Explain that a combination is a group where order does not matter.
- Recognize that Ruby + Sapphire and Sapphire + Ruby are the same treasure bag.
- Count all unique 2-jewel bags from a small set of jewels.
- See why ordered picks can count each pair twice.
- Use the pair shortcut: count ordered picks, then divide by 2 because each pair has 2 pick orders.
- Decide whether a story problem is asking for an arrangement or a group.

## Learner Story/Theme

The princess is preparing royal treasure bags for guests at a castle celebration. Each bag gets **2 different treasures** from the royal vault.

The royal helper keeps writing down the order the princess picked the treasures:

- Ruby, then Sapphire
- Sapphire, then Ruby

The princess notices a problem: both bags look exactly the same. The lesson helps her make a neater royal list with no repeats.

Tone should stay playful and direct:

- "Does the bag care which jewel went in first?"
- "Same treasures, same bag."
- "Let's cross out royal repeats."
- "You found every unique treasure bag."

## Section-by-Section Flow

### Section 1: Open the Royal Vault

**Time:** 1-2 minutes

**Screen type:** Interactive visualization.

**Story:** The royal vault has 5 treasures: Ruby, Sapphire, Emerald, Pearl, and Amethyst. The princess needs to choose 2 different treasures for one gift bag.

**Interaction:** The learner taps 2 treasures. The selected treasures drop into a bag. Completed bags are recorded in a "Unique treasure bags found" list.

**Teaching point:** At first, let the learner freely make bags. If they try Sapphire + Ruby after Ruby + Sapphire, the app should show that it is already found.

**Suggested copy:**

> Hi, {princessName}! The royal vault is sparkling today. Choose **2 different treasures** for each royal gift bag. How many different treasure bags can you make?

### Section 2: The Same Bag Test

**Time:** 1 minute

**Screen type:** Clickthrough mini lesson.

**Story:** The princess compares two bags: Ruby + Sapphire and Sapphire + Ruby.

**Teaching point:** The picking order changed, but the bag contents did not. That means the two picks are the same combination.

**Suggested pages:**

1. "Look closely at these two bags."
2. "Bag A: Ruby, then Sapphire."
3. "Bag B: Sapphire, then Ruby."
4. "Both bags have Ruby and Sapphire. Same treasures, same bag."
5. "When order does not matter, mathematicians call the group a **combination**."

### Section 3: Count Without Repeats

**Time:** 2 minutes

**Screen type:** Guided explanation plus small challenge.

**Story:** The royal helper accidentally counts every first-pick and second-pick order.

**Teaching point:** With 5 treasures, there are 5 choices for the first pick and 4 choices for the second pick, so there are 20 ordered picks. But every pair appears twice:

- Ruby, then Sapphire
- Sapphire, then Ruby

So the unique treasure bags are **20 / 2 = 10**.

**Suggested copy:**

> If we count picking order, there are **5 choices first** and **4 choices second**.
>
> That makes **5 x 4 = 20 pick orders**.
>
> But each treasure pair was counted twice, so we divide by 2.
>
> **20 / 2 = 10 unique treasure bags**.

### Section 4: Royal Bag Challenge

**Time:** 2-3 minutes

**Screen type:** Challenge mini lesson.

**Story:** The princess now understands the rule and tries a new vault.

**Teaching point:** Practice distinguishing ordered picking from unique groups.

**Interaction:** Numeric answer challenge with feedback.

**Suggested copy:**

> A smaller royal vault has **4 treasures**: Ruby, Sapphire, Emerald, and Pearl. The princess chooses **2 treasures** for each bag. How many unique treasure bags can she make?

### Section 5: Arrangement or Combination?

**Time:** 1-2 minutes

**Screen type:** Final compare-and-sort or clickthrough challenge.

**Story:** The royal party has two jobs: place jewels in a display lineup and choose jewels for gift bags.

**Teaching point:** Ask the big counting question from Lesson 2 again: **Does order matter?**

**Interaction:** The learner answers whether each situation is an arrangement/permutation or a combination.

**Close:** Reinforce the lesson in one sentence.

**Suggested final copy:**

> You completed Royal Treasure Bags, {princessName}! When the same group is still the same group, order does not matter. That is a **combination**.

## Interactive Visualization Ideas

### Treasure Bag Picker

- Show 5 tappable jewels: Ruby, Sapphire, Emerald, Pearl, Amethyst.
- Show 1 royal bag with 2 empty slots.
- When 2 jewels are selected, sort their IDs before saving the bag key. This makes `ruby-sapphire` and `sapphire-ruby` count as the same found bag.
- Add a "Already found" sparkle message when the learner creates a duplicate pair in the opposite order.
- Keep a visible counter: "Unique treasure bags found: 3".
- Show the found bags as small paired jewel chips, not as ordered slots.

### Duplicate Order Reveal

- Show two side-by-side bags:
  - Bag A: Ruby then Sapphire
  - Bag B: Sapphire then Ruby
- Animate the jewels settling into identical unordered bag positions.
- Stamp both with "Same bag" to make the duplicate obvious.

### Ordered Picks to Unique Bags

- Show a simple list of ordered picks for 3 treasures first:
  - Ruby -> Sapphire
  - Sapphire -> Ruby
  - Ruby -> Emerald
  - Emerald -> Ruby
  - Sapphire -> Emerald
  - Emerald -> Sapphire
- Pair the duplicate orders with matching colors.
- Collapse each matched pair into one treasure bag.
- Then scale up to 5 treasures with the shortcut: **5 x 4 = 20**, then **20 / 2 = 10**.

### Final Sort

- Present small story cards:
  - "Line up 3 jewels on a pillow"
  - "Choose 2 jewels for a gift bag"
  - "Pick 1st, 2nd, and 3rd place in a dragon race"
  - "Choose 3 snacks for a royal picnic"
- Learner taps "Order matters" or "Order does not matter".

## Exact Challenge Questions, Answers, and Feedback

### Challenge 1: First Treasure Bags

**Prompt:**

The royal vault has **5 treasures**: Ruby, Sapphire, Emerald, Pearl, and Amethyst. Each gift bag gets **2 different treasures**. How many unique treasure bags can the princess make?

**Answer:** `10`

**Correct feedback:**

Exactly, {princessName}! There are **10 unique treasure bags**. Ruby + Sapphire and Sapphire + Ruby are the same bag, so we only count that pair once.

**First try-again feedback:**

Try again, {princessName}! Ask: does the bag care which treasure was picked first?

**Incorrect feedback:**

Not quite. If you counted pick orders, you may have counted each pair twice.

**Solution feedback:**

There are **5 choices** for the first treasure and **4 choices** for the second treasure: **5 x 4 = 20** pick orders. Each pair has 2 orders, so **20 / 2 = 10** unique bags.

### Challenge 2: Same or Different?

**Prompt:**

The princess makes one bag with **Ruby + Pearl**. Then she makes another bag with **Pearl + Ruby**. Are these different treasure bags? Type **1** for different or **2** for same.

**Answer:** `2`

**Correct feedback:**

Correct! They are the **same** treasure bag because both bags have Ruby and Pearl.

**First try-again feedback:**

Try again! Look only at what is inside the bag.

**Incorrect feedback:**

Not quite. The picking order changed, but the treasures inside did not change.

**Solution feedback:**

The answer is **2**, same. Ruby + Pearl and Pearl + Ruby make one combination.

### Challenge 3: Smaller Royal Vault

**Prompt:**

A smaller vault has **4 treasures**: Ruby, Sapphire, Emerald, and Pearl. Each bag gets **2 different treasures**. How many unique treasure bags can the princess make?

**Answer:** `6`

**Correct feedback:**

Beautiful counting! **4 x 3 = 12** pick orders, and each pair is counted twice, so **12 / 2 = 6** unique bags.

**First try-again feedback:**

Try again! Count the pick orders first, then remember to divide out the repeats.

**Incorrect feedback:**

Not quite. Every pair can be picked in 2 orders, but it still makes the same bag.

**Solution feedback:**

First count ordered picks: **4 choices first x 3 choices second = 12**. Then divide by 2 because each pair appears twice: **12 / 2 = 6**.

### Challenge 4: Arrangement or Combination?

**Prompt:**

Final challenge: The princess chooses **3 guests** to receive treasure bags. Does order matter? Type **1** for order matters or **2** for order does not matter.

**Answer:** `2`

**Correct feedback:**

Correct! Choosing guests is a **combination** because the same 3 guests are chosen no matter what order their names were picked.

**First try-again feedback:**

Try again! Ask whether first, second, and third place are important here.

**Incorrect feedback:**

Not quite. The princess is choosing a group of guests, not lining them up.

**Solution feedback:**

The answer is **2**, order does not matter. A group with Ava, Bella, and Cora is the same group as Cora, Ava, and Bella.

### Challenge 5: Order Matters Check

**Prompt:**

The royal jeweler places **Ruby, Sapphire, and Emerald** into 3 display spots. Does order matter? Type **1** for order matters or **2** for order does not matter.

**Answer:** `1`

**Correct feedback:**

Exactly! Display spots are a lineup, so Ruby -> Sapphire -> Emerald is different from Emerald -> Sapphire -> Ruby.

**First try-again feedback:**

Try again! Think about whether switching the jewels changes the display.

**Incorrect feedback:**

Not quite. In display spots, each position matters.

**Solution feedback:**

The answer is **1**, order matters. This is like Lesson 2's royal arrangements.

## Implementation Notes for Current React Lesson Registry Architecture

Keep the implementation consistent with Lessons 1 and 2:

- Add a future `src/lessons/lesson3/copy.ts` that exports section copy and clickthrough challenge data, similar to `src/lessons/lesson2/copy.ts`.
- Add a future `src/lessons/lesson3/screens.tsx` with 5 exported screen components:
  - `Lesson3TreasureBagPicker`
  - `Lesson3SameBagLesson`
  - `Lesson3CountingShortcut`
  - `Lesson3RoyalBagChallenge`
  - `Lesson3FinalSort`
- Add a `LESSON_3_ID` constant to `src/types/lesson.ts` when implementation starts. A stable ID could be `lesson-3-royal-treasure-bags`.
- Extend `InteractiveVisualizationKind` with names such as `treasure-bag-combinations`, `duplicate-treasure-bags`, and `combination-sort`.
- Register Lesson 3 in `LESSON_DEFINITIONS` in `src/lessons/registry.ts` with:
  - `title: 'Lesson 3: Royal Treasure Bags'`
  - `emoji: '🎁'` or another existing visual style if emoji use is kept
  - `description: 'Choose royal treasures when order does not matter'`
  - `progressSteps: ['Treasure Bags', 'Same Bag', 'No Repeats', 'Bag Challenge', 'Order Check']`
  - `getResumeScreen: (progress) => getResumeScreen(progress, 5)`
- The current shared `LessonProgress` shape only has generic `screen1`, `screen2`, and `screen3` fields from the early MVP. For Lesson 3, either keep transient local state inside each visualization, as Lesson 2 does, or add a more flexible per-lesson progress model before storing Lesson 3-specific found bags.
- The treasure bag visualization should store unique pairs by a sorted key, for example `['ruby', 'sapphire'].sort().join('-')`, so reversed selections are treated as duplicates.
- Use existing shared components where possible:
  - `ClickthroughMiniLesson` for explanation and numeric/text challenges.
  - `ChallengeQuestion` for typed numeric responses.
  - `FeedbackBanner` for correct/incorrect messages.
  - `LessonButton`, `LessonText`, and `ScreenBackButton` for consistency with Lesson 2.
- Avoid AI-generated or personalized curriculum logic. Use fixed copy, fixed jewel sets, fixed challenge answers, and the existing `{princessName}` personalization only.

## Optional Stretch Ideas

These are optional and should not be required for the first implementation.

- **Choose 3 treasures from 5:** Let advanced learners explore 3-treasure bags after mastering pairs. Keep it visual by listing groups, not by introducing the full formula.
- **Build your own bag rule:** Let the learner switch between "2 treasures per bag" and "3 treasures per bag" in a free-play mode.
- **Royal repeat detector:** Show a playful "royal repeat" stamp whenever the learner tries a reversed duplicate.
- **Combination notation preview:** Briefly show that mathematicians may write "5 choose 2" for choosing 2 things from 5, but do not require the learner to use the notation.
- **Bridge to probability:** Preview Lesson 4 by asking, "If the princess closes her eyes and picks one completed treasure bag, what could happen?"
