# Plan del curso

## Objetivo

Aprender Godot 4 y GDScript **desde cero** (primer lenguaje de programación) construyendo un juego de granja en 3D estilo Harvest Moon, con granja, minería, combate, NPCs y eventos.

## Enfoque

- **Fase 1 · La base**: solo los conceptos que usa *todo* el juego. Al terminarla, el granjero camina por un mundo 3D e interactúa con objetos.
- **Fase 2 · Los sistemas de tu juego**: cada sistema introduce **solo el concepto nuevo que necesita, justo cuando lo necesita**. El orden importa: primero los sistemas que enseñan ideas que luego reutilizan los demás (los estados del cultivo preparan la máquina de estados del enemigo; el reloj prepara los eventos).

## Reglas de cada lección

1. **Primero se explica, después se pregunta.** Ningún reto pregunta algo que no se haya explicado antes en la página. Si a propósito se pide adivinar algo nuevo, el quiz lleva `data-tipo="adivina"` y lo avisa.
1. **Una idea** por lección, de 5 a 10 minutos.
2. **Lo esencial** en 3 a 5 líneas, sin relleno.
3. **De 3 a 5 retos** interactivos (quiz, ordenar, relacionar, encontrar el error, completar código o un widget propio).
4. **🌾 Hazlo en tu juego**: una lista de pasos que hace avanzar el proyecto real.
5. Todos los ejemplos son de la granja: dinero, energía, cultivos, vacas, rocas, enemigos…
6. Cada módulo de la fase 1 acaba con un **examen** que mezcla todo.

## Herramientas fijas

- **Repaso** (`lecciones/repaso.html`): repetición espaciada con preguntas de las lecciones superadas (banco en `js/repaso-datos.js`, unas 5 por lección). Cada lección nueva debe añadir sus preguntas.
- **Chuleta y glosario** (`lecciones/chuleta.html`): toda la sintaxis aprendida, errores frecuentes traducidos y términos en inglés. Cada lección nueva debe añadir lo suyo.

## Fase 1 · La base

### Módulo 1 · Primeros pasos en 3D ✅
| Lección | Concepto | En tu juego |
|---|---|---|
| ¿Qué es Godot? | Motor, proyecto, tipos de archivo | Proyecto abierto y carpetas ordenadas |
| El editor y el visor 3D | Paneles, navegar en 3D, mover/rotar/escalar, F5/F6 | Te mueves con soltura por tus escenas |
| Nodos y escenas en 3D | Nodo, árbol, escena, instanciar, luz y cámara | `granja.tscn` con suelo, sol y cámara |
| Tu primer script | `extends`, `_ready`, `_process`, `delta`, ejes X/Y/Z | Un objeto que gira en la granja |
| Examen del módulo 1 | Repaso mezclado | Comprobar que `granja.tscn` está completa |

### Módulo 2 · GDScript desde cero ✅
| Lección | Concepto | En tu juego |
|---|---|---|
| Variables y tipos | `int`, `float`, `bool`, `String`, tipado, `const`, `@export` | `dinero`, `energia` y `nombre_granja` editables en el Inspector |
| Condiciones | `if`/`elif`/`else`, comparaciones, `and`/`or`/`not` | ¿Tengo dinero para comprar la semilla? |
| Funciones | Parámetros, `return`, funciones propias | `gastar_energia(cantidad)`, `puede_comprar(precio)` |
| Arrays y bucles | `Array`, `for`, `while`, `range` | Regar todos los cultivos de una lista |
| Diccionarios | `Dictionary`, claves y valores, recorrerlos | El inventario: `{"nabo": 3, "patata": 5}` |
| Vector3 | Posiciones, direcciones, distancia, `normalized()` | ¿Está la vaca cerca del granjero? |
| Señales | `signal`, `emit`, conectar en el editor y por código | `cultivo_listo` avisa cuando algo se puede cosechar |
| Cuando algo falla | Tipos de error, leer mensajes, `print` espía, puntos de ruptura | Provocar y arreglar errores en tu script |
| Examen del módulo 2 | Repaso mezclado | Un script de granja con todo lo aprendido |

### Módulo 3 · El granjero ✅
| Lección | Concepto | En tu juego |
|---|---|---|
| Controles | Mapa de entrada, `is_action_pressed`/`just_pressed`, `Input.get_vector`, `Vector2`, `:=` | Acciones `mover_*`, `interactuar`, `usar_herramienta` |
| Caminar | `CharacterBody3D`, `velocity`, `move_and_slide`, `_physics_process`, gravedad, colisiones | El granjero camina y no atraviesa vallas |
| La cámara | `SpringArm3D` + `Camera3D`, `@onready`, `Input.get_axis`, radianes | Cámara estilo Harvest Moon que sigue al granjero y gira con Q/R |
| Moverse según la cámara y girar el modelo | `rotated`, `atan2`, `lerp`, `lerp_angle`, girar solo el modelo | W siempre va al fondo de la pantalla; el modelo mira hacia donde camina |
| Animaciones | Importar `.glb`, `AnimationPlayer`, `play`, bucle, nombres exactos | El granjero anima quieto/caminar |
| Interactuar | `RayCast3D`, `has_method`, grupos | Pulsar E delante del buzón y que responda |
| Examen del módulo 3 | Repaso mezclado | **Hito 1**: el granjero completo (`granjero.gd` comprobado en Godot 4.7.2) |

## Fase 2 · Los sistemas de tu juego

### Módulo 4 · La granja
| Lección | Concepto | En tu juego |
|---|---|---|
| La cuadrícula | Posición del mundo ↔ casilla, `floor`, `GridMap` | Saber sobre qué casilla está el granjero |
| Estados de la casilla | `enum`, diccionario de casillas | Césped → arada → regada |
| Azada y regadera | Herramienta actual, actuar sobre la casilla de delante | Arar y regar |
| Cultivos por fases | Escena de cultivo, `match`, crecimiento | Semilla → brote → listo |
| Datos con Resource | `Resource`, `.tres`, `@export` | Cada cultivo con sus días, precio y modelos |
| Cosechar | Quitar nodos, sumar al inventario | Cosechar y guardar en el inventario |

### Módulo 5 · Tiempo, inventario y economía
| Lección | Concepto | En tu juego |
|---|---|---|
| El reloj | Autoload (singleton), `Timer` | Hora, día, estación y año |
| Un día nuevo | Señales globales | Los cultivos crecen al empezar el día |
| Día y noche | Animar `DirectionalLight3D` y `WorldEnvironment` | El cielo cambia con la hora |
| Inventario | Resource de objeto (`ItemData`), ranuras | Inventario con iconos y cantidades |
| Interfaz | `Control`, contenedores, `Label`, `TextureRect` | HUD con hora, dinero y barra de herramientas |
| Energía y dormir | Estadísticas, desmayo, pasar el día | Dormir en la cama para empezar otro día |
| Tienda y caja de envío | Comprar y vender, ventanas de UI | Tienda de semillas y venta de cosechas |

### Módulo 6 · Minería
| Lección | Concepto | En tu juego |
|---|---|---|
| Cambiar de escena | `change_scene_to_file`, datos persistentes en autoloads | Entrar y salir de la mina |
| Rocas y minerales | Vida de objetos, golpear con herramienta, Resource de minerales | Picar rocas y obtener minerales |
| Niveles aleatorios | `RandomNumberGenerator`, semillas, `PackedScene.instantiate()` | Cada piso es distinto |
| Pisos y botín | Escaleras, probabilidades, tablas de botín | Bajar pisos y encontrar tesoros |

### Módulo 7 · Combate
| Lección | Concepto | En tu juego |
|---|---|---|
| Componente de vida | Componentes como nodos hijos, reutilizar | El mismo nodo de vida para el granjero, las rocas y los enemigos |
| Hitbox y hurtbox | `Area3D`, capas y máscaras de colisión | Detectar golpes |
| El ataque | Animación + ventana de golpe, armas | El granjero ataca con la espada |
| Estados del enemigo | Máquina de estados con `enum` + `match` | Patrullar → perseguir → atacar → morir |
| Navegación | `NavigationRegion3D`, `NavigationAgent3D` | Los enemigos te persiguen esquivando obstáculos |
| Daño y botín | Retroceso, invulnerabilidad, muerte, soltar objetos | Combate completo en la mina |

### Módulo 8 · Pueblo, NPCs y eventos
| Lección | Concepto | En tu juego |
|---|---|---|
| NPCs con horario | Escena base de NPC, rutas por hora | Los vecinos van a trabajar y vuelven a casa |
| Diálogos | Datos de diálogo, caja de texto, opciones | Hablar con los vecinos |
| Amistad y regalos | Puntos de amistad, gustos | Regalar objetos y subir la amistad |
| Eventos y festivales | Bus de eventos (autoload de señales), condiciones | Festivales por fecha, eventos por amistad |
| Misiones | Objetivos, progreso, recompensas | Encargos de los vecinos |
| Clima | `GPUParticles3D`, clima por día | La lluvia riega los cultivos |

### Módulo 9 · Guardar, pulir y publicar
| Lección | Concepto | En tu juego |
|---|---|---|
| Guardar y cargar | Qué guardar, diccionarios → archivo, `FileAccess`, `ResourceSaver` | Partida guardada al dormir |
| Menús | Menú principal, pausa, `process_mode` | Empezar, continuar y pausar |
| Sonido y música | `AudioStreamPlayer3D`, buses de audio | Música por estación y efectos |
| Rendimiento en 3D | `MultiMesh`, LOD, el perfilador | Muchos cultivos sin bajones de FPS |
| Exportar | Plantillas de exportación, ejecutable | Tu juego en un archivo para compartir |
