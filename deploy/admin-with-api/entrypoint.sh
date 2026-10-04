#!/bin/bash
# Runs the Admin API (127.0.0.1:5000, internal) and the Admin UI (port 8080) in one container.
#
# The Admin API starts first, because it applies the database migrations before it listens; the Admin UI
# starts once the API accepts connections. When either process exits, the other one is stopped and the
# container exits, so the hosting platform restarts it. SIGTERM from the platform goes to both.

shutdown() {
    kill -TERM ${API_PID:-} ${ADMIN_PID:-} 2>/dev/null
}
trap shutdown TERM INT

# Each application reads appsettings.json from its working directory. The API drops ASPNETCORE_HTTP_PORTS
# so that Kestrel does not warn about ASPNETCORE_URLS overriding it.
(cd /app/api && exec env -u ASPNETCORE_HTTP_PORTS ASPNETCORE_URLS=http://127.0.0.1:5000 \
    dotnet Skoruba.Duende.IdentityServer.Admin.Api.dll) &
API_PID=$!

until (exec 3<>/dev/tcp/127.0.0.1/5000) 2>/dev/null; do
    if ! kill -0 "$API_PID" 2>/dev/null; then
        wait "$API_PID"
        EXIT_CODE=$?
        echo "entrypoint: the Admin API exited with code $EXIT_CODE before it started listening"
        # A fatal startup error (an unreachable database, for example) ends the API with code 0
        exit $(( EXIT_CODE == 0 ? 1 : EXIT_CODE ))
    fi
    sleep 1
done

(cd /app/admin && exec dotnet Skoruba.Duende.IdentityServer.Admin.dll) &
ADMIN_PID=$!

wait -n "$API_PID" "$ADMIN_PID"
EXIT_CODE=$?
shutdown
wait
exit "$EXIT_CODE"
