from extensions import db


class Pregunta(db.Model):

    __tablename__ = "preguntas"

    __table_args__ = (
        db.UniqueConstraint(
            "desafio_id", "orden",
            name="uq_pregunta_desafio_orden"
        ),
        db.CheckConstraint(
            "puntuacion >= 0",
            name="ck_pregunta_puntuacion"
        ),
        db.CheckConstraint(
            "orden > 0",
            name="ck_pregunta_orden"
        ),
    )

    id = db.Column(db.Integer, primary_key=True)

    desafio_id = db.Column(
        db.Integer,
        db.ForeignKey("desafios.id"),
        nullable=False
    )

    enunciado = db.Column(db.Text, nullable=False)

    opciones = db.Column(db.JSON, nullable=False)

    respuesta_correcta = db.Column(
        db.String(255),
        nullable=False
    )

    explicacion = db.Column(db.Text, nullable=False)

    puntuacion = db.Column(db.Integer, nullable=False)

    orden = db.Column(db.Integer, nullable=False)

    desafio = db.relationship(
        "Desafio",
        back_populates="preguntas"
    )
