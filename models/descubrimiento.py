from datetime import datetime, timezone
from sqlalchemy.ext.mutable import MutableList
from extensions import db


class Descubrimiento(db.Model):

    __tablename__ = "descubrimientos"

    __table_args__ = (
        db.UniqueConstraint(
            "astronauta_id", "artefacto_id",
            name="uq_descubrimiento_astronauta_artefacto"
        ),
    )

    id = db.Column(db.Integer, primary_key=True)

    astronauta_id = db.Column(
        db.Integer,
        db.ForeignKey("astronautas.id"),
        nullable=False
    )

    artefacto_id = db.Column(
        db.Integer,
        db.ForeignKey("artefactos.id"),
        nullable=False
    )

    inspeccionado = db.Column(
        db.Boolean,
        nullable=False,
        default=False
    )

    componentes_revisados = db.Column(
        MutableList.as_mutable(db.JSON),
        nullable=False,
        default=list
    )

    descubierto_en = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    astronauta = db.relationship(
        "Astronauta", backref="descubrimientos"
    )

    artefacto = db.relationship(
        "Artefacto", backref="descubrimientos"
    )
