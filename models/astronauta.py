
from datetime import datetime, timezone
from extensions import db


class Astronauta(db.Model):

    __tablename__ = "astronautas"

    __table_args__ = (
        db.CheckConstraint(
            "rango_edad IN ('8-10', '11-12', '13-14')",
            name="ck_astronauta_rango_edad"
        ),
    )

    id = db.Column(db.Integer, primary_key=True)

    alias = db.Column(
        db.String(50),
        nullable=False
    )

    rango_edad = db.Column(
        db.String(20),
        nullable=False
    )

    avatar_id = db.Column(
        db.Integer,
        db.ForeignKey("avatares.id"),
        nullable=False
    )

    token_acceso_hash = db.Column(
        db.String(255),
        nullable=False,
        unique=True
    )

    creado_en = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    avatar = db.relationship(
        "Avatar",
        back_populates="astronautas"
    )
