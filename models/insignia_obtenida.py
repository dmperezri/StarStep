from datetime import datetime, timezone
from extensions import db


class InsigniaObtenida(db.Model):

    __tablename__ = "insignias_obtenidas"

    __table_args__ = (
        db.UniqueConstraint(
            "astronauta_id", "insignia_id",
            name="uq_astronauta_insignia"
        ),
    )

    id = db.Column(db.Integer, primary_key=True)

    astronauta_id = db.Column(
        db.Integer,
        db.ForeignKey("astronautas.id"),
        nullable=False
    )

    insignia_id = db.Column(
        db.Integer,
        db.ForeignKey("insignias.id"),
        nullable=False
    )

    obtenida_en = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    astronauta = db.relationship(
        "Astronauta", backref="insignias_obtenidas"
    )

    insignia = db.relationship(
        "Insignia", back_populates="obtenidas"
    )
