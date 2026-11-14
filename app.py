from flask import Flask, jsonify, render_template
from extensions import db, migrate

app = Flask(__name__)

# Configuracion de la base de datos
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///starstep.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Inicializar extensiones
db.init_app(app)
migrate.init_app(app, db)

# Registrar modelos
import models


# Pantalla principal
@app.get("/")
def inicio():
    return render_template("index.html")


# Personalizacion del astronauta
@app.get("/astronauta")
def astronauta():
    return render_template("astronauta.html")


# Cinematica de despegue
@app.get("/despegue")
def despegue():
    return render_template("despegue.html")


# Exploracion lunar
@app.get("/luna")
def luna():
    return render_template("luna.html")


# Bitacora del astronauta
@app.get("/bitacora")
def bitacora():
    return render_template("bitacora.html")


# Verificacion de la API
@app.get("/api/health")
def health():
    return jsonify(
        project="StarStep",
        chapter="Rock & Roll",
        status="ok",
        proyecto="StarStep",
        estado="ok"
    )


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
