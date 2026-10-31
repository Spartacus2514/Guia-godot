# Guía Godot

Curso interactivo en HTML para aprender **Godot 4** y **GDScript** desde cero construyendo un juego de granja en 3D (estilo Harvest Moon): poca teoría y muchos retos. Cada lección se supera al completar todos sus retos.

## Cómo verlo

- **En el ordenador**: abre `index.html` en el navegador. No hace falta instalar nada.
- **En el móvil**: publícalo con GitHub Pages (Settings → Pages → Source: *Deploy from a branch* → elige la rama y la carpeta `/ (root)`). En un par de minutos estará en `https://<usuario>.github.io/Guia-godot/`.

## Contenido

El temario completo (9 módulos, 52 lecciones) está en [PLAN.md](PLAN.md). Lecciones disponibles:

**Módulo 1 · Primeros pasos en 3D**
1. ¿Qué es Godot?
2. El editor y el visor 3D
3. Nodos y escenas en 3D
4. Tu primer script en GDScript

**Módulo 2 · GDScript desde cero**
5. Variables y tipos
6. Condiciones: if, elif, else
7. Funciones
8. Arrays y bucles
9. Diccionarios
10. Vector3: posiciones en 3D
11. Señales
12. Examen del módulo 2

## Estructura

```
index.html          Portada con el índice y el progreso
css/estilos.css     Estilos de todo el curso
js/curso.js         Índice del curso (módulos y lecciones)
js/app.js           Progreso, navegación, quizzes, ejercicios y resaltado de GDScript
lecciones/*.html    Una página por lección
```

## Añadir una lección

1. Copia una lección de `lecciones/` y cambia el atributo `data-leccion` del `<body>` por un id nuevo.
2. En `js/curso.js`, añade `archivo` a la entrada con ese id (las que no tienen `archivo` salen como «Próximamente»).

Retos disponibles (todos cuentan para superar la lección):

- **Quiz**: `<div class="quiz" data-respuesta="b">` con `<p class="pregunta">`, botones `<button data-opcion="a">` y `<p class="explicacion">`.
- **Completar código**: `<div class="completar">` con `<input data-respuesta="valor|alternativa">` dentro de un `<pre><code>`.
- **Ordenar**: `<div class="ordenar">` (añade `data-codigo` si son líneas de código) con `<ul class="piezas">` en el orden correcto; se barajan solas.
- **Relacionar**: `<div class="relacionar">` con `<ul class="pares"><li><span>A</span><span>B</span></li>…</ul>`.
- **Encuentra el error**: `<div class="error-codigo" data-linea="N">` con un `<pre><code>` y `<p class="explicacion">`.
- **Paso a paso**: `<div class="paso-a-paso">` con un `<pre><code>` y un `<script type="application/json">` con los pasos (`l` línea, `v` variables, `s` salida, `n` explicación); se supera al llegar al final.
- **Hazlo en tu juego**: `<div class="en-tu-juego"><ul><li>Paso…</li></ul></div>`; se supera al marcar todos los pasos.
- **Reto propio**: cualquier elemento con clase `reto`; llama a `GuiaGodot.resuelto(elemento)` cuando se supere.

Otros elementos: `<pre><code class="gdscript">` (código resaltado con botón de copiar), `.esencial`, `.consejo`, `.aviso`, `.widget`.

El progreso se guarda en el `localStorage` del navegador.
