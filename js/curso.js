// Índice del curso. Para añadir una lección:
//   1. Copia una lección existente de /lecciones y cambia su contenido.
//   2. Añade su "archivo" a la entrada correspondiente de aquí.
// Las lecciones sin "archivo" aparecen en la portada como "Próximamente".
// El orden de este archivo define la navegación (anterior / siguiente).
// El detalle de cada lección (concepto y avance en el juego) está en PLAN.md.
window.CURSO = {
  titulo: "Guía Godot",
  modulos: [
    {
      fase: "Fase 1 · La base",
      titulo: "Módulo 1 · Primeros pasos en 3D",
      descripcion: "El motor, el editor 3D, nodos y escenas, y tu primer script.",
      lecciones: [
        { id: "01-introduccion", titulo: "¿Qué es Godot?", archivo: "01-introduccion.html", duracion: "5 min" },
        { id: "02-interfaz", titulo: "El editor y el visor 3D", archivo: "02-interfaz.html", duracion: "6 min" },
        { id: "03-nodos-escenas", titulo: "Nodos y escenas en 3D", archivo: "03-nodos-escenas.html", duracion: "8 min" },
        { id: "04-primer-script", titulo: "Tu primer script en GDScript", archivo: "04-primer-script.html", duracion: "10 min" },
        { id: "04b-examen-m1", titulo: "Examen del módulo 1", archivo: "04b-examen-m1.html", duracion: "10 min" }
      ]
    },
    {
      titulo: "Módulo 2 · GDScript desde cero",
      descripcion: "Programar desde cero, con ejemplos de tu granja: dinero, energía, inventario.",
      lecciones: [
        { id: "05-variables", titulo: "Variables y tipos", archivo: "05-variables.html", duracion: "8 min" },
        { id: "06-condiciones", titulo: "Condiciones: if, elif, else", archivo: "06-condiciones.html", duracion: "8 min" },
        { id: "07-funciones", titulo: "Funciones", archivo: "07-funciones.html", duracion: "10 min" },
        { id: "08-arrays-bucles", titulo: "Arrays y bucles", archivo: "08-arrays-bucles.html", duracion: "10 min" },
        { id: "09-diccionarios", titulo: "Diccionarios", archivo: "09-diccionarios.html", duracion: "8 min" },
        { id: "10-vector3", titulo: "Vector3: posiciones en 3D", archivo: "10-vector3.html", duracion: "8 min" },
        { id: "11-senales", titulo: "Señales", archivo: "11-senales.html", duracion: "10 min" },
        { id: "11b-depurar", titulo: "Cuando algo falla", archivo: "11b-depurar.html", duracion: "12 min" },
        { id: "12-examen-m2", titulo: "Examen del módulo 2", archivo: "12-examen-m2.html", duracion: "15 min" }
      ]
    },
    {
      titulo: "Módulo 3 · El granjero",
      descripcion: "Tu personaje camina por el mundo 3D, la cámara le sigue y puede interactuar con las cosas.",
      lecciones: [
        { id: "13-controles", titulo: "Controles: el mapa de entrada" },
        { id: "14-characterbody3d", titulo: "Caminar con CharacterBody3D" },
        { id: "15-girar-camara", titulo: "Moverse según la cámara y girar el modelo" },
        { id: "16-camara", titulo: "La cámara que sigue al granjero" },
        { id: "17-animaciones", titulo: "Animaciones: quieto y caminando" },
        { id: "18-interactuar", titulo: "Interactuar con lo que tienes delante" }
      ]
    },
    {
      fase: "Fase 2 · Los sistemas de tu juego",
      titulo: "Módulo 4 · La granja",
      descripcion: "Arar, plantar, regar y cosechar sobre una cuadrícula.",
      lecciones: [
        { id: "19-cuadricula", titulo: "La cuadrícula del terreno" },
        { id: "20-estados-casilla", titulo: "Estados de cada casilla con enum" },
        { id: "21-herramientas", titulo: "Azada y regadera" },
        { id: "22-cultivos", titulo: "Cultivos que crecen por fases" },
        { id: "23-resources", titulo: "Datos de cultivos con Resource" },
        { id: "24-cosechar", titulo: "Cosechar" }
      ]
    },
    {
      titulo: "Módulo 5 · Tiempo, inventario y economía",
      descripcion: "Reloj y calendario, día y noche, inventario, interfaz, energía y tienda.",
      lecciones: [
        { id: "25-reloj", titulo: "El reloj del juego (autoload)" },
        { id: "26-dia-nuevo", titulo: "Un día nuevo: señales globales" },
        { id: "27-dia-noche", titulo: "Ciclo de día y noche" },
        { id: "28-inventario", titulo: "Inventario con objetos Resource" },
        { id: "29-hud", titulo: "Interfaz: HUD y barra de herramientas" },
        { id: "30-energia", titulo: "Energía y dormir" },
        { id: "31-tienda", titulo: "Tienda y caja de envío" }
      ]
    },
    {
      titulo: "Módulo 6 · Minería",
      descripcion: "Bajar a la mina, picar rocas, generar niveles y conseguir minerales.",
      lecciones: [
        { id: "32-cambiar-escena", titulo: "Cambiar de escena sin perder datos" },
        { id: "33-rocas", titulo: "Rocas y minerales" },
        { id: "34-niveles-aleatorios", titulo: "Niveles aleatorios" },
        { id: "35-pisos", titulo: "Pisos, escaleras y botín" }
      ]
    },
    {
      titulo: "Módulo 7 · Combate",
      descripcion: "Vida, golpes, enemigos con inteligencia y botín.",
      lecciones: [
        { id: "36-componente-vida", titulo: "Componente de vida reutilizable" },
        { id: "37-hitbox", titulo: "Hitbox y hurtbox" },
        { id: "38-atacar", titulo: "El ataque del granjero" },
        { id: "39-estados-enemigo", titulo: "Máquina de estados del enemigo" },
        { id: "40-navegacion", titulo: "Perseguir con NavigationAgent3D" },
        { id: "41-dano-botin", titulo: "Daño, retroceso, muerte y botín" }
      ]
    },
    {
      titulo: "Módulo 8 · Pueblo, NPCs y eventos",
      descripcion: "Vecinos con horario, diálogos, amistad, eventos, misiones y clima.",
      lecciones: [
        { id: "42-npcs", titulo: "NPCs con horario" },
        { id: "43-dialogos", titulo: "Diálogos" },
        { id: "44-amistad", titulo: "Amistad y regalos" },
        { id: "45-eventos", titulo: "Sistema de eventos y festivales" },
        { id: "46-misiones", titulo: "Misiones" },
        { id: "47-clima", titulo: "Clima: lluvia que riega" }
      ]
    },
    {
      titulo: "Módulo 9 · Guardar, pulir y publicar",
      descripcion: "Guardar la partida, menús, sonido, rendimiento y exportar.",
      lecciones: [
        { id: "48-guardar", titulo: "Guardar y cargar partida" },
        { id: "49-menus", titulo: "Menú principal y pausa" },
        { id: "50-sonido", titulo: "Sonido y música" },
        { id: "51-rendimiento", titulo: "Rendimiento en 3D" },
        { id: "52-exportar", titulo: "Exportar tu juego" }
      ]
    }
  ]
};
