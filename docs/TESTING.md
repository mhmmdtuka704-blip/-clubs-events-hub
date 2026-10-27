# Phase 1 verification record

Browser journey verified on 26 October 2026; release checks repeated on 27 October 2026. Publishing status is kept in SUBMISSION.md.

## Automated checks

- 35 business-logic tests: date/week/year boundaries, intersecting filters, mock-data relationships, registration, login/logout, validation, ownership, duplicate/capacity checks, cancellation, deletion cleanup, immutability and safe return navigation.
- Production Vite build.
- Prettier source-format check.
- A GitHub Actions workflow runs the same checks on pushes to main and pull requests. Check the Actions tab for the latest hosted result.

## Hosted production smoke check

On 27 October 2026, the deployed production app was opened successfully. Maya's demo login showed her four hosted events and seeded RSVP. Cancelling and restoring that RSVP updated the attendee count from 1 to 0 and back to 1. A direct visit to `/events/film-evening` loaded the correct details page, confirming hosted SPA routing. No console errors or warnings were observed during this smoke check. The hosting service subsequently confirmed public access after the owner requested it.

## Browser checks

| Scenario                                       | Observed result                                                                           |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Blank registration and mismatched confirmation | Errors shown; focus moves to the first invalid field                                      |
| Valid registration                             | New account created and logged in; empty dashboard shown                                  |
| Invalid credentials                            | Clear error; valid credentials then allow login                                           |
| Registered user logs out and back in           | Account works during the same mock session                                                |
| User-specific dashboard                        | A newly registered user starts empty; Alex sees the seeded owned events and RSVP          |
| Search and combined filters                    | Matching results update; conflicting filters show an empty state; reset restores the list |
| RSVP from Event Details                        | Attendee count increments and the dashboard includes the event                            |
| Cancel from dashboard                          | RSVP removed and dashboard returns to its empty state                                     |
| Invalid event form                             | Required-field feedback shown with focus on the first invalid input                       |
| Valid event form                               | Event appears in shared calendar and details                                              |
| Edit event                                     | Existing values pre-filled; title/location changes appear in details                      |
| Delete dialog cancel                           | Event retained and focus returns to the trigger                                           |
| Delete confirmation                            | Event and related RSVP removed; dashboard counts update                                   |
| Direct protected edit route                    | Login required; return path preserved                                                     |
| Other creator's edit route                     | Edit is blocked after login as a different user                                           |
| Dashboard tabs                                 | Arrow keys switch tabs and move focus correctly                                           |
| Mobile menu                                    | Opens with the expected navigation links                                                  |
| Theme switch                                   | Light/dark state updates across views                                                     |
| Expandable details                             | Additional event information opens and closes                                             |

Native date/time inputs were tested with actual keyboard entry, including committing their values before submission.

## Responsive checks

The local fixture at `/tests/fixtures/responsive.html` embeds the real app at controlled viewport widths and reports horizontal overflow. It is development-only and is not built into `dist/`.

| Width           | Checked views                                                                              |
| --------------- | ------------------------------------------------------------------------------------------ |
| 320px           | Homepage and logged-in dashboard/header                                                    |
| 390px           | Homepage, calendar, event details, club details, login, register, dashboard and event form |
| 768px           | Event form and calendar                                                                    |
| Desktop preview | All eight view types and the complete account/RSVP/event-management journey                |

The checked mobile and tablet layouts report no horizontal overflow. The narrow logged-in header was adjusted to keep its logout label on one line. Screenshots are in `docs/screenshots/`.

## Scope

This is the required mock frontend. Full refresh resets session data. Client-side account/ownership checks are demonstrations rather than backend security. No server, database or real account service is included in Phase 1.
