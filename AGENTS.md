<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules (ICMERS)

- Emergency requests live only in the shared database table and are pushed to every device with realtime subscriptions; never store them in localStorage (only the demo login and mute setting go there). Why: reports must reach the clinic on other devices instantly.
- There are no real accounts: the browser talks to the database with the public key, so status changes and demo reset go through narrow security-definer database functions instead of open UPDATE/DELETE grants. Why: limits what an anonymous visitor can change.
- "Reset demo data" hides old rows (cleared_at) and re-inserts seeds instead of deleting. Why: destructive deletes are blocked and history stays recoverable.
- Realtime INSERTs older than a few minutes never trigger the clinic alert, so seed rows restored by a reset do not pop up as new emergencies.
