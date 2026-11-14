from extensions import db


class Desafio(db.Model):

    __tablename__ = "desafios"

    __table_args__ = (
        db.UniqueConstraint(
            "mision_id", "orden",
            name="uq_desafio_mision_orden"
        ),
        db.CheckConstraint(
            "orden > 0",
            name="ck_desafio_orden"
        ),
        db.CheckConstraint(
            "puntuacion_maxima > 0",
            name="ck_desafio_maxima"
        ),
        db.CheckConstraint(
            "puntuacion_minima >= 0 AND puntuacion_minima <= puntuacion_maxima",
            name="ck_desafio_minima"
        ),
    )

    id = db.Column(db.Integer, primary_key=True)

    mision_id = db.Column(
        db.Integer,
        db.ForeignKey("misiones.id"),
        nullable=False
    )

    artefacto_id = db.Column(
        db.Integer,
        db.ForeignKey("artefactos.id"),
        nullable=True
    )

    nombre = db.Column(db.String(100), nullable=False)

    tipo = db.Column(db.String(50), nullable=False)

    instrucciones = db.Column(db.Text, nullable=False)

    objetivo = db.Column(db.Text, nullable=False)

    configuracion = db.Column(db.JSON, nullable=True)

    puntuacion_maxima = db.Column(db.Integer, nullable=False)

    puntuacion_minima = db.Column(db.Integer, nullable=False)

    obligatorio = db.Column(
        db.Boolean,
        nullable=False,
        default=True
    )

    orden = db.Column(db.Integer, nullable=False)

    mision = db.relationship(
        "Mision",
        backref=db.backref("desafios", order_by="Desafio.orden")
    )

    artefacto = db.relationship(
        "Artefacto",
        backref="desafios"
    )

    preguntas = db.relationship(
        "Pregunta",
        back_populates="desafio",
        order_by="Pregunta.orden"
    )

    resultados = db.relationship(
        "ResultadoDesafio",
        back_populates="desafio"
    )
