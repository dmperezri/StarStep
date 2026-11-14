
from extensions import db


class Avatar(db.Model):

    __tablename__ = "avatares"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    nombre = db.Column(
        db.String(50),
        nullable=False
    )

    imagen = db.Column(
        db.String(255),
        nullable=False
    )

    activo = db.Column(
        db.Boolean,
        nullable=False,
        default=True
    )

    astronautas = db.relationship(
        "Astronauta",
        back_populates="avatar"
    )
