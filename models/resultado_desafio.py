from datetime import datetime, timezone
from extensions import db


class ResultadoDesafio(db.Model):

    __tablename__ = "resultados_desafio"

    __table_args__ = (
        db.UniqueConstraint(
            "astronauta_id",
            "desafio_id",
            "numero_intento",
            name="uq_resultado_intento"
        ),
        db.CheckConstraint(
            "numero_intento > 0",
            name="ck_resultado_intento"
        ),
        db.CheckConstraint(
            "puntuacion >= 0",
            name="ck_resultado_puntuacion"
        ),
        db.CheckConstraint(
            "tiempo_empleado >= 0",
            name="ck_resultado_tiempo"
        ),
    )

    id = db.Column(db.Integer, primary_key=True)

    astronauta_id = db.Column(
        db.Integer,
        db.ForeignKey("astronautas.id"),
        nullable=False
    )

    desafio_id = db.Column(
        db.Integer,
        db.ForeignKey("desafios.id"),
        nullable=False
    )

    numero_intento = db.Column(db.Integer, nullable=False)

    puntuacion = db.Column(db.Integer, nullable=False)

    aprobado = db.Column(db.Boolean, nullable=False)

    tiempo_empleado = db.Column(db.Integer, nullable=False)

    realizado_en = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    astronauta = db.relationship(
        "Astronauta",
        backref="resultados_desafios"
    )

    desafio = db.relationship(
        "Desafio",
        back_populates="resultados"
    )
