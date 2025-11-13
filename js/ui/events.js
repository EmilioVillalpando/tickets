import { $, $$, todayISO, addDays } from "../utils.js";
import {
  slotState,
  slotActive,
  activeNota,
  setExitGuardEnabled,
  exitGuardEnabled,
  isDirty,
  clearDirty,
  markDirty,
  getClient,
} from "../state.js";
import { loadClientes, addCliente, saveClientPhone } from "../services/clientes.js";
import { loadProductos, prefPrecio } from "../services/productos.js";
import { continuarNota, addPartida, cerrarNota, saveNotaObs } from "../services/notas.js";
import { setActiveSlot } from "./slots.js";
import { loadBandeja } from "./bandeja.js";
import { imprimirDiaA4, exportDiaCSV } from "./reportes.js";
import { imprimirNotaA4, imprimirNota80mm, imprimirNota80mmRawBT } from "./print.js";
import { waNota } from "./whatsapp.js";

export function setupEventListeners() {
  const exitGuardToggle = $("#exitGuardToggle");
  const notaDias = $("#notaDias");
  const notaFecha = $("#notaFecha");
  const notaVence = $("#notaVence");
  const pProducto = $("#pProducto");
  const pKg = $("#pKg");
  const pPrecio = $("#pPrecio");
  const notaObs = $("#notaObs");
  const cliSelect = $("#cliSelect");
  const cliTelefono = $("#cliTelefono");
  const slotABtn = $("#slotA");
  const slotBBtn = $("#slotB");
  const notaFolio = $("#notaFolio");

  // Exit Guard
  exitGuardToggle.checked = exitGuardEnabled;
  exitGuardToggle.addEventListener("change", () => {
    setExitGuardEnabled(exitGuardToggle.checked);
    if (!exitGuardToggle.checked) clearDirty();
  });

  window.addEventListener("beforeunload", (e) => {
    if (exitGuardEnabled && isDirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  // Date calculations
  notaDias.addEventListener("change", () => {
    notaVence.value = addDays(notaFecha.value, notaDias.value);
  });

  notaFecha.addEventListener("change", () => {
    notaVence.value = addDays(notaFecha.value, notaDias.value);
  });

  // Product price prefill
  ["keyup", "change"].forEach((ev) =>
    pProducto.addEventListener(ev, () => {
      prefPrecio(pProducto.value, pPrecio);
      markDirty();
    })
  );

  ["keyup", "change"].forEach((ev) => pKg.addEventListener(ev, markDirty));
  ["keyup", "change"].forEach((ev) => pPrecio.addEventListener(ev, markDirty));
  ["keyup", "change"].forEach((ev) => notaObs.addEventListener(ev, markDirty));

  notaObs.addEventListener("blur", () => saveNotaObs(notaObs.value));

  // Increment buttons
  $$(".btnInc").forEach((b) =>
    b.addEventListener("click", () => {
      pKg.value = (Number(pKg.value || 0) + Number(b.dataset.d || 0)).toFixed(2);
      markDirty();
    })
  );

  // Enter key to add partida
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Enter" &&
      document.activeElement &&
      ["pProducto", "pKg", "pPrecio"].includes(document.activeElement.id)
    ) {
      e.preventDefault();
      handleAddPartida();
    }
  });

  // Buttons
  $("#btnContinuar").addEventListener("click", () =>
    continuarNota(notaFecha, notaVence, notaDias, notaObs, notaFolio)
  );

  $("#btnAgregar").addEventListener("click", handleAddPartida);

  $("#btnWA").addEventListener("click", () => {
    const nota = activeNota();
    if (nota) waNota(nota.id);
  });

  $("#btnImprimir").addEventListener("click", () => {
    const nota = activeNota();
    if (nota) imprimirNotaA4(nota.id);
  });

  $("#btnImprimir80").addEventListener("click", () => {
    const nota = activeNota();
    if (nota) imprimirNota80mm(nota.id);
  });

  $("#btnImprimir80Rawbt").addEventListener("click", () => {
    const nota = activeNota();
    if (nota) imprimirNota80mmRawBT(nota.id);
  });

  $("#btnCSV").addEventListener("click", () => {
    const nota = activeNota();
    if (nota) exportNotaCSV(nota.id);
  });

  $("#btnCerrar").addEventListener("click", cerrarNota);
  $("#btnNuevoCliente").addEventListener("click", addCliente);
  $("#btnBandeja").addEventListener("click", loadBandeja);
  $("#btnDiaA4").addEventListener("click", imprimirDiaA4);
  $("#btnDiaCSV").addEventListener("click", exportDiaCSV);

  // Client selection
  cliSelect.addEventListener("change", () => {
    slotState[slotActive].cliente_id = cliSelect.value || null;
    const c = getClient(slotState[slotActive].cliente_id);
    cliTelefono.value = c ? c.telefono || "" : "";
    slotState[slotActive].telefono = cliTelefono.value || null;
  });

  cliTelefono.addEventListener("blur", async () => {
    const cid = slotState[slotActive].cliente_id || activeNota()?.cliente_id;
    await saveClientPhone(cid, cliTelefono.value);
  });

  // Slot switching
  slotABtn.onclick = () => setActiveSlot("A");
  slotBBtn.onclick = () => setActiveSlot("B");
}

function handleAddPartida() {
  const pProducto = $("#pProducto");
  const pKg = $("#pKg");
  const pPrecio = $("#pPrecio");

  addPartida(pProducto.value, pKg.value, pPrecio.value).then(() => {
    pProducto.value = "";
    pKg.value = "1";
    prefPrecio(pProducto.value, pPrecio);
  });
}

function exportNotaCSV(nota_id) {
  // Placeholder for CSV export functionality
  console.log("Export CSV for nota:", nota_id);
  alert("Funcionalidad de exportar CSV pendiente");
}
