# Onboarding UX Redesign – StoryBrand-Inspired

## Changes made

### 1. StoryBrand principles applied

- **Hero:** The business owner is framed as the one taking action (“Start getting bookings”)
- **Guide:** WeMongolia helps them succeed (“We’ll help you reach travelers”, “We’ll help you get your first customers”)
- **Goal:** Clear end state: “Start receiving bookings”
- **Steps:** 3 steps, each with a short title and explanation
- **Momentum:** Progress bar, trust badge (“Takes less than 2 minutes”), low-friction flow

### 2. Step structure (3 steps)

| Step | Title | Purpose | Fields |
|------|-------|---------|--------|
| 1 | What you offer | Choose business type | Single choice: Tours, Accommodation, Transport, or All |
| 2 | About you | Basic business info | Name*, description, city*, email*, phone*, website (optional) |
| 3 | You're ready | Review and submit | Summary + CTA |

*Required

### 3. Copy changes

| Before | After |
|--------|-------|
| “Tell us about your business” (vague) | “What do you offer?” / “Tell us about your business” (context-specific) |
| “This information will appear on your public provider profile” | “Travelers will see this on your profile. You can edit it anytime.” |
| “Set up your profile” | “You’re ready” (for review) |
| “Finish Setup 🎉” | “Start receiving bookings” |
| “Submit provider profile” | — (removed) |
| Step labels: Business Info, Service Types, Profile Setup | What you offer, About you, You’re ready |

### 4. Trust & motivation

- “Takes less than 2 minutes”
- “You can edit it anytime”
- “No commitment — you can edit anything later”
- “We’ll help you get your first customers”
- “You can add a logo and more details in your dashboard after setup”

### 5. Removed / simplified

- **Removed:** Logo upload, cover image, languages from onboarding
  - API does not use them for registration
  - Can be added later in the dashboard
- **Simplified:** Progress is a bar (“Step 1 of 3”)
- **Reordered:** Business type first so the user commits early
- **Reduced:** Long forms; inputs grouped per step

### 6. Interaction design

- Primary CTA: “Start receiving bookings”
- Secondary: “Next step”, “Back”
- Next disabled only when required fields are missing (e.g. business type, name)
- `touch-manipulation` and min-height ~44px for mobile tap targets

### 7. Mobile-first

- `min-h-[44px]` on inputs
- `touch-manipulation` on buttons
- Responsive padding and spacing
- Primary buttons full-width on small screens

### 8. Backend compatibility

- Still posts to `POST /api/v1/account/provider`
- Same mapping: `businessType` → `hotel` | `tour_operator` | `car_rental` | `multiple`
- Same payload: `businessName`, `businessType`, `description`, `contactEmail`, `contactPhone`, `city`, `websiteUrl`

---

## Files changed

| File | Change |
|------|--------|
| `components/onboarding/OnboardingLayout.tsx` | Hero copy, “Step X of 3” progress bar, trust badge |
| `app/onboarding/page.tsx` | 3-step flow, StepBusinessType → StepBasicInfo → StepReview, new copy, removed logo/cover/languages |
| `components/onboarding/ServiceTypeCard.tsx` | Unused (cards live inline in page) |

---

## UX improvements

1. **Clarity:** One main idea per step.
2. **Trust:** “Takes less than 2 minutes”, “edit anytime”, “we’ll help you”.
3. **Momentum:** Business type first, then basic info, then quick review.
4. **Reduced load:** Fewer fields; logo/cover/languages deferred.
5. **Completion:** Review step with summary and clear CTA.
