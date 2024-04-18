import database from "infra/database.js";

async function status(request, response) {
  const res = await database.query(
    `SELECT
    (SELECT version()) AS postgres_version,
    (SELECT setting FROM pg_settings WHERE name = 'max_connections') AS max_connections,
    (SELECT count(*) FROM pg_stat_activity) AS active_connections;
  `,
  );

  console.log(res.rows);

  const databaseVersion = res.rows[0].postgres_version;

  const updatedAt = new Date().toISOString();
  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersion.split(" ")[1],
      },
    },
  });
}

export default status;
