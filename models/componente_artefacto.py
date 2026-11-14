from extensions import db


class ComponenteArtefacto(db.Model):

    __tablename__ = "componentes_artefacto"

    __table_args__ = (
        db.UniqueConstraint(
            "artefacto_id",
            "nodo_3d",
            name="uq_componente_nodo"
        ),
        db.UniqueConstraint(
            "artefacto_id",
            "orden",
            name="uq_componente_orden"
        ),
        db.CheckConstraint(
            "orden > 0",
            name="ck_componente_orden"
        ),
    )

    id = db.Column(db.Integer, primary_key=True)

    artefacto_id = db.Column(
        db.Integer,
        db.ForeignKey("artefactos.id"),
        nullable=False
    )

    nombre = db.Column(db.String(100), nullable=False)

    descripcion = db.Column(db.Text, nullable=False)

    funcion = db.Column(db.Text, nullable=False)

    nodo_3d = db.Column(
        db.String(100),
        nullable=False
    )

    posicion_x = db.Column(db.Float, nullable=True)

    posicion_y = db.Column(db.Float, nullable=True)

    posicion_z = db.Column(db.Float, nullable=True)

    orden = db.Column(db.Integer, nullable=False)

    artefacto = db.relationship(
        "Artefacto",
        back_populates="componentes"
    )
