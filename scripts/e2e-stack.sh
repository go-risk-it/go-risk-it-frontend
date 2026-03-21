#!/usr/bin/env bash
set -euo pipefail

BACKEND_DIR="${BACKEND_DIR:-$(cd "$(dirname "$0")/../../go-risk-it" 2>/dev/null && pwd)}"
BACKEND_STATUS_URL="http://localhost:8080/status"
SUPABASE_AUTH_URL="http://localhost:8000/auth/v1/health"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

die() { echo -e "${RED}Error: $1${NC}" >&2; exit 1; }
info() { echo -e "${GREEN}$1${NC}"; }
warn() { echo -e "${YELLOW}$1${NC}"; }

check_backend_dir() {
    [[ -d "$BACKEND_DIR" ]] || die "Backend repo not found at $BACKEND_DIR
Set BACKEND_DIR or clone go-risk-it as a sibling directory."
    [[ -f "$BACKEND_DIR/docker-compose.yml" ]] || die "No docker-compose.yml in $BACKEND_DIR"
}

get_anon_key() {
    grep '^ANON_KEY=' "$BACKEND_DIR/component-test/.env" | cut -d= -f2
}

compose() {
    docker compose --env-file "$BACKEND_DIR/component-test/.env" -f "$BACKEND_DIR/docker-compose.yml" "$@"
}

wait_for_service() {
    local url="$1" name="$2" max_attempts="${3:-30}"
    local attempt=1
    local extra_args=()
    [[ $# -ge 4 ]] && extra_args=("${@:4}")

    printf "Waiting for %s" "$name"
    while [[ $attempt -le $max_attempts ]]; do
        if curl -sf ${extra_args[@]+"${extra_args[@]}"} "$url" > /dev/null 2>&1; then
            echo -e " ${GREEN}ready${NC}"
            return 0
        fi
        printf "."
        sleep 2
        ((attempt++))
    done
    echo -e " ${RED}timeout${NC}"
    return 1
}

cmd_up() {
    check_backend_dir
    info "Starting backend stack from $BACKEND_DIR..."
    compose up -d db auth kong risk-it jaeger || true

    wait_for_service "$BACKEND_STATUS_URL" "backend" 30 || die "Backend failed to start.
Check logs with: $0 logs"

    local anon_key
    anon_key="$(get_anon_key)"
    wait_for_service "$SUPABASE_AUTH_URL" "supabase auth" 15 -H "apikey: $anon_key" \
        || warn "Auth may still be starting..."

    info "Backend stack is ready."
}

cmd_down() {
    check_backend_dir
    info "Stopping backend stack..."
    compose down
    info "Stack stopped."
}

cmd_reset() {
    check_backend_dir
    warn "Resetting backend stack (removing volumes)..."
    compose down -v
    info "Volumes removed. Starting fresh stack..."
    cmd_up
}

cmd_status() {
    check_backend_dir
    echo "Service status:"
    compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || compose ps

    local anon_key
    anon_key="$(get_anon_key)"

    echo ""
    echo "Health checks:"
    if curl -sf "$BACKEND_STATUS_URL" > /dev/null 2>&1; then
        echo -e "  backend: ${GREEN}healthy${NC}"
    else
        echo -e "  backend: ${RED}unreachable${NC}"
    fi
    if curl -sf -H "apikey: $anon_key" "$SUPABASE_AUTH_URL" > /dev/null 2>&1; then
        echo -e "  supabase-auth: ${GREEN}healthy${NC}"
    else
        echo -e "  supabase-auth: ${RED}unreachable${NC}"
    fi
}

cmd_logs() {
    check_backend_dir
    compose logs --tail=50 "${@:---follow}"
}

usage() {
    cat <<EOF
Usage: $0 <command>

Commands:
  up      Start the backend stack (db, auth, kong, risk-it, jaeger)
  down    Stop the backend stack
  reset   Stop, remove volumes, and restart (fixes pgsodium errors)
  status  Show service status and health checks
  logs    Show recent logs (pass service names to filter)

Environment:
  BACKEND_DIR  Path to go-risk-it repo (default: ../go-risk-it)
EOF
}

case "${1:-}" in
    up)     cmd_up ;;
    down)   cmd_down ;;
    reset)  cmd_reset ;;
    status) cmd_status ;;
    logs)   shift; cmd_logs "$@" ;;
    *)      usage; exit 1 ;;
esac
