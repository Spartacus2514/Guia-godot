// Lógica compartida del curso: progreso, navegación, retos interactivos
// (quiz, completar, ordenar, relacionar, encontrar el error) y resaltado de GDScript.
(function () {
  "use strict";

  const CLAVE_PROGRESO = "guia-godot-progreso";
  const curso = window.CURSO;
  const idLeccion = document.body.dataset.leccion;
  const esLeccion = idLeccion !== undefined;
  // Páginas extra (repaso, chuleta): usan el índice lateral pero no cuentan retos.
  const esExtra = document.body.dataset.extra !== undefined;

  // ---------- Utilidades ----------

  function leerProgreso() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_PROGRESO)) || {};
    } catch (e) {
      return {};
    }
  }

  function guardarProgreso(progreso) {
    try {
      localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(progreso));
    } catch (e) {
      // Sin almacenamiento: el curso funciona igual, sin recordar el progreso.
    }
  }

  // Lecciones ya escritas (las que tienen archivo); el resto son "próximamente".
  function todasLasLecciones() {
    return curso.modulos.flatMap((m) => m.lecciones.filter((l) => l.archivo));
  }

  function modulosDisponibles() {
    return curso.modulos.filter((m) => m.lecciones.some((l) => l.archivo));
  }

  function porcentaje(lecciones, progreso) {
    if (!lecciones.length) return 0;
    return Math.round((lecciones.filter((l) => progreso[l.id]).length / lecciones.length) * 100);
  }

  function barajar(lista) {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function sacudir(el) {
    el.classList.remove("sacudir");
    void el.offsetWidth;
    el.classList.add("sacudir");
  }

  // ---------- Resaltado de GDScript ----------

  const PALABRAS_CLAVE = new Set(
    ("extends class_name func var const signal enum static if elif else for while match break continue " +
      "pass return in and or not is as self super await true false null void").split(" ")
  );
  const TIPOS = new Set(
    ("int float bool String Vector2 Vector3 Color Array Dictionary Node Node2D Node3D Sprite2D " +
      "CharacterBody2D CharacterBody3D RigidBody2D Area2D CollisionShape2D Camera2D Label Button Control " +
      "AnimatedSprite2D Timer Input PackedScene Node3D MeshInstance3D CollisionShape3D StaticBody3D " +
      "Camera3D DirectionalLight3D SpringArm3D RayCast3D Area3D NavigationAgent3D AnimationPlayer " +
      "Resource Basis Transform3D").split(" ")
  );

  function escapar(texto) {
    return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function resaltar(codigo) {
    const patron = /(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(@\w+)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)(\s*\()?/gm;
    let salida = "";
    let ultimo = 0;
    let m;
    while ((m = patron.exec(codigo)) !== null) {
      salida += escapar(codigo.slice(ultimo, m.index));
      ultimo = patron.lastIndex;
      if (m[1]) salida += `<span class="t-comentario">${escapar(m[1])}</span>`;
      else if (m[2]) salida += `<span class="t-cadena">${escapar(m[2])}</span>`;
      else if (m[3]) salida += `<span class="t-anotacion">${m[3]}</span>`;
      else if (m[4]) salida += `<span class="t-numero">${m[4]}</span>`;
      else if (m[5]) {
        const palabra = m[5];
        let clase = "";
        if (PALABRAS_CLAVE.has(palabra)) clase = "t-clave";
        else if (TIPOS.has(palabra)) clase = "t-tipo";
        else if (m[6]) clase = "t-funcion";
        salida += clase ? `<span class="${clase}">${palabra}</span>` : palabra;
        if (m[6]) salida += m[6];
      }
    }
    return salida + escapar(codigo.slice(ultimo));
  }

  function iniciarCodigo() {
    document.querySelectorAll("pre > code.gdscript").forEach((bloque) => {
      bloque.innerHTML = resaltar(bloque.textContent);
      const copiar = document.createElement("button");
      copiar.className = "copiar";
      copiar.textContent = "Copiar";
      copiar.addEventListener("click", () => {
        navigator.clipboard.writeText(bloque.textContent).then(() => {
          copiar.textContent = "¡Copiado!";
          setTimeout(() => (copiar.textContent = "Copiar"), 1500);
        });
      });
      bloque.parentElement.appendChild(copiar);
    });
  }

  // ---------- Registro de retos ----------
  // Todo elemento con clase "reto" cuenta para superar la lección.
  // Los widgets propios de una lección llaman a GuiaGodot.resuelto(elemento).

  function resuelto(el) {
    if (el.classList.contains("superado")) return;
    el.classList.add("superado");
    guardarReto(el);
    actualizarRetos();
  }

  // ---------- Guardar cada reto superado ----------
  // Cada reto recibe una clave estable (su id, o su tipo y su número de orden: "quiz-2"),
  // y las claves superadas de cada lección se guardan en el navegador.

  const CLAVE_RETOS = `${CLAVE_PROGRESO}-retos-${idLeccion}`;
  const TIPOS_RETO = ["quiz", "completar", "ordenar", "relacionar", "error-codigo", "paso-a-paso", "en-tu-juego", "widget"];
  let retosConClave = false;

  function leerRetos() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_RETOS)) || [];
    } catch (e) {
      return [];
    }
  }

  function guardarReto(el) {
    if (!esLeccion || !retosConClave || !el.dataset.clave) return;
    const guardados = leerRetos();
    if (guardados.includes(el.dataset.clave)) return;
    guardados.push(el.dataset.clave);
    try {
      localStorage.setItem(CLAVE_RETOS, JSON.stringify(guardados));
    } catch (e) {
      // Sin almacenamiento: el reto cuenta, pero no se recordará al volver.
    }
  }

  // Muestra un reto ya superado en su estado resuelto.
  function restaurar(el) {
    if (el.classList.contains("quiz")) {
      el.querySelectorAll("button[data-opcion]").forEach((b) => {
        if (b.dataset.opcion === el.dataset.respuesta) b.classList.add("correcta");
        b.disabled = true;
      });
    } else if (el.classList.contains("completar")) {
      el.querySelectorAll("input[data-respuesta]").forEach((e) => {
        e.value = e.dataset.respuesta.split("|")[0];
        e.classList.add("ok");
      });
      const r = el.querySelector(".resultado");
      if (r) { r.textContent = "✅ ¡Correcto!"; r.className = "resultado ok"; }
    } else if (el.classList.contains("ordenar")) {
      const respuesta = el.querySelector(".respuesta");
      const piezas = [...el.querySelectorAll(".pieza")].sort((a, b) => a.dataset.i - b.dataset.i);
      respuesta.innerHTML = "";
      piezas.forEach((b) => {
        const li = document.createElement("li");
        b.classList.add("ok");
        li.appendChild(b);
        respuesta.appendChild(li);
      });
      const r = el.querySelector(".resultado");
      if (r) { r.textContent = "✅ ¡Orden correcto!"; r.className = "resultado ok"; }
    } else if (el.classList.contains("relacionar")) {
      el.querySelectorAll(".pareja").forEach((b) => { b.classList.add("ok"); b.disabled = true; });
    } else if (el.classList.contains("error-codigo")) {
      const lineas = el.querySelectorAll(".linea");
      const linea = lineas[Number(el.dataset.linea) - 1];
      if (linea) linea.classList.add("ok");
    } else if (el.classList.contains("paso-a-paso")) {
      const avanzar = el.querySelector('[data-accion="adelante"]');
      while (avanzar && !avanzar.disabled) avanzar.click();
    } else if (el.classList.contains("en-tu-juego")) {
      el.querySelectorAll('input[type="checkbox"]').forEach((c) => (c.checked = true));
    } else if (el.classList.contains("widget")) {
      const info = el.querySelector(".widget-info");
      if (info) info.innerHTML = "✅ <strong>Reto ya superado.</strong> Si quieres hacerlo otra vez, usa «Repetir los retos» al final de la lección.";
    }
    el.classList.add("superado");
  }

  function restaurarRetos() {
    if (!esLeccion) return;
    const contadores = {};
    const retos = document.querySelectorAll(".reto");
    retos.forEach((el) => {
      const tipo = TIPOS_RETO.find((t) => el.classList.contains(t)) || "reto";
      contadores[tipo] = (contadores[tipo] || 0) + 1;
      el.dataset.clave = el.id || `${tipo}-${contadores[tipo]}`;
    });
    retosConClave = true;

    // Una lección ya superada (de antes de guardar retos sueltos) se muestra entera resuelta.
    const leccionSuperada = !!leerProgreso()[idLeccion];
    const guardados = leerRetos();
    retos.forEach((el) => {
      if (el.classList.contains("superado")) guardarReto(el);
      else if (leccionSuperada || guardados.includes(el.dataset.clave)) {
        restaurar(el);
        guardarReto(el);
      }
    });
  }

  function repetirRetos() {
    try {
      localStorage.removeItem(CLAVE_RETOS);
      localStorage.removeItem(`${CLAVE_PROGRESO}-pasos-${idLeccion}`);
    } catch (e) {
      // Nada que borrar.
    }
    // La lección deja de contar como superada hasta que vuelvas a completar sus retos.
    const p = leerProgreso();
    delete p[idLeccion];
    guardarProgreso(p);
    location.reload();
  }

  function actualizarRetos() {
    if (!esLeccion) return;
    const retos = document.querySelectorAll(".reto");
    const hechos = document.querySelectorAll(".reto.superado").length;
    const total = retos.length;

    const chip = document.getElementById("contador-retos");
    if (chip) {
      chip.querySelector(".texto").textContent = `🎯 ${hechos}/${total} retos`;
      chip.querySelector(".barra-relleno").style.width = (total ? (hechos / total) * 100 : 100) + "%";
    }

    if (total && hechos === total) {
      const p = leerProgreso();
      if (!p[idLeccion]) {
        p[idLeccion] = true;
        guardarProgreso(p);
        pintarLateral();
      }
      const final = document.getElementById("final-leccion");
      if (final) final.hidden = false;
      if (chip) chip.classList.add("completo");
    }
  }

  // ---------- Quiz ----------
  // <div class="quiz" data-respuesta="b">
  //   <p class="pregunta">…</p> <button data-opcion="a">…</button> … <p class="explicacion">…</p>
  // </div>

  function iniciarQuizzes() {
    document.querySelectorAll(".quiz").forEach((quiz) => {
      quiz.classList.add("reto");
      const correcta = quiz.dataset.respuesta;
      const opciones = quiz.querySelectorAll("button[data-opcion]");
      opciones.forEach((boton) => {
        boton.addEventListener("click", () => {
          if (quiz.classList.contains("superado")) return;
          if (boton.dataset.opcion === correcta) {
            boton.classList.add("correcta");
            opciones.forEach((b) => (b.disabled = true));
            resuelto(quiz);
          } else {
            boton.classList.add("incorrecta");
            boton.disabled = true;
            sacudir(boton);
          }
        });
      });
    });
  }

  // ---------- Completar código ----------
  // <div class="completar"><pre><code>… <input data-respuesta="valor|alternativa"> …</code></pre></div>

  function iniciarCompletar() {
    document.querySelectorAll(".completar").forEach((ej) => {
      ej.classList.add("reto");
      const entradas = ej.querySelectorAll("input[data-respuesta]");
      entradas.forEach((e) => {
        e.size = Math.max(3, e.dataset.respuesta.split("|")[0].length + 1);
        e.spellcheck = false;
        e.autocomplete = "off";
        e.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter") comprobar();
        });
      });

      const acciones = document.createElement("div");
      acciones.className = "acciones";
      acciones.innerHTML = `<button class="boton">Comprobar</button>
        <button class="boton secundario" hidden>Ver solución</button>
        <span class="resultado"></span>`;
      ej.appendChild(acciones);
      const [btnComprobar, btnSolucion] = acciones.querySelectorAll("button");
      const resultado = acciones.querySelector(".resultado");

      function comprobar() {
        let aciertos = 0;
        entradas.forEach((e) => {
          const validas = e.dataset.respuesta.split("|").map((r) => r.trim());
          const ok = validas.includes(e.value.trim());
          e.classList.toggle("ok", ok);
          e.classList.toggle("mal", !ok);
          if (ok) aciertos++;
        });
        if (aciertos === entradas.length) {
          resultado.textContent = "✅ ¡Correcto!";
          resultado.className = "resultado ok";
          resuelto(ej);
        } else {
          resultado.textContent = `${aciertos}/${entradas.length} bien`;
          resultado.className = "resultado mal";
          btnSolucion.hidden = false;
          sacudir(ej);
        }
      }

      btnComprobar.addEventListener("click", comprobar);
      btnSolucion.addEventListener("click", () => {
        entradas.forEach((e) => (e.value = e.dataset.respuesta.split("|")[0]));
        comprobar();
      });
    });
  }

  // ---------- Ordenar ----------
  // <div class="ordenar" data-codigo>   (data-codigo: las piezas son líneas de GDScript)
  //   <p>Enunciado</p>
  //   <ul class="piezas"><li>en el orden correcto</li>…</ul>
  // </div>

  function iniciarOrdenar() {
    document.querySelectorAll(".ordenar").forEach((ej) => {
      ej.classList.add("reto");
      const esCodigo = ej.hasAttribute("data-codigo");
      const lista = ej.querySelector(".piezas");
      const piezas = [...lista.querySelectorAll("li")].map((li, i) => ({ texto: li.textContent, i }));
      lista.remove();

      const zona = document.createElement("div");
      zona.className = "ordenar-zonas";
      zona.innerHTML = `
        <div><p class="etq">Tu respuesta</p><ol class="respuesta"></ol></div>
        <div><p class="etq">Toca las piezas en orden</p><div class="disponibles"></div></div>
        <p class="resultado"></p>`;
      ej.appendChild(zona);
      const respuesta = zona.querySelector(".respuesta");
      const disponibles = zona.querySelector(".disponibles");
      const resultado = zona.querySelector(".resultado");

      function crearPieza(p) {
        const b = document.createElement("button");
        b.className = "pieza" + (esCodigo ? " codigo" : "");
        b.dataset.i = p.i;
        if (esCodigo) b.innerHTML = resaltar(p.texto);
        else b.textContent = p.texto;
        b.addEventListener("click", () => {
          if (ej.classList.contains("superado")) return;
          if (b.parentElement === disponibles) {
            const li = document.createElement("li");
            li.appendChild(b);
            respuesta.appendChild(li);
          } else {
            b.parentElement.remove();
            disponibles.appendChild(b);
          }
          b.classList.remove("mal");
          comprobar();
        });
        return b;
      }

      function comprobar() {
        resultado.textContent = "";
        resultado.className = "resultado";
        if (disponibles.children.length) return;
        const colocadas = [...respuesta.querySelectorAll(".pieza")];
        let bien = true;
        colocadas.forEach((b, pos) => {
          const ok = Number(b.dataset.i) === pos;
          b.classList.toggle("mal", !ok);
          if (!ok) bien = false;
        });
        if (bien) {
          colocadas.forEach((b) => b.classList.add("ok"));
          resultado.textContent = "✅ ¡Orden correcto!";
          resultado.className = "resultado ok";
          resuelto(ej);
        } else {
          resultado.textContent = "Las piezas en rojo no van ahí. Tócalas para devolverlas.";
          resultado.className = "resultado mal";
          sacudir(respuesta);
        }
      }

      let orden = barajar(piezas);
      if (orden.every((p, k) => p.i === k) && orden.length > 1) orden = orden.reverse();
      orden.forEach((p) => disponibles.appendChild(crearPieza(p)));
    });
  }

  // ---------- Relacionar ----------
  // <div class="relacionar">
  //   <p>Enunciado</p>
  //   <ul class="pares"><li><span>Izquierda</span><span>Derecha</span></li>…</ul>
  // </div>

  function iniciarRelacionar() {
    document.querySelectorAll(".relacionar").forEach((ej) => {
      ej.classList.add("reto");
      const lista = ej.querySelector(".pares");
      const pares = [...lista.querySelectorAll("li")].map((li, i) => {
        const [a, b] = li.querySelectorAll("span");
        return { a: a.innerHTML, b: b.innerHTML, i };
      });
      lista.remove();

      const tablero = document.createElement("div");
      tablero.className = "relacionar-columnas";
      tablero.innerHTML = `<div class="col-a"></div><div class="col-b"></div>`;
      ej.appendChild(tablero);
      const colA = tablero.querySelector(".col-a");
      const colB = tablero.querySelector(".col-b");
      let seleccion = null;
      let aciertos = 0;

      function boton(html, i, lado) {
        const b = document.createElement("button");
        b.className = "pareja";
        b.innerHTML = html;
        b.dataset.i = i;
        b.dataset.lado = lado;
        b.addEventListener("click", () => elegir(b));
        return b;
      }

      function elegir(b) {
        if (b.disabled) return;
        if (!seleccion || seleccion.dataset.lado === b.dataset.lado) {
          if (seleccion) seleccion.classList.remove("elegida");
          seleccion = b;
          b.classList.add("elegida");
          return;
        }
        if (seleccion.dataset.i === b.dataset.i) {
          [seleccion, b].forEach((x) => {
            x.classList.remove("elegida");
            x.classList.add("ok");
            x.disabled = true;
          });
          aciertos++;
          if (aciertos === pares.length) resuelto(ej);
        } else {
          seleccion.classList.remove("elegida");
          sacudir(b);
          sacudir(seleccion);
        }
        seleccion = null;
      }

      barajar(pares).forEach((p) => colA.appendChild(boton(p.a, p.i, "a")));
      barajar(pares).forEach((p) => colB.appendChild(boton(p.b, p.i, "b")));
    });
  }

  // ---------- Encuentra el error ----------
  // <div class="error-codigo" data-linea="3">   (línea con el error, empezando en 1)
  //   <p>Enunciado</p>
  //   <pre><code>…</code></pre>
  //   <p class="explicacion">…</p>
  // </div>

  function iniciarErrores() {
    document.querySelectorAll(".error-codigo").forEach((ej) => {
      ej.classList.add("reto");
      const correcta = Number(ej.dataset.linea);
      // El código a examinar es el último bloque (antes puede haber otros, como un árbol de nodos).
      const bloques = ej.querySelectorAll("pre code");
      const code = bloques[bloques.length - 1];
      const lineas = code.textContent.replace(/\n$/, "").split("\n");
      code.innerHTML = "";
      lineas.forEach((texto, k) => {
        const linea = document.createElement("span");
        linea.className = "linea";
        linea.innerHTML = (resaltar(texto) || " ") + "\n";
        linea.addEventListener("click", () => {
          if (ej.classList.contains("superado")) return;
          if (k + 1 === correcta) {
            linea.classList.add("ok");
            resuelto(ej);
          } else {
            linea.classList.add("mal");
            sacudir(linea);
          }
        });
        code.appendChild(linea);
      });
    });
  }

  // ---------- Paso a paso ----------
  // Ejecuta un código línea a línea mostrando variables y salida.
  // <div class="paso-a-paso">
  //   <pre><code>…</code></pre>
  //   <script type="application/json">[
  //     {"l": 1, "v": {"dinero": "500"}, "s": ["texto impreso"], "n": "explicación"}, …
  //   ]</script>
  // </div>
  // l = línea (desde 1), v = todas las variables visibles en ese paso (como texto),
  // s = lo que imprime ese paso, n = explicación del paso.

  function iniciarPasoAPaso() {
    document.querySelectorAll(".paso-a-paso").forEach((ej) => {
      ej.classList.add("reto");
      const code = ej.querySelector("pre code");
      const pasos = JSON.parse(ej.querySelector('script[type="application/json"]').textContent);
      const lineas = code.textContent.replace(/\n$/, "").split("\n");
      code.innerHTML = "";
      const spans = lineas.map((texto) => {
        const linea = document.createElement("span");
        linea.className = "linea";
        linea.innerHTML = (resaltar(texto) || " ") + "\n";
        code.appendChild(linea);
        return linea;
      });

      const panel = document.createElement("div");
      panel.className = "traza";
      panel.innerHTML = `
        <p class="traza-nota"></p>
        <div class="traza-paneles">
          <div><p class="etq">Variables</p><table class="traza-vars"></table></div>
          <div><p class="etq">Salida</p><div class="traza-salida"></div></div>
        </div>
        <div class="traza-controles">
          <button class="boton secundario" data-accion="inicio" aria-label="Volver al principio">⏮</button>
          <button class="boton secundario" data-accion="atras" aria-label="Paso anterior">◀</button>
          <button class="boton" data-accion="adelante">▶ Siguiente paso</button>
          <span class="traza-contador"></span>
        </div>`;
      ej.appendChild(panel);
      const nota = panel.querySelector(".traza-nota");
      const tabla = panel.querySelector(".traza-vars");
      const salida = panel.querySelector(".traza-salida");
      const contador = panel.querySelector(".traza-contador");
      const [btnInicio, btnAtras, btnAdelante] = panel.querySelectorAll("button");
      let actual = -1;

      function pintar() {
        spans.forEach((sp) => sp.classList.remove("activa"));
        const paso = pasos[actual];
        if (paso) spans[paso.l - 1].classList.add("activa");

        const vars = (paso && paso.v) || {};
        const previas = (pasos[actual - 1] && pasos[actual - 1].v) || {};
        const nombres = Object.keys(vars);
        tabla.innerHTML = nombres.length
          ? nombres.map((n) => `<tr class="${previas[n] !== vars[n] ? "cambio" : ""}"><td>${escapar(n)}</td><td>${escapar(vars[n])}</td></tr>`).join("")
          : `<tr><td class="vacio">(ninguna todavía)</td></tr>`;

        const lineasSalida = pasos.slice(0, actual + 1).flatMap((p) => p.s || []);
        salida.textContent = lineasSalida.join("\n");
        salida.classList.toggle("vacia", !lineasSalida.length);

        nota.innerHTML = paso ? paso.n || "" : "Pulsa <strong>▶</strong> para ejecutar el código línea a línea.";
        contador.textContent = `Paso ${actual + 1}/${pasos.length}`;
        btnInicio.disabled = btnAtras.disabled = actual < 0;
        btnAdelante.disabled = actual >= pasos.length - 1;
        btnAdelante.textContent = actual >= pasos.length - 1 ? "✓ Fin" : "▶ Siguiente paso";
        if (actual === pasos.length - 1) resuelto(ej);
      }

      btnInicio.addEventListener("click", () => { actual = -1; pintar(); });
      btnAtras.addEventListener("click", () => { actual = Math.max(-1, actual - 1); pintar(); });
      btnAdelante.addEventListener("click", () => { actual = Math.min(pasos.length - 1, actual + 1); pintar(); });
      pintar();
    });
  }

  // ---------- Hazlo en tu juego ----------
  // <div class="en-tu-juego"><ul><li>Paso…</li>…</ul></div>
  // Lista de pasos para aplicar la lección en tu proyecto; se supera al marcarlos todos.

  function iniciarEnTuJuego() {
    document.querySelectorAll(".en-tu-juego").forEach((ej) => {
      ej.classList.add("reto");
      const clave = `${CLAVE_PROGRESO}-pasos-${idLeccion}`;
      let marcados = [];
      try {
        marcados = JSON.parse(localStorage.getItem(clave)) || [];
      } catch (e) {
        marcados = [];
      }
      const pasos = ej.querySelectorAll("li");
      function comprobar() {
        if ([...pasos].every((li) => li.querySelector("input").checked)) resuelto(ej);
      }
      pasos.forEach((li, k) => {
        const casilla = document.createElement("input");
        casilla.type = "checkbox";
        casilla.checked = marcados.includes(k);
        const texto = document.createElement("span");
        texto.append(...li.childNodes);
        const etiqueta = document.createElement("label");
        etiqueta.append(casilla, texto);
        li.appendChild(etiqueta);
        casilla.addEventListener("change", () => {
          marcados = [...pasos].map((x, i) => (x.querySelector("input").checked ? i : -1)).filter((i) => i >= 0);
          try {
            localStorage.setItem(clave, JSON.stringify(marcados));
          } catch (e) {
            // Sin almacenamiento: solo se pierde la marca al recargar.
          }
          comprobar();
        });
      });
      comprobar();
    });
  }

  // ---------- Portada ----------

  function pintarPortada() {
    const contenedor = document.getElementById("modulos");
    if (!contenedor) return;
    const progreso = leerProgreso();
    const total = todasLasLecciones();

    const barra = document.getElementById("progreso-global");
    if (barra) {
      const pct = porcentaje(total, progreso);
      barra.querySelector(".barra-relleno").style.width = pct + "%";
      const planificadas = curso.modulos.flatMap((m) => m.lecciones).length;
      barra.querySelector(".barra-texto").textContent =
        `${total.filter((l) => progreso[l.id]).length} de ${total.length} lecciones superadas (${pct}%) · ${planificadas} lecciones en el plan completo`;
    }

    // Botón principal: vuelve a la última lección abierta (al mismo punto de la página)
    // si no la terminaste; si la terminaste, va a la siguiente sin terminar.
    const empezar = document.getElementById("empezar");
    if (empezar) {
      const hechas = total.filter((l) => progreso[l.id]).length;
      const ultima = leerUltima();
      const leccionUltima = ultima && total.find((l) => l.id === ultima.id);
      if (leccionUltima && !progreso[leccionUltima.id]) {
        empezar.href = "lecciones/" + leccionUltima.archivo + "#continuar";
        empezar.textContent = `Continuar donde lo dejaste: ${leccionUltima.titulo} →`;
      } else {
        const desde = leccionUltima ? total.indexOf(leccionUltima) + 1 : 0;
        const siguiente = total.slice(desde).find((l) => !progreso[l.id]) || total.find((l) => !progreso[l.id]);
        if (siguiente) {
          empezar.href = "lecciones/" + siguiente.archivo;
          empezar.textContent = hechas ? `Continuar: ${siguiente.titulo} →` : "Empezar ahora →";
        } else {
          empezar.href = "lecciones/" + total[0].archivo;
          empezar.textContent = "Repasar desde el principio →";
        }
      }
    }

    contenedor.innerHTML = "";
    curso.modulos.forEach((modulo) => {
      if (modulo.fase) {
        const fase = document.createElement("h2");
        fase.className = "fase";
        fase.textContent = modulo.fase;
        contenedor.appendChild(fase);
      }
      const disponibles = modulo.lecciones.filter((l) => l.archivo);
      const proximamente = !disponibles.length;
      const tarjeta = document.createElement(proximamente ? "details" : "section");
      tarjeta.className = "tarjeta-modulo" + (proximamente ? " proximamente" : "");
      tarjeta.innerHTML = proximamente
        ? `<summary><h2>${modulo.titulo}</h2><span class="chip">Próximamente</span></summary>
           <p>${modulo.descripcion || ""}</p><ol class="lista-lecciones"></ol>`
        : `<h2>${modulo.titulo}</h2>
           <p>${modulo.descripcion || ""}</p>
           <div class="barra"><div class="barra-relleno" style="width:${porcentaje(disponibles, progreso)}%"></div></div>
           <ol class="lista-lecciones"></ol>`;
      const lista = tarjeta.querySelector("ol");
      modulo.lecciones.forEach((l) => {
        const li = document.createElement("li");
        if (progreso[l.id]) li.classList.add("hecha");
        li.innerHTML = l.archivo
          ? `<a href="lecciones/${l.archivo}">${l.titulo}</a>${l.duracion ? ` <span class="duracion">${l.duracion}</span>` : ""}`
          : `<span class="pendiente">${l.titulo}</span>`;
        lista.appendChild(li);
      });
      contenedor.appendChild(tarjeta);
    });

    const reiniciar = document.getElementById("reiniciar-progreso");
    if (reiniciar) {
      // Confirmación en dos pulsaciones (sin confirm(), que algunos visores bloquean).
      reiniciar.textContent = "Reiniciar progreso";
      reiniciar.onclick = () => {
        if (reiniciar.dataset.confirmar) {
          delete reiniciar.dataset.confirmar;
          guardarProgreso({});
          pintarPortada();
        } else {
          reiniciar.dataset.confirmar = "1";
          reiniciar.textContent = "¿Seguro? Pulsa otra vez para borrar";
          setTimeout(() => {
            delete reiniciar.dataset.confirmar;
            reiniciar.textContent = "Reiniciar progreso";
          }, 4000);
        }
      };
    }
  }

  // ---------- Lección ----------

  function pintarLateral() {
    const lateral = document.getElementById("lateral");
    if (!lateral) return;
    const progreso = leerProgreso();
    const extra = document.body.dataset.extra;
    let html = `<a class="volver" href="../index.html">← ${curso.titulo}</a>
      <a class="enlace-extra${extra === "repaso" ? " actual" : ""}" href="repaso.html">🔁 Repaso</a>
      <a class="enlace-extra${extra === "chuleta" ? " actual" : ""}" href="chuleta.html">📒 Chuleta y glosario</a>`;
    modulosDisponibles().forEach((m) => {
      html += `<h3>${m.titulo}</h3><ol>`;
      m.lecciones.filter((l) => l.archivo).forEach((l) => {
        const clases = [l.id === idLeccion ? "actual" : "", progreso[l.id] ? "hecha" : ""].join(" ");
        html += `<li class="${clases}"><a href="${l.archivo}">${l.titulo}</a></li>`;
      });
      html += "</ol>";
    });
    lateral.innerHTML = html;
  }

  // ---------- Última lección y punto de la página ----------

  const CLAVE_ULTIMA = "guia-godot-ultima";

  function leerUltima() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_ULTIMA));
    } catch (e) {
      return null;
    }
  }

  function guardarUltima(y) {
    try {
      localStorage.setItem(CLAVE_ULTIMA, JSON.stringify({ id: idLeccion, y: Math.round(y), t: Date.now() }));
    } catch (e) {
      // Sin almacenamiento: el botón «Continuar» irá a la primera lección sin terminar.
    }
  }

  function recordarPosicion() {
    const anterior = leerUltima();
    guardarUltima(anterior && anterior.id === idLeccion ? anterior.y : 0);
    let pendiente = null;
    window.addEventListener("scroll", () => {
      clearTimeout(pendiente);
      pendiente = setTimeout(() => guardarUltima(window.scrollY), 300);
    }, { passive: true });
  }

  // Al llegar desde «Continuar donde lo dejaste», baja hasta donde estabas.
  function volverAPosicion() {
    if (location.hash !== "#continuar") return;
    const ultima = leerUltima();
    if (ultima && ultima.id === idLeccion && ultima.y > 0) {
      requestAnimationFrame(() => window.scrollTo(0, ultima.y));
    }
  }

  function pintarLeccion() {
    const lecciones = todasLasLecciones();
    const indice = lecciones.findIndex((l) => l.id === idLeccion);
    const anterior = lecciones[indice - 1];
    const siguiente = lecciones[indice + 1];
    recordarPosicion();

    pintarLateral();
    const lateral = document.getElementById("lateral");
    const menu = document.getElementById("boton-menu");
    if (menu && lateral) menu.onclick = () => lateral.classList.toggle("abierto");

    const main = document.querySelector("main.contenido");
    const chip = document.createElement("div");
    chip.id = "contador-retos";
    chip.innerHTML = `<span class="texto"></span><div class="barra"><div class="barra-relleno"></div></div>`;
    main.prepend(chip);

    const nav = document.getElementById("navegacion");
    if (!nav) return;
    const enlaceSiguiente = siguiente
      ? `<a class="boton" href="${siguiente.archivo}">Siguiente: ${siguiente.titulo} →</a>`
      : `<a class="boton" href="../index.html">Volver al inicio</a>`;

    const final = document.createElement("div");
    final.id = "final-leccion";
    final.hidden = true;
    final.innerHTML = `<p>🎉 <strong>¡Lección superada!</strong> Has completado todos los retos.</p>${enlaceSiguiente}`;
    nav.before(final);

    nav.innerHTML = `
      ${anterior ? `<a class="boton secundario" href="${anterior.archivo}">← ${anterior.titulo}</a>` : "<span></span>"}
      ${siguiente ? `<a class="boton secundario" href="${siguiente.archivo}">${siguiente.titulo} →</a>` : `<a class="boton secundario" href="../index.html">Inicio</a>`}
      <button class="enlace-repetir" id="repetir-retos" type="button">↺ Repetir los retos de esta lección</button>`;
    const repetir = document.getElementById("repetir-retos");
    repetir.onclick = () => {
      if (repetir.dataset.confirmar) return repetirRetos();
      repetir.dataset.confirmar = "1";
      repetir.textContent = "¿Seguro? Pulsa otra vez para empezar los retos de cero";
      setTimeout(() => {
        delete repetir.dataset.confirmar;
        repetir.textContent = "↺ Repetir los retos de esta lección";
      }, 4000);
    };
  }

  // ---------- Arranque ----------

  window.GuiaGodot = { resaltar, resuelto, sacudir };

  if (esLeccion) pintarLeccion();
  else if (esExtra) {
    pintarLateral();
    const menu = document.getElementById("boton-menu");
    const lateral = document.getElementById("lateral");
    if (menu && lateral) menu.onclick = () => lateral.classList.toggle("abierto");
  } else pintarPortada();
  iniciarErrores();
  iniciarPasoAPaso();
  iniciarOrdenar();
  iniciarRelacionar();
  iniciarQuizzes();
  iniciarCompletar();
  iniciarEnTuJuego(); // el último: puede resolverse al cargar y necesita todos los retos registrados
  iniciarCodigo();
  // Los widgets propios de cada lección se inician en scripts posteriores a este,
  // así que los retos guardados se restauran cuando ya se ha cargado toda la página.
  function alCargar() {
    restaurarRetos();
    actualizarRetos();
    if (esLeccion) volverAPosicion();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", alCargar);
  else alCargar();
})();
