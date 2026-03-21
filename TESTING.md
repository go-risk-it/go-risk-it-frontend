# Testing

## E2E Tests

The e2e tests use [Playwright](https://playwright.dev/) to test full user flows against a real backend stack.

### Prerequisites

- **Docker** (with `docker compose` v2)
- **go-risk-it** backend repo cloned as a sibling directory:
  ```
  parent/
    go-risk-it/          # backend
    go-risk-it-frontend/ # this repo
  ```

### Architecture

The e2e tests run against this stack (managed via `docker compose` in `go-risk-it`):

```
Browser (Playwright)
  |
  v
SvelteKit dev server (:5173)
  |
  +---> Go backend (:8080) ---> Postgres (:5432)
  |
  +---> Kong/Supabase Auth (:8000)
              |
              +---> GoTrue (:9999) ---> Postgres
```

Services:
| Service   | Port  | Description                        |
|-----------|-------|------------------------------------|
| db        | 5432  | Supabase Postgres (with pgsodium)  |
| auth      | 9999  | Supabase GoTrue (via Kong at 8000) |
| kong      | 8000  | API gateway / auth proxy           |
| risk-it   | 8080  | Go game backend                    |
| jaeger    | 16686 | Tracing UI (optional)              |

### Quick Start

```bash
# 1. Start the backend stack
npm run e2e:up

# 2. Run e2e tests
npm run test:e2e

# 3. Stop when done
npm run e2e:down
```

Or use the script directly for more options:

```bash
./scripts/e2e-stack.sh up      # start services
./scripts/e2e-stack.sh status  # check health
./scripts/e2e-stack.sh logs    # view logs
./scripts/e2e-stack.sh down    # stop services
./scripts/e2e-stack.sh reset   # nuke volumes & restart
```

### Test Structure

| File                    | What it tests                              |
|-------------------------|--------------------------------------------|
| `auth.spec.ts`          | Login/signup flows via Supabase Auth       |
| `lobby.spec.ts`         | Game lobby: creating and joining games     |
| `game-turn.spec.ts`     | In-game turns: deploy, attack, reinforce   |
| `game-complete.spec.ts` | Full game to victory (uses SetupNearWin)   |

Global setup (`e2e/global-setup.ts`) verifies the backend is reachable and creates an admin test user in Supabase.

### Writing Tests

**Responsive dual-render gotcha:** `ActionPanel.svelte` renders all action components twice — once in the desktop `<aside>` and once in a mobile bottom sheet (via `{@render actionContent()}`). Both are in the DOM at all times; only one is visible depending on viewport. Playwright locators like `locator('[data-testid="attack-btn"]')` will match **both** elements, causing strict mode violations.

Always use `.first()` on action panel locators:
```ts
// Wrong — fails with "strict mode violation: 2 elements"
await page.locator('[data-testid="attack-btn"]').click();

// Correct
await page.locator('[data-testid="attack-btn"]').first().click();
```

Affected testids: `deploy-slider`, `deploy-btn`, `attack-slider`, `attack-btn`, `conquer-slider`, `conquer-btn`, `skip-attack-btn`, `end-turn-btn`, `skip-cards-btn`.

The helper functions in `e2e/helpers/game.ts` already apply `.first()` — prefer using them over raw locators.

### Troubleshooting

**"invalid secret key" / pgsodium errors**

The `supabase/postgres` image uses pgsodium which stores a decryption key in the `db-config` Docker volume. If the key gets out of sync (e.g., after pulling a new image), you'll get cryptic errors.

Fix:
```bash
npm run e2e:reset
# or
./scripts/e2e-stack.sh reset
```

This runs `docker compose down -v` to clear volumes, then starts fresh.

**Port conflicts**

If ports 5432, 8000, or 8080 are in use, stop conflicting services first. Common culprits:
- Local Postgres on 5432
- Other Docker stacks on 8000/8080

**Backend not reachable**

Check that all services are healthy:
```bash
./scripts/e2e-stack.sh status
```

If `risk-it` shows unhealthy, check its logs:
```bash
./scripts/e2e-stack.sh logs risk-it
```

The Go backend depends on `db` being healthy first. If `db` fails, everything else cascades.

**Tests time out**

Playwright is configured with `workers: 1` and `fullyParallel: false` because the game state is shared. If tests time out, check that the dev server is running (Playwright auto-starts it via `npm run dev`).
