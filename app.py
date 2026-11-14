
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
