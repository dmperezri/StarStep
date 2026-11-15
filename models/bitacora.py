from datetime import datetime, timezone
from extensions import db


class Bitacora(db.Model):

    __tablename__ = "bitacoras"

    __table_args__ = (
        db.CheckConstraint(
            "tipo IN ('manual', 'automatica')",
            name="ck_bitacora_tipo"
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

    artefacto_id = db.Column(
        db.Integer,
        db.ForeignKey("artefactos.id"),
        nullable=True
    )

    titulo = db.Column(
        db.String(100), nullable=False
    )

    contenido = db.Column(
        db.Text, nullable=False
    )

    tipo = db.Column(
        db.String(30), nullable=False
    )

    creado_en = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    actualizado_en = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    astronauta = db.relationship(
        "Astronauta", backref="bitacoras"
    )

    mision = db.relationship(
        "Mision", backref="bitacoras"
    )

    artefacto = db.relationship(
        "Artefacto", backref="bitacoras"
    )
