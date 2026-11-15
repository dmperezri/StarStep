from extensions import db


class RecursoMultimedia(db.Model):

    __tablename__ = "recursos_multimedia"

    id = db.Column(db.Integer, primary_key=True)

    nombre = db.Column(db.String(100), nullable=False)

    tipo = db.Column(db.String(30), nullable=False)

    ruta = db.Column(db.String(500), nullable=False)

    formato = db.Column(db.String(20), nullable=False)

    descripcion = db.Column(db.Text, nullable=True)

    autor = db.Column(db.String(100), nullable=True)

    licencia = db.Column(db.String(100), nullable=True)

    fuente_url = db.Column(db.String(500), nullable=True)
