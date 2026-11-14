from extensions import db


class ArtefactosRecursos(db.Model):

    __tablename__ = "artefactos_recursos"

    artefacto_id = db.Column(
        db.Integer,
        db.ForeignKey("artefactos.id"),
        primary_key=True
    )

    recurso_id = db.Column(
        db.Integer,
        db.ForeignKey("recursos_multimedia.id"),
        primary_key=True
    )

    uso = db.Column(db.String(50), nullable=False)

    artefacto = db.relationship(
        "Artefacto",
        backref="recursos_asociados"
    )

    recurso = db.relationship(
        "RecursoMultimedia",
        backref="artefactos_asociados"
    )
