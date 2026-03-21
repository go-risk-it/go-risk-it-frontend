#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="${BACKEND_DIR:-$(cd "$SCRIPT_DIR/../../go-risk-it" 2>/dev/null && pwd)}"

SUPABASE_URL="http://localhost:8000"
BACKEND_URL="http://localhost:8080"
ANON_KEY="$(grep '^ANON_KEY=' "$BACKEND_DIR/component-test/.env" | cut -d= -f2)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

die() { echo -e "${RED}Error: $1${NC}" >&2; exit 1; }
info() { echo -e "${GREEN}$1${NC}"; }
warn() { echo -e "${YELLOW}$1${NC}"; }

cleanup() {
    if [[ -n "${DEV_PID:-}" ]]; then
        kill "$DEV_PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT

# ── 1. Start backend stack ──────────────────────────────────────────

start_backend() {
    if curl -sf "$BACKEND_URL/status" > /dev/null 2>&1; then
        info "Backend already running."
    else
        info "Starting backend stack..."
        "$SCRIPT_DIR/e2e-stack.sh" up
    fi
}

# ── 2. Start frontend dev server ────────────────────────────────────

start_frontend() {
    if curl -sf "http://localhost:5173" > /dev/null 2>&1; then
        info "Frontend dev server already running."
        return
    fi

    info "Starting frontend dev server..."
    cd "$FRONTEND_DIR"
    npm run dev -- --host 2>/dev/null &
    DEV_PID=$!

    printf "Waiting for frontend"
    for i in $(seq 1 30); do
        if curl -sf "http://localhost:5173" > /dev/null 2>&1; then
            echo -e " ${GREEN}ready${NC}"
            return
        fi
        printf "."
        sleep 1
    done
    echo -e " ${RED}timeout${NC}"
    die "Frontend dev server failed to start."
}

# ── 3. Supabase auth helpers ────────────────────────────────────────

supabase_signup() {
    local email="$1" password="$2"
    curl -sf -X POST "$SUPABASE_URL/auth/v1/signup" \
        -H "apikey: $ANON_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}" > /dev/null 2>&1 || true
}

supabase_login() {
    local email="$1" password="$2"
    curl -sf -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
        -H "apikey: $ANON_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}"
}

get_jwt() {
    local login_response="$1"
    echo "$login_response" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])"
}

# ── 4. Game API helpers ─────────────────────────────────────────────

api_call() {
    local jwt="$1" method="$2" path="$3" body="${4:-}"
    local args=(-sf -X "$method" -H "Authorization: Bearer $jwt" -H "Content-Type: application/json")
    [[ -n "$body" ]] && args+=(-d "$body")
    curl "${args[@]}" "$BACKEND_URL/api/v1$path"
}

# ── 5. Main ─────────────────────────────────────────────────────────

PASSWORD="play_test_123"
PLAYER1_EMAIL="player1@dev.local"
PLAYER2_EMAIL="player2@dev.local"
PLAYER3_EMAIL="player3@dev.local"

start_backend
start_frontend

info "Creating admin user..."
supabase_signup "admin@admin.admin" "secret_password"
ADMIN_LOGIN="$(supabase_login "admin@admin.admin" "secret_password")"
ADMIN_JWT="$(get_jwt "$ADMIN_LOGIN")"

info "Resetting game state..."
api_call "$ADMIN_JWT" POST "/reset" > /dev/null

info "Creating players..."
for email in "$PLAYER1_EMAIL" "$PLAYER2_EMAIL" "$PLAYER3_EMAIL"; do
    supabase_signup "$email" "$PASSWORD"
done

P1_JWT="$(get_jwt "$(supabase_login "$PLAYER1_EMAIL" "$PASSWORD")")"
P2_JWT="$(get_jwt "$(supabase_login "$PLAYER2_EMAIL" "$PASSWORD")")"
P3_JWT="$(get_jwt "$(supabase_login "$PLAYER3_EMAIL" "$PASSWORD")")"

info "Creating lobby..."
LOBBY_RESPONSE="$(api_call "$P1_JWT" POST "/lobbies" '{"ownerName":"Alice"}')"
LOBBY_ID="$(echo "$LOBBY_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['lobbyId'])")"

info "Joining players to lobby $LOBBY_ID..."
api_call "$P2_JWT" POST "/lobbies/$LOBBY_ID/join" '{"participantName":"Bob"}' > /dev/null
api_call "$P3_JWT" POST "/lobbies/$LOBBY_ID/join" '{"participantName":"Charlie"}' > /dev/null

info "Starting game..."
api_call "$P1_JWT" POST "/lobbies/$LOBBY_ID/start" > /dev/null

GAMES_RESPONSE="$(api_call "$P1_JWT" GET "/games/summary")"
GAME_ID="$(echo "$GAMES_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['games'][0]['id'])")"

echo ""
echo -e "${BOLD}════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  Game ready!${NC}"
echo -e "${BOLD}════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}URL:${NC}  http://localhost:5173/game/$GAME_ID"
echo ""
echo -e "  ${CYAN}Players:${NC}"
echo -e "    Alice    ${PLAYER1_EMAIL}  /  ${PASSWORD}"
echo -e "    Bob      ${PLAYER2_EMAIL}  /  ${PASSWORD}"
echo -e "    Charlie  ${PLAYER3_EMAIL}  /  ${PASSWORD}"
echo ""
echo -e "${BOLD}════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  Open 3 browser windows (or incognito tabs),"
echo -e "  sign in as each player, and navigate to the URL above."
echo ""
echo -e "  Press ${BOLD}Ctrl+C${NC} to stop the dev server."
echo ""

# Keep alive until Ctrl+C
if [[ -n "${DEV_PID:-}" ]]; then
    wait "$DEV_PID"
else
    info "Dev server was already running — script complete."
fi
