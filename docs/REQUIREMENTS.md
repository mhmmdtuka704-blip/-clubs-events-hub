# Phase 1 requirements map

This maps the supplied CSC443 brief and the Clubs & Events Hub topic card to the implementation. It is a review aid; it does not replace the required README or the two Blackboard links.

| Requirement                                  | Implementation / evidence                                                                                                     |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| React functional components, hooks and props | `src/pages/`, reusable `src/components/`, shared `AppProvider`                                                                |
| Vite project                                 | `vite.config.js`, build/dev scripts and locked dependencies                                                                   |
| Tailwind responsive UI                       | Tailwind Vite integration; utility layouts plus theme and responsive rules in `src/styles.css`                                |
| Homepage: this week's events                 | `src/pages/Home.jsx`; local Monday–Sunday filtering                                                                           |
| Event List: club, date and category filters  | `src/pages/Events.jsx`; filters combine with search, persist in the URL and can be reset                                      |
| Event Details                                | `src/pages/EventDetails.jsx`; event information, club link, RSVP and availability                                             |
| Club Details                                 | `src/pages/ClubDetails.jsx`; club information and related events                                                              |
| Create/Edit Event                            | `src/pages/EventForm.jsx`; reusable form, prefilled edit state and validation                                                 |
| My Events & RSVPs dashboard                  | `src/pages/Dashboard.jsx`; current-user content, cancellation and creator actions                                             |
| Login and Register                           | `src/pages/Auth.jsx`; validated mock accounts and return navigation                                                           |
| Persistent navigation and React Router       | `src/components/Layout.jsx`, `src/App.jsx`; guarded routes and fallback views                                                 |
| Theme and show/hide interactions             | Shared light/dark toggle, mobile menu, event details disclosure and delete dialog                                             |
| Mock CRUD with local state                   | `src/context/AppContext.jsx`, `src/lib/model.js`; changes intentionally reset on refresh                                      |
| Clubs, Events, RSVPs and Users entities      | `src/data/seed.js`, `createInitialState`; IDs preserve relationships                                                          |
| Accessibility and clean code                 | Semantic regions, labels/errors, keyboard tabs, focus handling, SVG descriptions, reusable components and pure business logic |
| Mobile, tablet and desktop                   | Actual screenshots and observed responsive checks in `TESTING.md`                                                             |
| README content                               | Team names, topic/entities, app URL, setup, screenshots, mock-data explanation and contribution table                         |
| Live deployed frontend                       | Hosted demo linked in `SUBMISSION.md`; public access enabled on 27 October 2026                                               |
| Public GitHub repository                     | Public repository linked in SUBMISSION.md; contains the source, README, screenshots and verification setup                    |
| Four members, two views each                 | Four unassigned buckets in README; team must choose owners and record actual contributions                                    |
| Meaningful commits and branches              | Git initialized and generated source committed; each member still needs their own demonstrable work and Git history           |

Creator-only edit/delete checks are included in the frontend demonstration, anticipating the topic card's Phase 2 ownership rule. Real authorization and persistence remain Phase 2 backend work.

The supplied brief lists **3 November 2026** as its due date. The team's earlier Monday completion target is **2 November 2026**. Confirm the instructor's date format and any class announcements before submission.
