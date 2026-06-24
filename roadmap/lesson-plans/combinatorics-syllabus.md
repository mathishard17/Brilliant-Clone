# Counting, Combinatorics, and Probability Syllabus

This syllabus organizes the app into a short sequence of Brilliant-style interactive lessons for a 3rd-grade learner who enjoys princesses, dress-up, jewels, castles, and playful fantasy settings.

The goal is not to teach formal high-school combinatorics. The goal is to build intuition:

- counting outcomes without listing everything forever
- understanding when order matters
- recognizing repeated or identical choices
- connecting counting to chance and probability

## Design Principles

- **Concrete first, shortcut second.** Each lesson starts with a hands-on royal-world activity, then introduces the counting shortcut.
- **Small numbers.** Use counts like 2, 3, 4, 5, and 6 before introducing larger arithmetic.
- **Princess/fantasy framing.** Use gowns, crowns, jewels, treasure chests, royal parades, castle doors, magic spinners, and party planning.
- **Interactive every lesson.** Each lesson needs at least one direct manipulation: tap, arrange, choose, reveal, spin, sort, or compare.
- **One core concept per lesson.** Avoid turning one lesson into a textbook chapter.
- **Language for a 3rd grader.** Use words like “choices,” “orders,” “ways,” “lineups,” “same/different,” “more likely,” and “fair,” while gradually naming the math terms.

## Current Lessons

### Lesson 1: Princess Outfits

**Concept:** Fundamental Counting Principle / multiplication rule.

**Core intuition:** If each crown can go with every gown, multiply the choices.

**Learner experience:**

- dress a princess with crowns and gowns
- discover 2 × 3 = 6 outfits
- add shoes to make 2 × 3 × 2 = 12
- end with the “Ultimate Multiplication Shortcut”

### Lesson 2: Royal Arrangements

**Concept:** Permutations and factorials.

**Core intuition:** When order matters, each spot has fewer remaining choices.

**Learner experience:**

- arrange 3 royal jewels in display spots
- discover 3! = 3 × 2 × 1 = 6
- calculate 5! and 7! with shortcuts
- explore “Ruby cannot go first”
- explore matching rubies / identical-item overcounting
- distinguish permutation vs. combination

## Proposed Next Lessons

### Lesson 3: Royal Treasure Bags

**Concept:** Combinations where order does not matter.

**Core intuition:** Choosing Ruby + Sapphire is the same set as Sapphire + Ruby.

**Possible framing:** The princess is choosing jewels for a crown or treasures for a gift bag.

**Interactive anchor:** Tap 2 jewels from 5 options; the app treats Ruby + Sapphire and Sapphire + Ruby as the same treasure set.

**Math target:** Build toward “divide out the repeated orders” without requiring formal formula mastery.

### Lesson 4: Magic Chance Spinners

**Concept:** Probability as favorable outcomes / total outcomes.

**Core intuition:** Chance compares “winning spaces” to “all possible spaces.”

**Possible framing:** The princess spins a royal wheel to win jewels, gowns, or castle prizes.

**Interactive anchor:** Spin or inspect a wheel/bag with colored outcomes; predict likely/unlikely/certain/impossible, then count exact chances.

**Math target:** Express probability as simple fractions such as 1/4, 2/4, 3/6.

### Lesson 5: Fair Games at the Royal Carnival

**Concept:** Sample space, fairness, and expected intuition.

**Core intuition:** A game is fair when each player has the same chance to win.

**Possible framing:** The princess designs a carnival game for the castle party.

**Interactive anchor:** Build or inspect a spinner/dice/card game and decide whether it is fair.

**Math target:** Use organized lists/charts to count outcomes and compare probabilities.

## Full Learning Progression

1. **Counting product choices:** every category combines with every other category.
2. **Ordering objects:** order creates new arrangements.
3. **Choosing groups:** order may not matter.
4. **Counting chance:** probability depends on counted outcomes.
5. **Designing fair games:** use counting to reason about fairness.

## Vocabulary Path

Introduce vocabulary slowly:

1. choices
2. combinations / outfits / lineups
3. order matters
4. permutation
5. factorial
6. order does not matter
7. combination
8. outcome
9. sample space
10. probability
11. fair / unfair

## External Reference Notes

The sequence follows common counting/probability progressions:

- start from organized lists, charts, and tree diagrams
- introduce the Fundamental Counting Principle as a shortcut
- distinguish permutations from combinations by asking whether order matters
- connect counting to probability through sample spaces
- use experiments, spinners, dice, bags, or story games to make probability visual and concrete

## Authoring Guidance for Lesson Plans

Each future lesson plan should include:

- target concept
- learner persona fit
- 5-minute and 10-minute version
- section-by-section flow
- interactive visualization ideas
- challenge questions with answers
- feedback messages
- what data/state the app should track
- implementation notes for the existing lesson registry architecture
