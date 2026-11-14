from extensions import db


class Dialogo(db.Model):

    __tablename__ = "dialogos"

    __table_args__ = (
        db.UniqueConstraint(
            "escena_id",
            "evento",
            "orden",
            name="uq_dialogo_evento_orden"
        ),
        db.CheckConstraint(
            "orden > 0",
            name="ck_dialogo_orden"
        ),
    )

    id = db.Column(db.Integer, primary_key=True)

    escena_id = db.Column(
        db.Integer,
        db.ForeignKey("escenas.id"),
        nullable=False
    )

    personaje = db.Column(db.String(50), nullable=False)

    texto = db.Column(db.Text, nullable=False)

    audio_id = db.Column(
        db.Integer,
        db.ForeignKey("recursos_multimedia.id"),
        nullable=True
    )

    evento = db.Column(db.String(100), nullable=False)

    orden = db.Column(db.Integer, nullable=False)

    escena = db.relationship(
        "Escena",
        back_populates="dialogos"
    )

    audio = db.relationship(
        "RecursoMultimedia",
        backref="dialogos"
    )
