from datetime import datetime, timezone
from extensions import db


class Progreso(db.Model):

    __tablename__ = "progresos"

    __table_args__ = (
        db.UniqueConstraint(
            "astronauta_id", "mision_id",
            name="uq_progreso_astronauta_mision"
        ),
        db.CheckConstraint(
            "estado IN ('pendiente', 'en_progreso', 'completada')",
            name="ck_progreso_estado"
        ),
        db.CheckConstraint(
            "porcentaje BETWEEN 0 AND 100",
            name="ck_progreso_porcentaje"
        ),
        db.CheckConstraint(
            "puntuacion >= 0",
            name="ck_progreso_puntuacion"
        ),
        db.CheckConstraint(
            "tiempo_jugado >= 0",
            name="ck_progreso_tiempo"
        ),
    )

    id = db.Column(db.Integer, primary_key=True)

    astronauta_id = db.Column(
        db.Integer,
        db.ForeignKey("astronautas.id"),
        nullable=False
    )

    mision_id = db.Column(
        db.Integer,
        db.ForeignKey("misiones.id"),
        nullable=False
    )

    escena_actual_id = db.Column(
        db.Integer,
        db.ForeignKey("escenas.id"),
        nullable=True
    )

    estado = db.Column(
        db.String(30),
        nullable=False,
        default="pendiente"
    )

    porcentaje = db.Column(
        db.Integer, nullable=False, default=0
    )

    puntuacion = db.Column(
        db.Integer, nullable=False, default=0
    )

    tiempo_jugado = db.Column(
        db.Integer, nullable=False, default=0
    )

    iniciado_en = db.Column(
        db.DateTime(timezone=True), nullable=True
    )

    completado_en = db.Column(
        db.DateTime(timezone=True), nullable=True
    )

    actualizado_en = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    astronauta = db.relationship(
        "Astronauta", backref="progresos"
    )

    mision = db.relationship(
        "Mision", backref="progresos"
    )

    escena_actual = db.relationship(
        "Escena", backref="progresos"
    )
