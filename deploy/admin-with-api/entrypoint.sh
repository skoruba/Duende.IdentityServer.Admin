#!/bin/bash
# Runs the Admin API (127.0.0.1 only) and the Admin UI (public, port 8080) in one container.
#
# The Admin API starts first: it applies the database migrations and the seed data before it listens,
# and the Admin UI starts once the API accepts connections, so the UI never serves a request before
# the database is ready. When either process exits, the other one is stopped and the container exits
# with the same code, so the hosting platform restarts it. SIGTERM from the platform goes to both.
set -u

ADMIN_API_INTERNAL_URL="${ADMIN_API_INTERNAL_URL:-http://127.0.0.1:5000}"
API_HOST_PORT="${ADMIN_API_INTERNAL_URL#*://}"
API_HOST="${API_HOST_PORT%%:*}"
API_PORT="${API_HOST_PORT##*:}"
API_PORT="${API_PORT%%/*}"

API_PID=
ADMIN_PID=

shutdown() {
    kill -TERM ${API_PID:+"$API_PID"} ${ADMIN_PID:+"$ADMIN_PID"} 2>/dev/null
}
trap shutdown TERM INT

# Each application reads appsettings.json from its working directory.
# ASPNETCORE_URLS wins over ASPNETCORE_HTTP_PORTS; the port variable is dropped for the API so that
# Kestrel does not warn about overriding it.
(cd /app/api && exec env -u ASPNETCORE_HTTP_PORTS ASPNETCORE_URLS="$ADMIN_API_INTERNAL_URL" \
    dotnet Skoruba.Duende.IdentityServer.Admin.Api.dll) &
API_PID=$!

echo "entrypoint: waiting for the Admin API on $API_HOST:$API_PORT"
until (exec 3<>"/dev/tcp/$API_HOST/$API_PORT") 2>/dev/null; do
    if ! kill -0 "$API_PID" 2>/dev/null; then
        wait "$API_PID"
        EXIT_CODE=$?
        echo "entrypoint: the Admin API exited with code $EXIT_CODE before it started listening"
        # The API logs a fatal startup error (for example an unreachable database) and exits with 0;
        # a start that never listened is a failure for the platform.
        [ "$EXIT_CODE" -eq 0 ] && EXIT_CODE=1
        exit "$EXIT_CODE"
    fi
    sleep 1
done
echo "entrypoint: the Admin API is listening, starting the Admin UI"

(cd /app/admin && exec dotnet Skoruba.Duende.IdentityServer.Admin.dll) &
ADMIN_PID=$!

wait -n "$API_PID" "$ADMIN_PID"
EXIT_CODE=$?

shutdown
wait "$API_PID" "$ADMIN_PID" 2>/dev/null
exit "$EXIT_CODE"
