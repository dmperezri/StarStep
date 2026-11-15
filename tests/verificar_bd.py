from app import app
from extensions import db
from sqlalchemy import inspect, text
from sqlalchemy.orm import configure_mappers


def verificar():

    with app.app_context():

        configure_mappers()

        inspector = inspect(db.engine)

        esperadas = set(db.metadata.tables.keys())
        existentes = set(inspector.get_table_names())
        existentes.discard("alembic_version")

        assert len(esperadas) == 19, "Cantidad incorrecta"
        assert esperadas == existentes, (
            f"Faltantes: {esperadas - existentes}; "
            f"Adicionales: {existentes - esperadas}"
        )

        total_columnas = 0
        total_relaciones = 0

        for tabla in sorted(esperadas):

            columnas = inspector.get_columns(tabla)
            relaciones = inspector.get_foreign_keys(tabla)

            nombres_sql = {c["name"] for c in columnas}
            nombres_modelo = set(
                db.metadata.tables[tabla].columns.keys()
            )

            assert nombres_sql == nombres_modelo, (
                f"Columnas incorrectas en {tabla}"
            )

            total_columnas += len(columnas)
            total_relaciones += len(relaciones)

            print(f"[OK] {tabla}: {len(columnas)} columnas")

        claves_activas = db.session.execute(
            text("PRAGMA foreign_keys")
        ).scalar()

        assert claves_activas == 1, (
            "Claves foraneas desactivadas"
        )

        errores = db.session.execute(
            text("PRAGMA foreign_key_check")
        ).fetchall()

        assert not errores, (
            f"Errores de integridad: {errores}"
        )

        assert total_columnas == 135

        print("\n=== RESULTADOS ===")
        print("Tablas:", len(existentes))
        print("Columnas:", total_columnas)
        print("Claves foraneas:", total_relaciones)
        print("Integridad referencial: OK")
        print("Estructura verificada correctamente")


if __name__ == "__main__":
    verificar()
