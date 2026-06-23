/**
 * Este código especifica al navegador la ruta hacia el service-worker,
 * el cual se encargará de administrar los archivos de la cache.
 * Mas info en: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service worker registrado.');
            });
    });
}

let deferredInstallPrompt = null;

// Add event listener for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
});


function installPWA() {
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
    
        // Log user response to prompt.
        deferredInstallPrompt.userChoice
            .then((choice) => {
                if (choice.outcome === 'accepted') {
                    console.log('Usuario aceptó el prompt A2HS', choice);
                } else {
                    console.log('Usuario no aceptó el prompt A2HS', choice);
                }
                deferredInstallPrompt = null;
            });
    }
}

// Add event listener for appinstalled event
window.addEventListener('appinstalled', event => {
    console.log('Simulador fue instalado.', event);
    document.location = 'bienvenida_pwa.html';
});


