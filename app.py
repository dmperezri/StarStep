from flask import Flask, jsonify, render_template

app = Flask(__name__)


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


@app.get("/bitacora")
def bitacora():
    return render_template("bitacora.html")


@app.get("/api/health")
def health():
    return jsonify(project="StarStep", chapter="Rock & Roll", status="ok")


if __name__ == "__main__":
    app.run(debug=True)
