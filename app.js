const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3002/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObj = (dbObj) => {
  return {
    playerId: dbObj.player_id,
    playerName: dbObj.player_name,
    jerseyNumber: dbObj.jersey_number,
    role: dbObj.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayerDetails = `
    SELECT *
    FROM cricket_team
    ORDER BY player_id;`;
  const playerArray = await db.all(getPlayerDetails);

  response.send(
    playerArray.map((player) => convertDbObjectToResponseObj(player))
  );
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayerQuery = `
    INSERT INTO
        cricket_team( player_name, jersey_number, role)
    VALUES
        ('${playerName}',${jerseyNumber},'${role}');`;
  const dbResponse = await db.run(postPlayerQuery);
  const bookId = dbResponse.lastID;
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT *
    FROM cricket_team
    WHERE 
    player_id = ${playerId};`;

  const getPlayer = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObj(getPlayer));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;

  const updatePlayerQuery = `
        UPDATE 
            cricket_team
        SET
            player_name = '${playerName}',
            jersey_number = ${jerseyNumber},
            role='${role}'
        WHERE
            player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    DELETE
    FROM
     cricket_team 
     WHERE
     player_id = ${playerId};
     `;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
