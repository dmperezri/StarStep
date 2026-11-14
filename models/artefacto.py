from extensions import db


class Artefacto(db.Model):

    __tablename__ = "artefactos"

    id = db.Column(db.Integer, primary_key=True)

    mision_id = db.Column(
        db.Integer,
        db.ForeignKey("misiones.id"),
        nullable=False
    )

    nombre = db.Column(db.String(100), nullable=False)

    descripcion = db.Column(db.Text, nullable=False)

    historia = db.Column(db.Text, nullable=False)

    funcion = db.Column(db.Text, nullable=False)

    descubrimiento_cientifico = db.Column(
        db.Text,
        nullable=False
    )

    fecha_mision = db.Column(
        db.Date,
        nullable=True
    )

    estado_historico = db.Column(
        db.Text,
        nullable=False
    )

    fuente_url = db.Column(
        db.String(500),
        nullable=False
    )

    mision = db.relationship(
        "Mision",
        back_populates="artefactos"
    )

    componentes = db.relationship(
        "ComponenteArtefacto",
        back_populates="artefacto",
        order_by="ComponenteArtefacto.orden"
    )
