# Mecanismos de Participación Ciudadana

Plataforma educativa interactiva sobre los **mecanismos de participación ciudadana en Colombia**, desarrollada como proyecto de formación del SENA para la **Institución Educativa José Antonio Aguilera**.

El sitio reúne material de aprendizaje, cuestionarios y juegos educativos. Incluye una interfaz web estática y un backend opcional en **Node.js, Express y SQLite** para gestionar perfiles temporales, historial, estadísticas y logros.

---

## 1. Requisitos

- **Node.js 20 o superior**.
- npm (incluido con Node.js).
- Un navegador moderno.

La dependencia `better-sqlite3` requiere Node.js 20 o superior. El proyecto declara ese requisito en `package.json`.

## 2. Instalación y ejecución local

Clona el repositorio o descarga el proyecto. Después, abre una terminal en la carpeta que contiene `package.json` y ejecuta:

```bash
npm ci
npm start
```

Abre [http://localhost:3000](http://localhost:3000).

El servidor entrega tanto la página como la API. No necesitas iniciar un servidor frontend separado para el uso local habitual.

Para comprobar que la API está activa, visita:

```text
http://localhost:3000/api/health
```

La respuesta esperada es:

```json
{"ok":true}
```

Para detener el servidor, pulsa `Ctrl + C` en la terminal.

### Comandos disponibles

| Comando | Función |
|---|---|
| `npm ci` | Instala las dependencias exactas del `package-lock.json`. |
| `npm start` | Inicia el backend y sirve el frontend en el puerto configurado. |
| `npm test` | Ejecuta las pruebas automatizadas del backend. |

No existe un comando `npm run dev` definido en el `package.json` actual.

## 3. Funcionamiento con y sin backend

### Con backend

Es el modo recomendado para utilizar todas las funciones de perfiles. El servidor Node.js:

- Crea y administra perfiles temporales de alumnos.
- Guarda el historial de actividades, estadísticas y logros.
- Registra visitas a los mecanismos.
- Elimina automáticamente los perfiles vencidos y sus datos relacionados.
- Sirve los archivos públicos del frontend.

La base de datos SQLite se crea por defecto en:

```text
server/storage/profiles.sqlite
```

La carpeta `server/` y la base de datos no se exponen como archivos estáticos.

### Sin backend (modo invitado)

El contenido educativo y los juegos pueden utilizarse sin conectar con la API. Si el servidor no está disponible, el alumno puede elegir **«Continuar sin guardar»**.

En ese modo, la identificación y los datos de la sesión se conservan únicamente en la pestaña mediante `sessionStorage`. No se sincronizan con el servidor ni se mantienen como un perfil recuperable.

Para abrir el sitio sin backend también se puede servir la carpeta con un servidor estático, por ejemplo:

```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000`. Al usar un origen distinto, el navegador necesitará que la API esté configurada y autorice ese origen para guardar perfiles.

## 4. Perfiles de alumnos y datos

Los perfiles son **temporales**. No requieren correo electrónico ni contraseña.

- El nombre del alumno es obligatorio: mínimo **3** y máximo **25 caracteres** para perfiles nuevos o cambios de nombre.
- El curso es opcional. Si se indica, debe seguir el formato `número-número` (por ejemplo, `11-3` o `8-6`) y no superar 20 caracteres.
- Los perfiles admiten estas duraciones: 1 h, 2 h, 5 h, 10 h, 12 h, 1, 2, 3, 4 o 5 días. La duración predeterminada es de 5 días.
- La fecha de vencimiento se calcula desde la creación del perfil; la actividad del alumno no reinicia el plazo.
- El navegador guarda un token aleatorio para recuperar el perfil. El servidor conserva su HMAC, no el token en texto plano.
- Cambiar el nombre crea un perfil nuevo y elimina el anterior con sus datos asociados. Cambiar únicamente el curso no reinicia el perfil.
- Cerrar sesión no elimina el perfil; permite recuperarlo desde el mismo navegador mientras siga vigente.
- Eliminar el historial borra las actividades y los logros que dependen de él. Eliminar el perfil borra todos sus datos asociados.

Los perfiles creados con una versión anterior pueden conservar nombres que superen el nuevo máximo de 25 caracteres. Esos perfiles existentes pueden seguir utilizándose y editar el curso; al cambiar el nombre se aplican los límites actuales.

## 5. Configuración del backend

Todas las variables son opcionales salvo que el entorno de despliegue requiera alguna configuración específica. Los valores predeterminados están definidos en `server/src/config.js`.

| Variable | Función | Valor predeterminado / notas |
|---|---|---|
| `PORT` | Puerto HTTP/HTTPS del servidor. | `3000` |
| `HOST` | Dirección de escucha. | `0.0.0.0` |
| `DB_PATH` | Ruta de la base de datos SQLite. | `server/storage/profiles.sqlite` |
| `CLEANUP_INTERVAL_MS` | Intervalo de limpieza de perfiles vencidos. | `60000` (1 minuto) |
| `NODE_ENV` | En `production` activa HTTPS obligatorio, salvo que `FORCE_HTTPS=0`. | No definido por defecto. |
| `FORCE_HTTPS` | Fuerza la redirección HTTPS (`1`) o la desactiva (`0`). | Se deriva de `NODE_ENV`. |
| `TLS_KEY` | Ruta del certificado/clave privada para HTTPS directo. | Vacío |
| `TLS_CERT` | Ruta del certificado para HTTPS directo. | Vacío |
| `TRUST_PROXY` | Configura la confianza en el proxy inverso que termina HTTPS. | Vacío |
| `CORS_ORIGIN` | Lista de orígenes autorizados para llamar a la API desde otro dominio, separados por comas. | Vacío: mismo origen. |
| `TOKEN_PEPPER` | Secreto utilizado para generar los HMAC de los tokens. | Si no se define, se crea un archivo `.pepper` junto a la base de datos. |
| `RATE_API` | Límite de peticiones a la API por IP y minuto. | `600` |
| `RATE_CREATE` | Límite de creación de perfiles por IP en 10 minutos. | `120` |

### Persistencia y secreto `.pepper`

El hosting del backend debe ofrecer almacenamiento persistente para SQLite. Configura `DB_PATH` para apuntar al volumen persistente. Mantén **una sola instancia** del backend cuando se utiliza SQLite como archivo local.

Define `TOKEN_PEPPER` como secreto persistente en el entorno o conserva el archivo `.pepper` generado junto a la base de datos. Si se pierde o cambia ese secreto, los tokens existentes ya no podrán validarse y los perfiles guardados dejarán de ser recuperables.

No subas al repositorio bases de datos, archivos `.pepper`, claves privadas, certificados ni archivos `.env` con secretos. El `.gitignore` del proyecto excluye estos elementos.

## 6. Despliegue

El proyecto puede funcionar localmente con un solo servidor Node.js que entrega frontend y API. Para separar el frontend y el backend (por ejemplo, frontend en Netlify y API en otro servicio Node.js), configura ambos lados:

1. En `js/config.js`, asigna a `PRODUCCION` la URL HTTPS pública del backend, sin barra final.
2. En el backend, define `CORS_ORIGIN` con el origen exacto del frontend, por ejemplo `https://tu-sitio.netlify.app`. Para varios orígenes, sepáralos por comas.
3. Asegura que el backend utilice HTTPS. Si el proxy inverso termina TLS, configura `NODE_ENV=production` y `TRUST_PROXY=1` según el proveedor.
4. Configura `DB_PATH` en un volumen persistente y conserva `TOKEN_PEPPER` o el archivo `.pepper`.
5. Usa Node.js 20 o superior y ejecuta `npm start`. El proveedor normalmente asigna el puerto mediante `PORT`.
6. Configura copias de seguridad periódicas del archivo SQLite.

`js/config.js` detecta automáticamente el entorno local (`localhost`, `127.x.x.x` y `file:`). También permite definir `window.RC_API_BASE` antes de cargar el archivo; esa variable tiene prioridad.

Si `PRODUCCION` queda vacío y el frontend se aloja en otro dominio, la página seguirá mostrando el contenido, pero no podrá crear ni recuperar perfiles en el backend remoto.

**Nota:** el despliegue real depende de la configuración del proveedor de hosting. La configuración descrita no sustituye las pruebas de conexión, CORS, HTTPS y persistencia en el entorno de producción.

## 7. Contenido y funcionalidades

### Aprender

La sección de aprendizaje presenta los mecanismos de participación ciudadana, información general, marco normativo, comparativas, casos prácticos y glosario. Los datos de los mecanismos están separados de los componentes de interfaz.

### Quiz

Incluye cuestionarios de opción múltiple y preguntas abiertas, con modos de alumno y maestro, configuración de dificultad y cantidad de preguntas, temporizador y resultados. Las respuestas abiertas son de revisión manual; no se califican mediante inteligencia artificial.

### Juegos

La plataforma incluye estas actividades:

- Crucigrama.
- Relacionar mecanismos y conceptos.
- Sopa de letras.
- ¿Qué harías en esta situación?
- Memoria de conceptos.
- Ruleta de preguntas.

Los juegos tienen flujo de alumno/maestro, configuración y pantalla de resultados. La identificación del alumno se utiliza para rotular los resultados y asociarlos al perfil cuando el backend está disponible; no equivale a una cuenta con contraseña ni a autenticación personal fuerte.

### Configuración

La página de configuración agrupa cuenta y sesión, apariencia, idioma, historial, accesibilidad, estadísticas, logros y privacidad. Las preferencias de apariencia, idioma y accesibilidad se almacenan localmente en el navegador; los datos del perfil y su actividad se guardan en SQLite cuando se utiliza el backend.

### Idiomas

La interfaz ofrece español, inglés, ruso, portugués y francés. La disponibilidad de traducción del contenido educativo puede variar según la sección; parte del material y de los bancos de preguntas y juegos permanece en español.

## 8. Estructura del proyecto

```text
.
├── index.html
├── pages/                 # Aprender, quiz, juegos, configuración y actividades
├── css/                   # Estilos por componente y responsabilidad
├── js/                    # Interfaz, configuración, perfiles y lógica de juegos
│   ├── components/
│   ├── i18n/
│   ├── quiz/
│   ├── crossword/
│   ├── matching/
│   ├── wordsearch/
│   ├── situations/
│   ├── memory/
│   ├── roulette/
│   └── minigames/
├── data/                  # Mecanismos, preguntas, idiomas y datos de juegos
├── assets/                # Imágenes, iconos y logotipo institucional
├── server/
│   ├── server.js          # Arranque del servidor
│   ├── src/               # API, SQLite, perfiles, estadísticas y logros
│   ├── test/              # Pruebas del backend
│   └── storage/           # Base de datos local (no se versiona)
├── tests/                 # Pruebas de interfaz y regresión
├── tools/                 # Herramientas para generar distribuciones de crucigramas
├── package.json
├── package-lock.json
└── README.md
```

### Dónde modificar contenido

- **Mecanismos:** `data/mecanismos/`.
- **Información general y marco normativo:** `data/general/info-general.js`.
- **Preguntas de opción múltiple:** `data/preguntas/`.
- **Preguntas abiertas:** `data/preguntas-abiertas/`.
- **Crucigramas:** `data/crossword/` y `tools/` para generar distribuciones.
- **Relacionar:** `data/matching/`.
- **Sopa de letras:** `data/wordsearch/`.
- **Situaciones:** `data/situations/`.
- **Memoria:** `data/memory/`.
- **Ruleta:** `data/roulette/`.
- **Colores, tipografía y variables visuales:** `css/variables.css` y `css/themes.css`.
- **Textos de interfaz por idioma:** `js/i18n/lang/`.

Procura mantener los datos educativos separados de la lógica de interfaz. Antes de modificar un componente compartido, revisa qué páginas y juegos lo utilizan.

## 9. Pruebas

### Backend

Desde la raíz del proyecto:

```bash
npm test
```

Las pruebas del backend están en `server/test/api.test.js`.

### Interfaz y regresión

La carpeta `tests/` contiene pruebas de navegador con Chromium y herramientas auxiliares. Consulta `tests/README.md` para conocer las dependencias y los comandos de cada suite. Estas pruebas requieren instalar sus dependencias de prueba por separado; no forman parte de `npm ci` del backend.

Después de modificar código, ejecuta las pruebas pertinentes y comprueba manualmente las páginas afectadas en escritorio y móvil. No des por validado un despliegue remoto hasta probarlo en el hosting real.

## 10. Privacidad y seguridad

- Los perfiles no utilizan correo electrónico ni contraseña.
- El nombre, el curso y la actividad del perfil se guardan temporalmente en el backend cuando se crean perfiles registrados.
- El navegador conserva un token de recuperación en `localStorage`; el servidor almacena su HMAC.
- Los perfiles vencen según la duración seleccionada y la limpieza automática elimina sus datos relacionados.
- El modo invitado conserva los datos únicamente en la sesión local del navegador.
- La identificación del alumno sirve para asociar resultados; no debe considerarse un sistema de autenticación de identidad.
- No publiques la base de datos, el secreto `.pepper`, credenciales ni claves privadas.

## 11. Créditos

Proyecto educativo desarrollado para la **Institución Educativa José Antonio Aguilera**, en el marco de un proyecto de formación del **SENA** sobre Mecanismos de Participación Ciudadana en Colombia.
