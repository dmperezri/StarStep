
"""StarStep — Capítulo 1: Rock & Roll.

Integra:
- Páginas y API del frontend.
- Persistencia local de jugadores.
- SQLAlchemy, Flask-Migrate y modelos del equipo.

La tabla local 'players' se mantiene temporalmente separada
de los modelos SQLAlchemy hasta integrar sus esquemas.
"""

import json
import re
import sqlite3
from pathlib import Path
from contextlib import contextmanager

from flask import Flask, jsonify, render_template, request

from extensions import db, migrate


# ============================================================
# CONFIGURACIÓN
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

# Base local utilizada por el frontend actual.
LOCAL_DB_FILE = BASE_DIR / "starstep.db"

app = Flask(__name__)

app.config.update(
    JSON_AS_ASCII=False,
    SQLALCHEMY_DATABASE_URI="sqlite:///starstep.db",
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
)

# Inicializar extensiones incorporadas desde develop.
db.init_app(app)
migrate.init_app(app, db)

# Registrar los modelos del equipo.
import models  # noqa: E402, F401


# ============================================================
# BASE DE DATOS LOCAL DEL FRONTEND
# ============================================================


@contextmanager
def connect():
    """Administrar la transacción y cerrar la conexión SQLite."""

    connection = sqlite3.connect(LOCAL_DB_FILE)
    connection.row_factory = sqlite3.Row

    try:
        with connection:
            yield connection
    finally:
        connection.close()



def ensure_db():
    """Crear la tabla local de progreso si no existe."""

    with connect() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS players (
                id TEXT PRIMARY KEY,
                alias TEXT NOT NULL DEFAULT 'CADETE',
                avatar TEXT NOT NULL DEFAULT 'astronauta',
                notes TEXT NOT NULL DEFAULT '',
                artifacts TEXT NOT NULL DEFAULT '[]',
                completed TEXT NOT NULL DEFAULT '[]'
            )
            """
        )


def public(row):
    """Convertir un registro local en respuesta JSON."""

    return {
        "id": row["id"],
        "alias": row["alias"],
        "avatar": row["avatar"],
        "notes": row["notes"],
        "artifacts": json.loads(row["artifacts"]),
        "completed": json.loads(row["completed"]),
    }


def valid_id(value):
    return (
        isinstance(value, str)
        and re.fullmatch(r"[a-zA-Z0-9_-]{8,64}", value) is not None
    )


def request_player_id(data):
    player_id = data.get("id") if data else None
    return player_id if valid_id(player_id) else None


def request_data():
    """Leer parámetros GET o JSON POST."""

    if request.method == "POST":
        return request.get_json(silent=True) or {}

    return request.args


# ============================================================
# RUTAS DEL FRONTEND
# ============================================================

@app.get("/")
def inicio():
    return render_template("index.html")


@app.get("/astronauta")
def astronauta():
    return render_template("astronauta.html")


@app.get("/despegue")
def despegue():
    return render_template("despegue.html")


@app.get("/luna")
def luna():
    return render_template("luna.html")


@app.get("/marte")
def marte():
    return render_template("marte.html")


@app.get("/huellas")
def huellas():
    return render_template("huellas.html")


@app.get("/bitacora")
def bitacora():
    return render_template("bitacora.html")



@app.get("/archivo-nasa")
def archivo_nasa():
    return render_template("archivo-nasa.html")

# ============================================================
# DIAGNÓSTICO
# ============================================================

@app.get("/api/health")
def health():
    return jsonify(
        project="StarStep",
        chapter="Rock & Roll",
        status="ok",
        proyecto="StarStep",
        estado="ok",
    )


@app.get("/diagnostico")
def diagnostico():
    return """
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>StarStep — Diagnóstico</title>
      </head>
      <body style="
        background:#0E1233;
        color:#8FF0D8;
        font:20px monospace;
        padding:30px;
      ">
        <h1>STARSTEP · FLASK OK</h1>
        <p>El servidor Flask responde correctamente.</p>
        <a href="/" style="color:#FFE066">
          Volver al juego
        </a>
      </body>
    </html>
    """


# ============================================================
# API — PERFIL Y PROGRESO
# ============================================================

@app.route("/api/progreso", methods=["GET", "POST"])
def api_progreso():
    data = request_data()

    player_id = request_player_id(data)

    if not player_id:
        return jsonify(error="ID inválido"), 400

    with connect() as connection:

        if request.method == "POST":
            alias = str(data.get("alias", "CADETE")).strip()
            avatar = str(data.get("avatar", "astronauta"))

            allowed_avatars = {
                "vice",
                "astronauta",
                "jaguar",
                "geologa",
                "piloto",
                "guardian",
            }

            if not 2 <= len(alias) <= 18:
                return jsonify(error="Alias inválido"), 400

            if avatar not in allowed_avatars:
                return jsonify(error="Avatar inválido"), 400

            connection.execute(
                "INSERT OR IGNORE INTO players(id) VALUES(?)",
                (player_id,),
            )

            connection.execute(
                """
                UPDATE players
                SET alias = ?, avatar = ?
                WHERE id = ?
                """,
                (alias, avatar, player_id),
            )

        row = connection.execute(
            "SELECT * FROM players WHERE id = ?",
            (player_id,),
        ).fetchone()

        return jsonify(public(row) if row else {})


# ============================================================
# API — DESCUBRIMIENTOS
# ============================================================

@app.post("/api/descubrimiento")
def api_descubrimiento():
    data = request.get_json(silent=True) or {}

    player_id = request_player_id(data)
    artifact = data.get("artifact")

    allowed_artifacts = {
        "eagle",
        "easep",
        "alsep",
        "reflector",
        "opportunity",
        "blueberries",
    }

    if not player_id or artifact not in allowed_artifacts:
        return jsonify(error="Datos inválidos"), 400

    # Compatibilidad con el nombre anterior usado por el frontend.
    if artifact == "alsep":
        artifact = "easep"

    with connect() as connection:
        connection.execute(
            "INSERT OR IGNORE INTO players(id) VALUES(?)",
            (player_id,),
        )

        row = connection.execute(
            "SELECT * FROM players WHERE id = ?",
            (player_id,),
        ).fetchone()

        collection = sorted(
            set(json.loads(row["artifacts"]) + [artifact])
        )

        connection.execute(
            """
            UPDATE players
            SET artifacts = ?
            WHERE id = ?
            """,
            (json.dumps(collection), player_id),
        )

        updated_row = connection.execute(
            "SELECT * FROM players WHERE id = ?",
            (player_id,),
        ).fetchone()

        return jsonify(public(updated_row))


# ============================================================
# API — BITÁCORA
# ============================================================

@app.route("/api/bitacora", methods=["GET", "POST"])
def api_bitacora():
    data = request_data()
    player_id = request_player_id(data)

    if not player_id:
        return jsonify(error="ID inválido"), 400

    with connect() as connection:

        if request.method == "POST":
            connection.execute(
                "INSERT OR IGNORE INTO players(id) VALUES(?)",
                (player_id,),
            )

            row = connection.execute(
                "SELECT * FROM players WHERE id = ?",
                (player_id,),
            ).fetchone()

            notes = str(
                data.get("notes", row["notes"])
            )[:2000]

            previous_completed = json.loads(
                row["completed"]
            )

            requested_completed = data.get(
                "completed",
                previous_completed,
            )

            if not isinstance(requested_completed, list):
                return jsonify(error="Actos inválidos"), 400

            valid_acts = {"luna", "marte", "huellas"}

            completed = sorted(
                set(previous_completed)
                | {
                    act
                    for act in requested_completed
                    if isinstance(act, str) and act in valid_acts
                }
            )

            connection.execute(
                """
                UPDATE players
                SET notes = ?, completed = ?
                WHERE id = ?
                """,
                (
                    notes,
                    json.dumps(completed),
                    player_id,
                ),
            )

        row = connection.execute(
            "SELECT * FROM players WHERE id = ?",
            (player_id,),
        ).fetchone()

        return jsonify(public(row) if row else {})


# ============================================================
# INICIALIZACIÓN
# ============================================================

ensure_db()


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
