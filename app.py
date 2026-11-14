
from flask import Flask, render_template, jsonify

app = Flask(__name__)


@app.route("/")
def inicio():
    return render_template("index.html")


@app.route("/astronauta")
def astronauta():
    return render_template("astronauta.html")


@app.route("/luna")
def luna():
    return render_template("luna.html")


@app.route("/bitacora")
def bitacora():
    return render_template("bitacora.html")


@app.get("/api/health")
def health():
    return jsonify({
        "proyecto": "StarStep",
        "estado": "ok"
    })


if __name__ == "__main__":
    app.run(debug=True)




from flask import Flask, render_template, jsonify
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


@app.route("/")
def inicio():
    return render_template("index.html")


@app.route("/astronauta")
def astronauta():
    return render_template("astronauta.html")


@app.route("/luna")
def luna():
    return render_template("luna.html")


@app.route("/bitacora")
def bitacora():
    return render_template("bitacora.html")


@app.get("/api/health")
def health():
    return jsonify({
        "proyecto": "StarStep",
        "estado": "ok"
    })


if __name__ == "__main__":
    app.run(debug=True)
