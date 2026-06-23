'use strict';

const maxUbicacionesSeleccionadas = 8;
const minUbicacionesSeleccionadas = 1;
let ubicacionesSeleccionadas = 0;
let descargandoCache = false;

ready(inicializacion);

function inicializacion() {
    document
        .querySelectorAll("#seleccionar_ubicaciones li")
        .forEach((element) => {
            element.addEventListener("click", ubicacion_clickeada);
        });
}

function ubicacion_clickeada(event) {
    if (descargandoCache)
        return;
    const checkbox = event.target.querySelector('input[type=checkbox]');
    if (checkbox.checked) {
        ubicacionesSeleccionadas--;
        checkbox.checked = !checkbox.checked;
        habilitar_checkboxes(true);
        if (ubicacionesSeleccionadas < minUbicacionesSeleccionadas) {
            habilitar_boton_comenzar(false);
        }
    } else {
        if (ubicacionesSeleccionadas < maxUbicacionesSeleccionadas) {
            ubicacionesSeleccionadas++;
            checkbox.checked = !checkbox.checked;
            if (ubicacionesSeleccionadas >= maxUbicacionesSeleccionadas) {
                habilitar_checkboxes(false);
            }
            habilitar_boton_comenzar(true);
        }
    }
}

function habilitar_checkboxes(habilitar) {
    document
        .querySelectorAll('#seleccionar_ubicaciones li input[type=checkbox]')
        .forEach(checkbox => !checkbox.checked && (checkbox.style.visibility = habilitar ? 'inherit' : 'hidden'));
}

function habilitar_boton_comenzar(habilitar) {
    document.querySelector("#btn-continuar").style.display = habilitar
        ? "inline"
        : "none";
}

function habilitar_boton_cargando(habilitar) {
    document.querySelector("#btn-continuar-loading").style.display = habilitar
        ? "inline"
        : "none";
}


navigator.serviceWorker.addEventListener("message", (event) => {
    console.log("Mensaje recibido en el cliente", event.data);
    if (event.data.command === "IMAGENES_CACHEADAS") {
        document.location = "/";
    } else if (event.data.command === "ERROR_CACHEANDO_IMAGENES") {
        habilitar_boton_comenzar(true);
        habilitar_boton_cargando(false);
    }
});

function comenzar_cache_offline() {
    descargandoCache = true;
    // obtener ubicaciones seleccionadas
    const ubicaciones = [];
    document
        .querySelectorAll('#seleccionar_ubicaciones li input[type=checkbox]')
        .forEach(checkbox => checkbox.checked && !ubicaciones.includes(checkbox.name) && ubicaciones.push(checkbox.name));
    // deshabilita los checkbox
    document
        .querySelectorAll('#seleccionar_ubicaciones li input[type=checkbox]')
        .forEach(checkbox => !checkbox.checked && (checkbox.disabled = true));
    // muestra el botón de cargando
    habilitar_boton_comenzar(false);
    habilitar_boton_cargando(true);
    // enviar mensaje de comenzar descarga
    navigator.serviceWorker.controller.postMessage({
        command: 'CACHEAR_IMAGENES',
        data: ubicaciones
    });
}
