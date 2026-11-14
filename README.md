# Icmersv1

Build a responsive web app (phone and desktop) called ICMERS, which stands for Integrated Campus Medical Emergency Reporting System. React with Tailwind and lucide-react icons.

CROSS-DEVICE COMMUNICATION (most important): the app must work between two different devices over the internet. When a user reports an emergency on one device (for example a phone), the clinic page open on another device (for example a laptop on a different network) must instantly show a popup and play a sound, without refreshing. In the same way, when the clinic acknowledges the request on the laptop, the phone must instantly show a "Clinic is on the way" popup. Use whatever backend and live-update (realtime) feature Lovable provides to store the requests and push live updates between devices. Set it up yourself; do not ask me to configure a database, write SQL or create tables manually. The data must be shared by everyone who opens the app link, not stored only in one browser. Do not use localStorage for the emergency requests (localStorage is allowed only for remembering the login and the mute setting).

THEME: light only, no dark mode. Soft red (#d23f3f) and green (#3a8f5c) on white. Use the attached image as a fixed, full-page background with a light white overlay. Cards are white at about 88% opacity with rounded-2xl corners. Sticky soft-red header (#d44444) with a white heart-pulse logo, "ICMERS" and the full name in small text under it (hide the full name on phones and show it as a small line at the top of the page instead), a speaker mute toggle, a bell icon (yellow dot when the clinic has pending requests), a user icon with the user name, and a Log out button. Add a small connection indicator in the header: a green dot with "Live" when connected, gray "Offline" otherwise. Add lucide icons on labels, tabs, buttons and stat cards.

LOGIN (demo, no real accounts): a centered card with the ICMERS logo and the full name, two tabs "User" and "Clinic personnel", an ID field (user icon) whose label is "User ID" and whose placeholder is "e.g. 25-64946" on the User tab, and whose label is "Staff ID" and whose placeholder is "Enter your staff ID" on the Clinic personnel tab, a password field (lock icon) and a Log in button. Accept any non-empty ID and password, otherwise show "Enter your ID and password to continue." Remember the logged-in role and ID so a refresh keeps the user logged in. The User tab opens the User page; the Clinic personnel tab opens the Clinic page (name shown as "Dr. Santos"). Add a small "Reset demo data" link that deletes all emergency requests for everyone and puts back the three seed requests.

REQUEST DATA: each emergency request has: request number (like "ICM-" plus 6 digits), reporter ID, reporter name, building, room, description, status ("Pending" or "Acknowledged"), acknowledged by, acknowledged at, and created time. There is no severity or priority level anywhere in the app. Seed requests: Carlos Reyes, CET, 103, Acknowledged; Maria Santos, CICS, 102, Pending; Juan Dela Cruz, CET, 101, Pending, "Feeling dizzy".

REALTIME RULES:
- Every open page updates its lists and counts live without refreshing.
- On any logged-in Clinic page, when a new request is created from any device, show the "New emergency" popup and play the alert sound.
- On the User page, when a request whose reporter ID matches the logged-in user's ID becomes Acknowledged (from any device), show the "Clinic is on the way" popup and play the chime.
- "My requests" shows only the requests created by the logged-in user's ID.

USER PAGE: heading "Your health, our priority", subtext "Report an emergency quickly and get the help you need." Card "Report an emergency" with:
- Building dropdown with options: CET, CICS, HEB, CIT, CTE, CABEIHM, and "Others (specify)". When "Others (specify)" is chosen, show a text input right under the dropdown (max 40 characters, placeholder "Type the location") and focus it. Use the typed text as the building.
- Room selector: a dropdown-style field (same look as the Building dropdown, label "Room" with a door icon, placeholder "Select room", chevron on the right). When the user taps it, it opens a panel directly below it that shows a table of room numbers instead of a plain list. Show numbers only, without the word "Rm". The table has 5 columns and 5 rows: row 1 is 101, 102, 103, 104, 105; row 2 is 201 to 205; row 3 is 301 to 305; row 4 is 401 to 405; row 5 is 501 to 505. Each cell is a tappable button at least 44px tall, and the selected cell is highlighted in red. Below the table, inside the same panel, add a full-width "Others (specify)" button. Tapping a room number closes the panel and shows that number in the field. Tapping "Others (specify)" closes the panel, shows "Others" in the field, and shows a text input right under it (max 40 characters, placeholder "Type the room") and focuses it; use the typed text as the room. Close the panel when the user taps outside it or presses Escape. The panel must fit inside a 360px-wide phone screen without sideways scrolling and must work with a keyboard (arrow keys move between cells, Enter selects).
- An optional description textarea ("What happened? e.g. feeling dizzy, someone fainted").
- ONE large red button "Report emergency" with an alert-circle icon and a gentle pulse animation (respect reduced motion). Do not add Moderate, Severe or any other emergency-type buttons.
- Validation message: "Choose a building and room, or select Others and type it in."
- On send, create the request for everyone to see, clear the form, and show an "Emergency sent" popup for 8 seconds.
Display all text typed by users as plain text, never as HTML.
Below it, a dashed "Presentation demo" box with a button "Simulate clinic acknowledged" (shows the acknowledgment popup on this device). Do not remove this button. Then a "My requests" card listing the user's own requests (building, room, time, description) with badges "Waiting for clinic" or "Clinic responding", and an empty state "No requests yet. Your reports will appear here."

CLINIC PAGE: heading "Clinic dashboard", subtext "Monitor and respond to campus health emergencies." A tips card titled "Be ready. Respond smart. Save lives." with three short tips (confirm building and room before leaving; bring the first aid kit and log sheet; acknowledge first so the user knows help is coming). Three stat cards (Total, Pending, Acknowledged), always 3 columns, compact on phones. A dashed demo box with a button "Simulate incoming emergency" that creates a real random request (reporter "Demo User") so it also shows on other devices. Do not remove this button. Tabs "Pending emergencies (n)" and "History". On desktop show a table (Request ID, Reporter, Location, Time, Details, Action or Status); on phones show the same data as stacked cards with a full-width button. Pending rows have a green "Acknowledge" button with a check icon; acknowledging marks the request Acknowledged for everyone, records who acknowledged it and when, and closes the popup. Empty states: "No pending emergencies. You are all caught up." and "No history yet."

POPUPS (centered on screen with a dimmed backdrop):
- Clinic: "New emergency" with building, room, reporter name and description, plus a green Acknowledge button. It stays until acknowledged or closed. The bell reopens the latest pending alert, or shows "No new alerts".
- User: "Clinic is on the way" with the building and room, a 60-second countdown with a shrinking progress bar, auto-close at 0. The bell reopens it, or shows "No notifications".
- Every popup has a minimize button (collapses to a small pill at the bottom-right, can be expanded again) and a close button.

SOUNDS (Web Audio, no audio files): clinic alert = three loud two-tone pulses; user acknowledgment = soft rising three-note chime; sent = short single ding. The speaker toggle in the header mutes or unmutes and is remembered.

Make everything keyboard accessible with visible focus styles, and make sure nothing scrolls sideways on a 360px-wide phone.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://icmersv1.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/59cfa22e-4470-4d5a-a8ca-97a3f1162f05).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
