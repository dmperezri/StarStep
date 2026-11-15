"""Pruebas de humo de las rutas Flask existentes.

Ejecutar desde la raíz del repositorio con el entorno virtual activado:

    python -m unittest tests.test_rutas -v

No modifica starstep.db: las pruebas de API usan una base temporal.
(Importar app.py ejecuta ensure_db(), que solo hace CREATE TABLE IF NOT EXISTS.)
"""

import importlib
import json
import re
import tempfile
import unittest
from pathlib import Path

try:
    import flask_sqlalchemy  # noqa: F401
    import flask_migrate  # noqa: F401
    DEPENDENCIAS = True
except ImportError:  # pragma: no cover - depende del entorno
    DEPENDENCIAS = False


@unittest.skipUnless(DEPENDENCIAS, "Requiere las dependencias de requirements.txt")
class RutasExistentes(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.modulo = importlib.import_module("app")
        cls.temporal = tempfile.TemporaryDirectory()
        cls.original_db = cls.modulo.LOCAL_DB_FILE
        cls.modulo.LOCAL_DB_FILE = Path(cls.temporal.name) / "players_prueba.db"
        cls.modulo.ensure_db()
        cls.modulo.app.config.update(TESTING=True)
        cls.cliente = cls.modulo.app.test_client()

    @classmethod
    def tearDownClass(cls):
        cls.modulo.LOCAL_DB_FILE = cls.original_db
        cls.temporal.cleanup()

    def test_paginas_responden(self):
        for ruta in ["/", "/astronauta", "/capitulos", "/rock-roll", "/despegue", "/vuelo", "/luna", "/marte",
                     "/huellas", "/bitacora", "/archivo-nasa", "/diagnostico"]:
            with self.subTest(ruta=ruta):
                respuesta = self.cliente.get(ruta)
                self.assertEqual(respuesta.status_code, 200)

    def test_paginas_de_juego_cargan_el_controlador(self):
        for ruta in ["/", "/astronauta", "/capitulos", "/rock-roll", "/despegue", "/vuelo", "/luna", "/marte", "/huellas", "/bitacora"]:
            with self.subTest(ruta=ruta):
                html = self.cliente.get(ruta).get_data(as_text=True)
                pos_progreso = html.find("js/progreso.js")
                pos_definicion = html.find("js/flujo-definicion.js")
                pos_flujo = html.find("js/flujo.js")
                self.assertTrue(0 <= pos_progreso < pos_definicion < pos_flujo,
                                "flujo.js debe cargarse después de progreso.js y de la definición")

    def test_archivos_estaticos_del_flujo(self):
        for archivo in ["js/flujo.js", "js/flujo-definicion.js", "js/progreso.js", "js/visor3d.js", "js/vuelo-motor.js", "js/vuelo.js"]:
            with self.subTest(archivo=archivo):
                respuesta = self.cliente.get("/static/" + archivo)
                self.assertEqual(respuesta.status_code, 200)
                respuesta.close()

    def test_enlaces_al_archivo_declaran_su_procedencia(self):
        # Fase 1.1: el archivo NASA decide su botón de regreso con ?desde=<origen>.
        for ruta, origen in [("/", "menu"), ("/bitacora", "bitacora"), ("/marte", "marte")]:
            with self.subTest(ruta=ruta):
                html = self.cliente.get(ruta).get_data(as_text=True)
                self.assertIn('href="/archivo-nasa?desde=%s"' % origen, html)
                self.assertNotIn('href="/archivo-nasa"', html)

    def test_archivo_regresa_al_menu_por_defecto_y_no_carga_el_progreso(self):
        for consulta in ["", "?desde=menu", "?desde=bitacora", "?desde=https://ejemplo.com", "?desde=%22%3E%3Cscript%3E"]:
            with self.subTest(consulta=consulta):
                respuesta = self.cliente.get("/archivo-nasa" + consulta)
                self.assertEqual(respuesta.status_code, 200)
                html = respuesta.get_data(as_text=True)
                # El servidor no refleja el parámetro: el destino lo valida archivo-nasa.js.
                self.assertIn('id="archiveBack" href="/" data-i18n="science.back.menu"', html)
                self.assertNotIn("ejemplo.com", html)
                self.assertNotIn("<script>", html)
                for script in ["js/progreso.js", "js/flujo.js", "js/flujo-definicion.js"]:
                    self.assertNotIn(script, html, "consultar el archivo no toca el progreso")
                self.assertIn("js/archivo-nasa.js", html)

    def test_portada_ofrece_nueva_partida_con_confirmacion(self):
        html = self.cliente.get("/").get_data(as_text=True)
        # Independiente del formato de la plantilla (atributos en una o varias líneas).
        boton = re.search(r'<button\s[^>]*\bid="newGame"[^>]*>', html)
        self.assertIsNotNone(boton)
        self.assertIn('data-i18n="newgame.button"', boton.group(0))
        self.assertRegex(boton.group(0), r"\shidden\b", "oculto por defecto")
        self.assertIn('id="newGameDialog"', html)
        self.assertIn('id="newGameConfirm"', html)
        self.assertIn('id="newGameCancel"', html)

    def test_portada_carga_la_secuencia_de_entrada(self):
        html = self.cliente.get("/").get_data(as_text=True)
        pos_flujo = html.find("js/flujo.js")
        pos_main = html.find("js/main.js")
        pos_intro = html.find("js/intro-secuencia.js")
        self.assertTrue(0 <= pos_flujo < pos_main < pos_intro,
                        "intro-secuencia.js debe cargarse después de flujo.js y main.js")
        for elemento in ["introSplash", "introLanguage", "introHistory", "introCanvas", "replayIntro"]:
            self.assertIn('id="%s"' % elemento, html)
        respuesta = self.cliente.get("/static/js/intro-secuencia.js")
        self.assertEqual(respuesta.status_code, 200)
        respuesta.close()

    def test_salud(self):
        datos = self.cliente.get("/api/health").get_json()
        self.assertEqual(datos["status"], "ok")

    def test_api_progreso_valida_identificador(self):
        self.assertEqual(self.cliente.get("/api/progreso").status_code, 400)
        self.assertEqual(self.cliente.get("/api/progreso?id=corto").status_code, 400)
        respuesta = self.cliente.post("/api/progreso", json={"id": "guest-prueba0001", "alias": "ARIEL", "avatar": "vice"})
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.get_json()["alias"], "ARIEL")
        respuesta = self.cliente.post("/api/progreso", json={"id": "guest-prueba0001", "alias": "A", "avatar": "vice"})
        self.assertEqual(respuesta.status_code, 400)

    def test_api_descubrimiento_comportamiento_actual(self):
        # Documenta el comportamiento ACTUAL (Fase 2 debe endurecerlo):
        # el servidor acepta el artefacto sin verificar inspección.
        self.assertEqual(self.cliente.post("/api/descubrimiento", json={"id": "guest-prueba0002", "artifact": "inventado"}).status_code, 400)
        datos = self.cliente.post("/api/descubrimiento", json={"id": "guest-prueba0002", "artifact": "eagle"}).get_json()
        self.assertIn("eagle", datos["artifacts"])

    def test_api_bitacora_no_acepta_actos_desconocidos(self):
        datos = self.cliente.post("/api/bitacora", json={"id": "guest-prueba0003", "notes": "hola", "completed": ["luna", "hackeado"]}).get_json()
        self.assertEqual(datos["completed"], ["luna"])
        self.assertEqual(json.loads(json.dumps(datos))["notes"], "hola")


if __name__ == "__main__":
    unittest.main()
