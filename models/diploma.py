from datetime import datetime, timezone
from extensions import db


class Diploma(db.Model):

    __tablename__ = "diplomas"

    __table_args__ = (
        db.CheckConstraint(
            "puntuacion_final >= 0",
            name="ck_diploma_puntuacion"
        ),
    )

    id = db.Column(db.Integer, primary_key=True)

    astronauta_id = db.Column(
        db.Integer,
        db.ForeignKey("astronautas.id"),
        nullable=False,
        unique=True
    )

    codigo = db.Column(
        db.String(50),
        nullable=False,
        unique=True
    )

    titulo = db.Column(
        db.String(100), nullable=False
    )

    puntuacion_final = db.Column(
        db.Integer, nullable=False
    )

    emitido_en = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    astronauta = db.relationship(
        "Astronauta",
        backref=db.backref(
            "diploma", uselist=False
        )
    )
