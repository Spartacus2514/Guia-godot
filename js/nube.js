// Guarda el progreso también en tu cuenta de Claude, para seguir en otro aparato
// (el móvil y el portátil) con el mismo enlace. Fuera de Claude, o sin cuenta,
// el curso funciona igual y el progreso se queda solo en este navegador.
//
// Cómo decide qué hacer al abrir una página:
//   - Solo ha cambiado este navegador desde la última vez → sube su progreso.
//   - Solo ha cambiado la cuenta (estudiaste en el otro aparato) → baja el de la cuenta.
//   - Han cambiado los dos → los junta, sin perder nada de ninguno.
// Así, lo que borras a propósito («Repetir los retos», «Reiniciar progreso»)
// también se borra en el otro aparato.
(function () {
  "use strict";

  const PREFIJO = "guia-godot-";
  const META = "guia-godot-nube";              // lo que sabe este navegador de la última sincronización
  const RECARGA = "guia-godot-nube-recarga";   // en sessionStorage: evita recargar en bucle
  const CADA = 5000;                           // cada cuánto mira si hay cambios que subir (sin red si no los hay)
  const TIEMPO_MAXIMO = 10000;

  // ---------- El progreso de este navegador ----------

  function clavesLocales() {
    const claves = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIJO) && !k.startsWith(META)) claves.push(k);
    }
    return claves.sort();
  }

  function leerLocal() {
    const estado = {};
    clavesLocales().forEach((k) => (estado[k] = localStorage.getItem(k)));
    return estado;
  }

  function escribirLocal(estado) {
    clavesLocales().forEach((k) => { if (!(k in estado)) localStorage.removeItem(k); });
    Object.keys(estado).forEach((k) => {
      if (typeof estado[k] === "string") localStorage.setItem(k, estado[k]);
    });
  }

  function leerJSON(texto, siFalla) {
    try {
      const v = JSON.parse(texto);
      return v === null || v === undefined ? siFalla : v;
    } catch (e) {
      return siFalla;
    }
  }

  // Resumen del estado para saber si ha cambiado. Sin la posición de la página:
  // bajar leyendo no debe provocar una subida cada pocos segundos.
  function huella(estado, conPosicion) {
    return JSON.stringify(Object.keys(estado).sort().map((k) => {
      if (k === "guia-godot-ultima" && !conPosicion) {
        const u = leerJSON(estado[k], {});
        return [k, u.id];
      }
      return [k, estado[k]];
    }));
  }

  function leerMeta() {
    return leerJSON(localStorage.getItem(META), {});
  }

  function guardarMeta(visto, estado) {
    localStorage.setItem(META, JSON.stringify({
      visto, huella: huella(estado, false), huellaPosicion: huella(estado, true)
    }));
  }

  // ---------- Juntar dos progresos sin perder nada ----------

  function unir(local, nube) {
    const r = Object.assign({}, nube, local);
    Object.keys(local).forEach((k) => {
      if (!(k in nube)) return;
      const a = leerJSON(local[k], null);
      const b = leerJSON(nube[k], null);
      if (a === null || b === null) return;
      let v = a;
      if (Array.isArray(a) && Array.isArray(b)) {
        v = [...new Set([...b, ...a])];                     // retos y pasos superados
      } else if (k === "guia-godot-ultima") {
        v = (b.t || 0) > (a.t || 0) ? b : a;                // la lección abierta más reciente
      } else if (k === "guia-godot-repaso") {
        v = Object.assign({}, b, a);                       // de cada pregunta, la que vuelve más tarde
        Object.keys(b).forEach((id) => {
          if (a[id] && (b[id].proxima || 0) > (a[id].proxima || 0)) v[id] = b[id];
        });
      } else if (typeof a === "object" && typeof b === "object") {
        v = Object.assign({}, b, a);                       // lecciones superadas
      }
      r[k] = JSON.stringify(v);
    });
    return r;
  }

  // ---------- Aviso en la portada ----------

  function mostrar(texto) {
    const el = document.getElementById("nube-estado");
    if (el) el.textContent = texto;
  }

  function recargar() {
    const antes = Number(sessionStorage.getItem(RECARGA) || 0);
    if (Date.now() - antes < 15000) return;   // ya se recargó hace nada: no insistir
    sessionStorage.setItem(RECARGA, String(Date.now()));
    location.reload();
  }

  function conTiempo(promesa) {
    return Promise.race([
      promesa,
      new Promise((_, rechazar) => setTimeout(() => rechazar({ code: "tiempo" }), TIEMPO_MAXIMO))
    ]);
  }

  // ---------- Sincronizar ----------

  let ocupado = false;

  async function sincronizar(ref, alCargar, conPosicion) {
    if (ocupado) return;
    const local = leerLocal();
    const meta = leerMeta();
    const sinSincronizar = meta.visto === undefined;
    const localCambiado = sinSincronizar
      ? Object.keys(local).length > 0
      : huella(local, false) !== meta.huella || (conPosicion && huella(local, true) !== meta.huellaPosicion);
    if (!alCargar && !localCambiado) return;   // nada que subir: ni siquiera se consulta la cuenta

    ocupado = true;
    try {
      const snap = await conTiempo(ref.get());
      const datos = snap.exists ? snap.data() : null;
      const nube = datos && datos.estado && typeof datos.estado === "object" ? datos.estado : null;
      const nubeCambiada = !!nube && datos.actualizado !== meta.visto;

      if (nube && nubeCambiada && !localCambiado) {
        // Estudiaste en el otro aparato: se trae ese progreso.
        escribirLocal(nube);
        guardarMeta(datos.actualizado, nube);
        if (huella(nube, false) !== huella(local, false)) recargar();
      } else if (nube && nubeCambiada && localCambiado) {
        // Los dos han cambiado: se juntan y se guarda el resultado en ambos sitios.
        const junto = unir(local, nube);
        const ahora = Date.now();
        await ref.set({ estado: junto, actualizado: ahora });
        escribirLocal(junto);
        guardarMeta(ahora, junto);
        if (huella(junto, false) !== huella(local, false)) recargar();
      } else if (localCambiado || (alCargar && !nube && Object.keys(local).length)) {
        // Solo ha cambiado este navegador: se sube.
        const ahora = Date.now();
        await ref.set({ estado: local, actualizado: ahora });
        guardarMeta(ahora, local);
      }
      mostrar("☁️ Tu progreso se guarda en tu cuenta de Claude: abre este mismo enlace en otro aparato, con tu cuenta, y seguirás donde lo dejaste.");
    } catch (e) {
      mostrar("⚠️ Ahora mismo no se puede conectar con tu cuenta: tu progreso se guarda en este navegador y se subirá cuando vuelva la conexión.");
    } finally {
      ocupado = false;
    }
  }

  async function iniciar() {
    if (!window.claude || typeof window.claude.use !== "function") return;   // fuera de Claude
    let db = null, user = null, id = null;
    try {
      [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
      id = db && user ? await user.id() : null;
    } catch (e) {
      id = null;
    }
    if (!id) return;   // sin cuenta: solo en este navegador
    const ref = db.doc("data/users/" + id + "/progreso");
    await sincronizar(ref, true, true);
    setInterval(() => sincronizar(ref, false, false), CADA);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") sincronizar(ref, false, true);
    });
  }

  iniciar();
})();
