import { todayISO, addDays, genFolio } from "./utils.js";
import { $, $$ } from "./utils.js";
import { CLIENTES, slotState } from "./state.js";
import { loadClientes } from "./services/clientes.js";
import { loadProductos } from "./services/productos.js";
import { setupEventListeners } from "./ui/events.js";
import { loadBandeja } from "./ui/bandeja.js";
import { applySlotUI } from "./ui/slots.js";

async function init() {
  // Initialize date fields
  const notaFecha = $("#notaFecha");
  const notaVence = $("#notaVence");
  const notaDias = $("#notaDias");
  const bandejaFecha = $("#bandejaFecha");
  const diaFecha = $("#diaFecha");
  const notaFolio = $("#notaFolio");

  notaFecha.value = todayISO();
  notaVence.value = addDays(notaFecha.value, notaDias.value);
  bandejaFecha.value = todayISO();
  diaFecha.value = todayISO();

  // Setup event listeners
  setupEventListeners();

  // Load data
  await Promise.all([loadClientes(), loadProductos()]);

  // Generate folio
  notaFolio.value = genFolio();

  // Load bandeja
  await loadBandeja();

  // Set default client for slot A
  if (CLIENTES[0]) {
    slotState.A.cliente_id = CLIENTES[0].id;
    slotState.A.telefono = CLIENTES[0].telefono || null;
    applySlotUI("A");
  }
}

// Start the app when DOM is ready
window.addEventListener("load", init);
