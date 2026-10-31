// Repaso espaciado (sistema de cajas de Leitner): cada pregunta acertada pasa a
// una caja que se repasa más tarde; cada pregunta fallada vuelve a la primera.
// Solo entran preguntas de lecciones superadas (o todas, si se pide).
(function () {
  "use strict";

  const CLAVE_REPASO = "guia-godot-repaso";
  const CLAVE_PROGRESO = "guia-godot-progreso";
  const ESPERA_DIAS = [0, 1, 3, 7, 16, 35]; // espera según la caja (0 = hoy mismo)
  const DIA = 24 * 60 * 60 * 1000;
  const POR_SESION = 10;

  function leer(clave) {
    try {
      return JSON.parse(localStorage.getItem(clave)) || {};
    } catch (e) {
      return {};
    }
  }

  function guardar(estado) {
    try {
      localStorage.setItem(CLAVE_REPASO, JSON.stringify(estado));
    } catch (e) {
      // Sin almacenamiento: el repaso funciona, pero no recuerda las cajas.
    }
  }

  function preguntasDisponibles(todas) {
    const progreso = leer(CLAVE_PROGRESO);
    return window.REPASO.filter((p) => todas || progreso[p.leccion]);
  }

  function pendientes(lista, estado, ahora) {
    return lista.filter((p) => !estado[p.id] || estado[p.id].proxima <= ahora);
  }

  function barajar(lista) {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function tituloLeccion(id) {
    for (const m of window.CURSO.modulos) {
      const l = m.lecciones.find((x) => x.id === id);
      if (l) return l.titulo;
    }
    return "";
  }

  // ---------- Resumen en la portada ----------

  const resumen = document.getElementById("repaso-resumen");
  if (resumen) {
    const lista = preguntasDisponibles(false);
    const n = pendientes(lista, leer(CLAVE_REPASO), Date.now()).length;
    if (!lista.length) {
      resumen.textContent = "Se desbloquea al superar tu primera lección.";
    } else if (n) {
      resumen.innerHTML = `<span class="aviso-pendientes">${n} pregunta${n === 1 ? "" : "s"} para repasar hoy.</span>`;
    } else {
      resumen.textContent = "Nada pendiente hoy. ¡Todo al día! 🎉";
    }
  }

  // ---------- Página de repaso ----------

  const raiz = document.getElementById("repaso");
  if (!raiz) return;

  const cabecera = document.getElementById("repaso-cabecera");
  const tarjeta = document.getElementById("repaso-tarjeta");
  const resaltar = window.GuiaGodot.resaltar;
  let cola = [];
  let total = 0;
  let aciertosPrimera = 0;
  let falladas = new Set();

  function estadisticas() {
    const estado = leer(CLAVE_REPASO);
    const lista = preguntasDisponibles(false);
    const dominadas = lista.filter((p) => estado[p.id] && estado[p.id].caja >= 3).length;
    return { lista, estado, dominadas, pendientes: pendientes(lista, estado, Date.now()) };
  }

  function pintarInicio() {
    const { lista, pendientes: hoy } = estadisticas();
    pintarCabecera();

    if (!lista.length) {
      tarjeta.innerHTML = `
        <p>Las preguntas de repaso se desbloquean al superar lecciones. Supera tu primera lección y vuelve.</p>
        <button class="boton secundario" id="practicar-todo">Practicar con todo el curso igualmente</button>`;
    } else if (!hoy.length) {
      tarjeta.innerHTML = `
        <p>🎉 <strong>Todo al día.</strong> Las preguntas que aciertas vuelven cada vez más tarde (1, 3, 7, 16 días…); así se quedan para siempre.</p>
        <button class="boton secundario" id="practicar-extra">Practicar igualmente</button>`;
    } else {
      tarjeta.innerHTML = `
        <p>Tienes <strong>${hoy.length}</strong> pregunta${hoy.length === 1 ? "" : "s"} esperando. Te haré hasta ${POR_SESION}; las que falles volverán al final.</p>
        <button class="boton" id="empezar-repaso">Empezar repaso →</button>`;
    }

    const empezar = document.getElementById("empezar-repaso");
    if (empezar) empezar.onclick = () => iniciar(barajar(hoy).slice(0, POR_SESION));
    const extra = document.getElementById("practicar-extra");
    if (extra) extra.onclick = () => iniciar(barajar(lista).slice(0, POR_SESION));
    const todo = document.getElementById("practicar-todo");
    if (todo) todo.onclick = () => iniciar(barajar(preguntasDisponibles(true)).slice(0, POR_SESION));
  }

  function iniciar(preguntas) {
    cola = preguntas.slice();
    total = preguntas.length;
    aciertosPrimera = 0;
    falladas = new Set();
    siguiente();
  }

  function siguiente() {
    if (!cola.length) return pintarFinal();
    const p = cola.shift();
    const hechas = total - cola.length - 1;
    const opciones = barajar(p.o.map((texto, i) => ({ texto, correcta: i === p.c })));
    tarjeta.innerHTML = `
      <div class="barra"><div class="barra-relleno" style="width:${(hechas / total) * 100}%"></div></div>
      <p class="repaso-leccion">${tituloLeccion(p.leccion)}${falladas.has(p.id) ? " · otra oportunidad" : ""}</p>
      <p class="pregunta">${p.p}</p>
      ${p.codigo ? `<pre><code>${resaltar(p.codigo)}</code></pre>` : ""}
      <div class="repaso-opciones"></div>
      <p class="repaso-explicacion" hidden></p>
      <button class="boton" id="repaso-siguiente" hidden>Siguiente →</button>`;
    const contenedor = tarjeta.querySelector(".repaso-opciones");
    const explicacion = tarjeta.querySelector(".repaso-explicacion");
    const botonSiguiente = document.getElementById("repaso-siguiente");

    opciones.forEach((op) => {
      const b = document.createElement("button");
      b.className = "opcion-repaso";
      b.innerHTML = op.texto;
      b.addEventListener("click", () => {
        contenedor.querySelectorAll("button").forEach((x) => (x.disabled = true));
        const estado = leer(CLAVE_REPASO);
        const actual = estado[p.id] || { caja: 0 };
        let espera = 0;
        if (op.correcta) {
          b.classList.add("correcta");
          if (falladas.has(p.id)) {
            espera = ESPERA_DIAS[1]; // acertada en la segunda oportunidad: vuelve mañana
          } else {
            aciertosPrimera++;
            actual.caja = Math.min(actual.caja + 1, ESPERA_DIAS.length - 1);
            espera = ESPERA_DIAS[actual.caja];
          }
        } else {
          b.classList.add("incorrecta");
          contenedor.querySelectorAll("button").forEach((x, k) => {
            if (opciones[k].correcta) x.classList.add("correcta");
          });
          actual.caja = 0;
          if (!falladas.has(p.id)) {
            falladas.add(p.id);
            cola.push(p);
          }
        }
        actual.proxima = Date.now() + espera * DIA;
        estado[p.id] = actual;
        guardar(estado);
        explicacion.innerHTML = (op.correcta ? "✅ " : "❌ ") + p.e;
        explicacion.hidden = false;
        botonSiguiente.hidden = false;
        botonSiguiente.focus();
      });
      contenedor.appendChild(b);
    });
    botonSiguiente.onclick = siguiente;
  }

  function pintarFinal() {
    const { pendientes: hoy } = estadisticas();
    tarjeta.innerHTML = `
      <p>🎉 <strong>Repaso terminado.</strong> ${aciertosPrimera} de ${total} a la primera.</p>
      <p>${falladas.size ? "Las que fallaste volverán mañana para fijarlas." : "¡Perfecto! Estas preguntas no volverán hasta dentro de unos días."}</p>
      ${hoy.length ? `<button class="boton" id="repaso-mas">Repasar ${hoy.length} más</button>` : ""}
      <a class="boton secundario" href="../index.html">Volver al curso</a>`;
    const mas = document.getElementById("repaso-mas");
    if (mas) mas.onclick = () => iniciar(barajar(hoy).slice(0, POR_SESION));
    pintarCabecera();
  }

  function pintarCabecera() {
    const { lista, dominadas, pendientes: hoy } = estadisticas();
    cabecera.innerHTML = lista.length
      ? `<p><strong>${lista.length}</strong> preguntas desbloqueadas · <strong>${dominadas}</strong> dominadas · <strong>${hoy.length}</strong> para hoy</p>`
      : "";
  }

  pintarInicio();
})();
