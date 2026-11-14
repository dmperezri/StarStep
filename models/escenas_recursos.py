from extensions import db


class EscenasRecursos(db.Model):

    __tablename__ = "escenas_recursos"

    escena_id = db.Column(
        db.Integer,
        db.ForeignKey("escenas.id"),
        primary_key=True
    )

    recurso_id = db.Column(
        db.Integer,
        db.ForeignKey("recursos_multimedia.id"),
        primary_key=True
    )

    uso = db.Column(db.String(50), nullable=False)

    escena = db.relationship(
        "Escena",
        backref="recursos_asociados"
    )

    recurso = db.relationship(
        "RecursoMultimedia",
        backref="escenas_asociadas"
    )
