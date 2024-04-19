import database from "infra/database.js";

async function status(request, response) {
  const res = await database.query(
    `SELECT
    (SELECT version()) AS postgres_version,
    (SELECT setting FROM pg_settings WHERE name = 'max_connections') AS max_connections,
    (SELECT count(*) FROM pg_stat_activity) AS active_connections;`,
  );

  const databaseVersionResponse = await database.query("SHOW server_version;");
  const databaseVersion = databaseVersionResponse.rows[0].server_version;

  const databaseMaxConnectionsResponse = await database.query(
    "SHOW max_connections;",
  );
  const databaseMaxConnections =
    databaseMaxConnectionsResponse.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnectionsResult = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  const databaseOpenedConnections =
    databaseOpenedConnectionsResult.rows[0].count;

  const updatedAt = new Date().toISOString();

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersion,
        max_connections: parseInt(databaseMaxConnections),
        opened_connections: databaseOpenedConnections,
      },
    },
  });
}

export default status;
