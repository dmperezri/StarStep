from extensions import db


class Escena(db.Model):

    __tablename__ = "escenas"

    __table_args__ = (
        db.CheckConstraint(
            "orden > 0",
            name="ck_escena_orden"
        ),
    )

    id = db.Column(db.Integer, primary_key=True)

    mision_id = db.Column(
        db.Integer,
        db.ForeignKey("misiones.id"),
        nullable=True
    )

    nombre = db.Column(db.String(100), nullable=False)

    tipo = db.Column(db.String(30), nullable=False)

    descripcion = db.Column(db.Text, nullable=False)

    orden = db.Column(
        db.Integer,
        nullable=False,
        unique=True
    )

    configuracion = db.Column(db.JSON, nullable=True)

    mision = db.relationship(
        "Mision",
        backref=db.backref("escenas", order_by="Escena.orden")
    )

    dialogos = db.relationship(
        "Dialogo",
        back_populates="escena",
        order_by="Dialogo.orden"
    )
