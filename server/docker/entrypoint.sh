#!/bin/bash

cat <<EOF > /pgadmin4/servers.json
{
  "Servers": {
    "1": {
      "Name": "${PG_SERVER_NAME}",
      "Group": "Servers",
      "Host": "${PG_SERVER_HOST}",
      "Port": ${PG_SERVER_PORT},
      "MaintenanceDB": "postgres",
      "Username": "${PG_SERVER_USER}",
      "SSLMode": "prefer"
    }
  }
}
EOF

# Start pgAdmin
/docker-entrypoint.sh
