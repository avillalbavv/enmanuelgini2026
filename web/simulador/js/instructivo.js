document.addEventListener("DOMContentLoaded", inicializacion);

//SETTINGS
var saltar_unica = true;

function inicializacion() {
    window.addEventListener("load", actualizar_estado);

    window.addEventListener("hashchange", actualizar_estado);

    function actualizar_estado() {
        //se ocultan todos los elementos "paso"
        resetear_divs();
        let element_id =
            window.location.hash.split("#").filter(Boolean)[0] || null;
        if (!element_id) {
            inicio_demo();
        } else {
            const selected = document.getElementById(element_id);
            selected.style.display = "";
        }
    }

    const element = document.querySelectorAll(".paso button.next");
    Array.from(element).forEach(function (item) {
        item.addEventListener("click", mostrar_siguiente_paso);
    });

    const buttonPrev = document.querySelectorAll("button.prev");
    Array.from(buttonPrev).forEach(function (item) {
        item.addEventListener("click", volver_demo);
    });

    const ubicacionDestino =
        document.getElementsByClassName("ubicacion-destino");
    Array.from(ubicacionDestino).forEach(function (item) {
        item.addEventListener("click", mostrar_demo_ubicacion);
    });

    //$("[data-tipo=eleccion]").bind('click', mostrar_departamentos);
    // const buttonElecciones = document.querySelectorAll("[data-tipo=eleccion]");
    // Array.from(buttonElecciones).forEach(function (item) {
    //     item.addEventListener("click", mostrar_departamentos);
    // });
    // mostrar_departamentos()

    
    //$("[data-tipo=departamento]").bind('click', mostrar_distritos);
    const buttonDepartamentos = document.querySelectorAll("[data-tipo=departamento]");
    Array.from(buttonDepartamentos).forEach(function (item) {
        item.addEventListener("click", mostrar_distritos);
    });

    //$("[data-tipo=distrito]").bind('click', mostrar_mesas);
    const buttonDistritos = document.querySelectorAll("[data-tipo=distrito]");
    Array.from(buttonDistritos).forEach(function (item) {
        item.addEventListener("click", mostrar_mesas);
    });

    //$("[data-tipo=mesa]").bind('click', on_clic_mesa);
    const buttonMesas = document.querySelectorAll("[data-tipo=mesa]");
    Array.from(buttonMesas).forEach(function (item) {
        item.addEventListener("click", mostrar_demo_ubicacion);
    });

    document.getElementById("paso-5").addEventListener("click", mostrar_final);

    document.getElementById("reset").addEventListener("click", inicio_demo);
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("Mensaje recibido en el cliente", event.data);
        if (event.data.command === "IMAGENES_CACHEADAS") {
            document.location = "/";
        } else if (event.data.command === "ERROR_CACHEANDO_IMAGENES") {
            habilitar_boton_comenzar(true);
            habilitar_boton_cargando(false);
        }
    });
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

function cambiar_url(paso) {
    //setear url con el valor 'paso' que se le pasa a la funcion
    let url = window.location.href.split("#")[0];
    window.location.href = url + "#" + paso;
}

function empezar_demo() {
    cambiar_url("paso-1");
    document
        .getElementById("empezar")
        .removeEventListener("click", empezar_demo);
    const TagBody = document.getElementsByTagName("body");
    Array.from(TagBody).forEach(function (item) {
        item.setAttribute("id", "");
    });
}

function mostrar_siguiente_paso(event) {
    const next = event.target.parentElement.nextElementSibling;
    if (next.getAttribute("id") != "undefined") {
        cambiar_url(next.getAttribute("id"));
    }
}


function mostrar_nivel(ubicaciones_a_ocultar, id_nivel_a_mostrar){
    
    let a_ocultar = document.getElementsByClassName(`elegir_${ubicaciones_a_ocultar}`);
    Array.from(a_ocultar).forEach(function (item) {
        item.style.display = 'none';
    });

    const elementos_a_mostrar = document.querySelector(`[data-${ubicaciones_a_ocultar}="${id_nivel_a_mostrar}"]`);
    if (elementos_a_mostrar.children.length === 1 && saltar_unica && ubicaciones_a_ocultar=='distrito')        
        elementos_a_mostrar.children[0].click(); 
    else elementos_a_mostrar.style.display = 'block';
}

function mostrar_departamentos() {
    document.getElementById('nivel-a-elegir').innerText = "el Departamento";
    const id_nivel = '258';
    mostrar_nivel('eleccion', id_nivel);
}

function mostrar_distritos(event) {
    document.getElementById('nivel-a-elegir').innerText = "el Distrito";
    const id_nivel = event.target.dataset.id;
    mostrar_nivel('departamento', id_nivel);
}

function mostrar_mesas(event) {
    document.getElementById('nivel-a-elegir').innerText = "la Zona";
	const id_nivel = event.target.dataset.id;
    mostrar_nivel('distrito', id_nivel);
}


function volver_demo() {
    var ubicacion = window.localStorage.getItem("ubicacion");
    if (ubicacion != "null") {
        window.location = "sufragio.html?ubicacion=" + ubicacion;
    } else {
        cambiar_url("paso-3");
    }
}

function mostrar_demo_ubicacion(event) {
    resetear_divs();
    const ubicacion = event.target.dataset.id;
    window.localStorage.setItem("ubicacion", ubicacion);
    window.location = "sufragio.html?ubicacion=" + ubicacion;
}

function mostrar_final() {
    const TagBody = document.getElementsByTagName("body");
    Array.from(TagBody).forEach(function (item) {
        item.setAttribute("id", "final");
    });
    cambiar_url("agradecimiento");
    // const IdAgrad = document.getElementById("agradecimiento");
    // IdAgrad.addEventListener("load", function(event){});
}

function inicio_demo() {
    cambiar_url("");
    const TagBody = document.getElementsByTagName("body");
    Array.from(TagBody).forEach(function (item) {
        item.setAttribute("id", "final");
    });
    const bienvenido = document.getElementById("bienvenido");
    bienvenido.style.display = "";
    const empezar = document.getElementById("empezar");
    empezar.style.display = "";
    document.getElementById("empezar").addEventListener("click", empezar_demo);
}

function resetear_divs() {
    const contenedorAyuda = document.querySelectorAll(
        "#contenedor-ayuda > div"
    );
    Array.from(contenedorAyuda).forEach(function (item) {
        item.style.display = "none";
    });
    const franja = document.querySelectorAll(".franja");
    Array.from(franja).forEach(function (item) {
        item.style.display = "none";
    });
}
