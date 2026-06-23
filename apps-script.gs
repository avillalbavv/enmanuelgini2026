/**
 * Google Apps Script — Receptor de formulario de contacto
 * =========================================================
 * PASOS DE INSTALACIÓN:
 * 1. Abrí Google Sheets → Extensiones → Apps Script
 * 2. Reemplazá todo el contenido con este código
 * 3. Clic en "Implementar" → "Nueva implementación"
 *    - Tipo: Aplicación web
 *    - Ejecutar como: Yo (tu cuenta Google)
 *    - Quién tiene acceso: Cualquier usuario
 * 4. Copiá la URL y guardala en .env.local como:
 *    VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/TU_ID/exec
 *
 * COLUMNAS esperadas en la hoja "Formulario" (fila 1):
 * Fecha | Nombre | Apellido | Celular | Correo | Zona | Mensaje
 */

const SHEET_NAME = "Formulario"; // Nombre de la hoja dentro de tu Sheets

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    // Si la hoja no existe, crearla con cabeceras
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(["Fecha", "Nombre", "Apellido", "Celular", "Correo", "Zona", "Mensaje"]);
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold");
    }

    sheet.appendRow([
      data.fecha   || new Date().toLocaleString("es-PY"),
      data.nombre  || "",
      data.apellido|| "",
      data.celular || "",
      data.correo  || "",
      data.zona    || "",
      data.mensaje || "",
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Para testear desde el navegador
function doGet() {
  return ContentService
    .createTextOutput("Apps Script activo. Usá POST para registrar contactos.")
    .setMimeType(ContentService.MimeType.TEXT);
}
