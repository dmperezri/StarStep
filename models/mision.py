from extensions import db


class Mision(db.Model):

    __tablename__ = "misiones"

    __table_args__ = (
        db.CheckConstraint(
            "orden > 0",
            name="ck_mision_orden"
        ),
    )

    id = db.Column(db.Integer, primary_key=True)

    nombre = db.Column(db.String(100), nullable=False)

    destino = db.Column(db.String(50), nullable=False)

    descripcion = db.Column(db.Text, nullable=False)

    objetivo = db.Column(db.Text, nullable=False)

    orden = db.Column(
        db.Integer,
        nullable=False,
        unique=True
    )

    artefactos = db.relationship(
        "Artefacto",
        back_populates="mision",
        order_by="Artefacto.id"
    )
