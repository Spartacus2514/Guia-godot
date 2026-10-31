// Índice del curso. Para añadir una lección:
//   1. Copia una lección existente de /lecciones y cambia su contenido.
//   2. Añade su entrada aquí, en el módulo que corresponda.
// El orden de este archivo define la navegación (anterior / siguiente).
window.CURSO = {
  titulo: "Guía Godot",
  modulos: [
    {
      titulo: "Módulo 1 · Primeros pasos",
      descripcion: "Conoce el motor, su editor y las ideas básicas: nodos, escenas y tu primer script.",
      lecciones: [
        { id: "01-introduccion", titulo: "¿Qué es Godot?", archivo: "01-introduccion.html", duracion: "5 min" },
        { id: "02-interfaz", titulo: "La interfaz del editor", archivo: "02-interfaz.html", duracion: "5 min" },
        { id: "03-nodos-escenas", titulo: "Nodos y escenas", archivo: "03-nodos-escenas.html", duracion: "8 min" },
        { id: "04-primer-script", titulo: "Tu primer script en GDScript", archivo: "04-primer-script.html", duracion: "10 min" }
      ]
    }
  ]
};
