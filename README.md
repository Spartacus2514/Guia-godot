# Guía Godot

Curso interactivo en HTML para aprender **Godot 4** y **GDScript** lo más rápido posible: poca teoría y muchos retos. Cada lección se supera al completar todos sus retos.

## Cómo verlo

- **En el ordenador**: abre `index.html` en el navegador. No hace falta instalar nada.
- **En el móvil**: publícalo con GitHub Pages (Settings → Pages → Source: *Deploy from a branch* → elige la rama y la carpeta `/ (root)`). En un par de minutos estará en `https://<usuario>.github.io/Guia-godot/`.

## Contenido

**Módulo 1 · Primeros pasos**
1. ¿Qué es Godot? (ordenar pasos, relacionar archivos)
2. La interfaz del editor (misiones sobre una maqueta del editor)
3. Nodos y escenas (árbol de nodos, reto de instanciar escenas)
4. Tu primer script en GDScript (ordenar el script, encontrar el error, simulador de `delta`, reto de la bandera)

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
2. Añade la entrada en `js/curso.js` con el mismo id.

Retos disponibles (todos cuentan para superar la lección):

- **Quiz**: `<div class="quiz" data-respuesta="b">` con `<p class="pregunta">`, botones `<button data-opcion="a">` y `<p class="explicacion">`.
- **Completar código**: `<div class="completar">` con `<input data-respuesta="valor|alternativa">` dentro de un `<pre><code>`.
- **Ordenar**: `<div class="ordenar">` (añade `data-codigo` si son líneas de código) con `<ul class="piezas">` en el orden correcto; se barajan solas.
- **Relacionar**: `<div class="relacionar">` con `<ul class="pares"><li><span>A</span><span>B</span></li>…</ul>`.
- **Encuentra el error**: `<div class="error-codigo" data-linea="N">` con un `<pre><code>` y `<p class="explicacion">`.
- **Reto propio**: cualquier elemento con clase `reto`; llama a `GuiaGodot.resuelto(elemento)` cuando se supere.

Otros elementos: `<pre><code class="gdscript">` (código resaltado con botón de copiar), `.esencial`, `.consejo`, `.aviso`, `.widget`.

El progreso se guarda en el `localStorage` del navegador.
