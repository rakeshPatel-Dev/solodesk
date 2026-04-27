# Client Architecture

This app now follows a layered production structure:

- `app/` - application bootstrap, providers, router composition, and shell-level setup.
- `pages/` - route-level screens.
- `widgets/` - composed UI blocks built from multiple features or entities.
- `features/` - user-facing business capabilities such as account actions, auth flows, and CRUD interactions.
- `entities/` - domain objects and entity-specific types, hooks, and UI.
- `shared/` - reusable primitives, API clients, utilities, config, and common types/UI.

Current account flow:

- `features/account/ui/AccountHero.tsx`
- `features/account/ui/AccountOverview.tsx`
- `features/account/ui/ProfileEditorDialog.tsx`
- `pages/Account.tsx` composes the feature UI and lazy-loads the editor dialog.

Guidelines:

- Keep route screens thin.
- Put business logic in `features/`.
- Put truly reusable pieces in `shared/`.
- Add new domain-specific pieces under `entities/` before promoting them to `shared/`.
