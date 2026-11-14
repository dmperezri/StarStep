"""StarStep - aplicación Flask. Persistencia SQLite local (sin migraciones ni credenciales)."""
import json
import re
import sqlite3
from pathlib import Path
from flask import Flask, jsonify, render_template, request

BASE = Path(__file__).resolve().parent
DB_FILE = BASE / 'starstep.db'
app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False


def connect():
    db = sqlite3.connect(DB_FILE)
    db.row_factory = sqlite3.Row
    return db


def ensure_db():
    with connect() as db:
        db.execute("""CREATE TABLE IF NOT EXISTS players (
            id TEXT PRIMARY KEY, alias TEXT NOT NULL DEFAULT 'CADETE',
            avatar TEXT NOT NULL DEFAULT 'astronauta', notes TEXT NOT NULL DEFAULT '',
            artifacts TEXT NOT NULL DEFAULT '[]', completed TEXT NOT NULL DEFAULT '[]'
        )""")


def public(row):
    return dict(id=row['id'], alias=row['alias'], avatar=row['avatar'],
                notes=row['notes'], artifacts=json.loads(row['artifacts']),
                completed=json.loads(row['completed']))


def valid_id(value):
    return isinstance(value, str) and re.fullmatch(r'[a-zA-Z0-9_-]{8,64}', value)


def request_player_id(data):
    key = data.get('id') if data else None
    return key if valid_id(key) else None


@app.get('/')
def inicio(): return render_template('index.html')

@app.get('/astronauta')
def astronauta(): return render_template('astronauta.html')

@app.get('/despegue')
def despegue(): return render_template('despegue.html')

@app.get('/luna')
def luna(): return render_template('luna.html')

@app.get('/marte')
def marte(): return render_template('marte.html')

@app.get('/huellas')
def huellas(): return render_template('huellas.html')

@app.get('/bitacora')
def bitacora(): return render_template('bitacora.html')

@app.get('/api/health')
def health(): return jsonify(project='StarStep', status='ok')

@app.get('/diagnostico')
def diagnostico():
    return '<!doctype html><html><meta charset="utf-8"><body style="background:#0E1233;color:#8FF0D8;font:20px monospace;padding:30px"><h1>STARSTEP · FLASK OK</h1><p>Si ves esto, Flask responde correctamente.</p><a style="color:#FFE066" href="/">Volver al juego</a></body></html>'


@app.route('/api/progreso', methods=['GET', 'POST'])
def api_progreso():
    data = request.get_json(silent=True) or {} if request.method == 'POST' else request.args
    player_id = request_player_id(data)
    if not player_id:
        return jsonify(error='ID inválido'), 400
    with connect() as db:
        if request.method == 'POST':
            alias = str(data.get('alias', 'CADETE')).strip()
            avatar = str(data.get('avatar', 'astronauta'))
            if not 2 <= len(alias) <= 18 or avatar not in ('vice','astronauta','jaguar','geologa','piloto','guardian'):
                return jsonify(error='Perfil inválido'), 400
            db.execute('INSERT OR IGNORE INTO players(id) VALUES(?)', (player_id,))
            db.execute('UPDATE players SET alias=?,avatar=? WHERE id=?',(alias,avatar,player_id))
        row = db.execute('SELECT * FROM players WHERE id=?',(player_id,)).fetchone()
        return jsonify(public(row) if row else {})


@app.post('/api/descubrimiento')
def api_descubrimiento():
    data = request.get_json(silent=True) or {}
    player_id = request_player_id(data)
    artifact = data.get('artifact')
    if not player_id or artifact not in ('eagle','easep','reflector','opportunity','blueberries'):
        return jsonify(error='Datos inválidos'), 400
    with connect() as db:
        db.execute('INSERT OR IGNORE INTO players(id) VALUES(?)',(player_id,))
        row = db.execute('SELECT * FROM players WHERE id=?',(player_id,)).fetchone()
        collection = sorted(set(json.loads(row['artifacts'])+[artifact]))
        db.execute('UPDATE players SET artifacts=? WHERE id=?',(json.dumps(collection),player_id))
        row = db.execute('SELECT * FROM players WHERE id=?',(player_id,)).fetchone()
        return jsonify(public(row))


@app.route('/api/bitacora', methods=['GET', 'POST'])
def api_bitacora():
    data = request.get_json(silent=True) or {} if request.method == 'POST' else request.args
    player_id = request_player_id(data)
    if not player_id:
        return jsonify(error='ID inválido'), 400
    with connect() as db:
        if request.method == 'POST':
            db.execute('INSERT OR IGNORE INTO players(id) VALUES(?)',(player_id,))
            row=db.execute('SELECT * FROM players WHERE id=?',(player_id,)).fetchone()
            notes = str(data.get('notes',row['notes']))[:2000]
            requested = data.get('completed',json.loads(row['completed']))
            if not isinstance(requested,list):
                return jsonify(error='Actos inválidos'),400
            completed=sorted(set(json.loads(row['completed'])+[x for x in requested if x in ('luna','marte','huellas')]))
            db.execute('UPDATE players SET notes=?,completed=? WHERE id=?',(notes,json.dumps(completed),player_id))
        row=db.execute('SELECT * FROM players WHERE id=?',(player_id,)).fetchone()
        return jsonify(public(row) if row else {})


ensure_db()
if __name__ == '__main__':
    app.run(debug=True)
