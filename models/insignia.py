from extensions import db


class Insignia(db.Model):

    __tablename__ = "insignias"

    id = db.Column(db.Integer, primary_key=True)

    nombre = db.Column(
        db.String(100), nullable=False
    )

    descripcion = db.Column(
        db.Text, nullable=False
    )

    recurso_id = db.Column(
        db.Integer,
        db.ForeignKey("recursos_multimedia.id"),
        nullable=False
    )

    condicion = db.Column(
        db.JSON, nullable=False
    )

    activa = db.Column(
        db.Boolean,
        nullable=False,
        default=True
    )

    recurso = db.relationship(
        "RecursoMultimedia", backref="insignias"
    )

    obtenidas = db.relationship(
        "InsigniaObtenida",
        back_populates="insignia"
    )
