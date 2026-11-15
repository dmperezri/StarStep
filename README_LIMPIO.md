# StarStep — Capítulo 1: Rock & Roll

**Origen:** copia limpia derivada exclusivamente de `StarStep (4).zip`, suministrado el 14 de noviembre de 2026.

## Qué contiene

Proyecto completo de Flask, plantillas, frontend, archivos gráficos de NASA, modelos, migraciones, visor Three.js local y juego lunar. No incluye el historial `.git`, `.venv`, archivos de caché ni `starstep.db`, para no distribuir datos ni entornos personales.

## Instalación en Windows

1. Conservá un respaldo de `C:\StarStep` antes de copiar o mezclar archivos.
2. Extraé este ZIP a una carpeta nueva, por ejemplo `C:\StarStep-Limpio`.
3. Abrí PowerShell en esa carpeta, activá un entorno virtual y ejecutá:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

4. Abrí http://127.0.0.1:5000/
5. Verificá http://127.0.0.1:5000/api/health y ejecutá `python -m unittest discover -s tests -p test_rutas_starstep.py`.

## Rutas principales

| Ruta | Pantalla |
|---|---|
| `/` | Inicio y LITO |
| `/astronauta` | Registro/avatares |
| `/despegue` | Despegue |
| `/luna` | Exploración lunar |
| `/marte` | Opportunity |
| `/huellas` | Acto III |
| `/bitacora` | Colección y certificado |
| `/archivo-nasa` | Archivo científico |
| `/api/health` | Diagnóstico de API |
| `/diagnostico` | Diagnóstico HTML |

## Qué se corrigió en esta copia

- Enlaces internos escritos directamente reemplazados por `url_for()` de Flask.
- Portada: utiliza la imagen del logo que compartiste en vez de recrear un logotipo con texto HTML.
- Cambiar ES/EN antes de comenzar la narración ahora actualiza el mensaje inicial.
- Se consolidaron overrides CSS duplicados al final de `style.css`, con diseño adaptable 16:9.
- Se omitió `templates/base.html` porque estaba vacío y no era utilizado por ninguna plantilla.
- Se agregó una prueba automatizada de rutas.

## Importante — limitaciones

- **No se probó Flask en este entorno:** faltan sus dependencias instaladas y no fue posible descargarlas. La prueba de rutas se incluye para que la ejecutes en tu entorno `.venv`.
- El módulo de juego lunar, los modelos de datos y las migraciones se conservaron sin modificación.
- La aplicación aún mantiene dos vías de persistencia: `sqlite3` para `players` y SQLAlchemy para los modelos del equipo. No ejecutar migraciones contra una base con datos sin respaldo.
- El visor incluye implementaciones alternativas; no se eliminaron porque primero deben medirse sus dependencias.
- No se garantiza que todos los minijuegos de la propuesta oficial estén terminados.
- El logo se incorporó **sin alterar** la imagen de referencia aportada; es una captura con fondo negro y no un sprite transparente oficial.

## Git

Esta copia no lleva `.git`. Para integrar a una rama existente, compará los archivos y copiá únicamente los cambios que aprueben. No sustituyás automáticamente la carpeta de tu repositorio.
