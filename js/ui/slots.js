import {
  slotActive,
  setSlotActive,
  notaA,
  notaB,
  setNotaA,
  setNotaB,
  slotState,
  CLIENTES,
  getClient,
} from "../state.js";
import { $ } from "../utils.js";
import { subRealtime } from "../services/realtime.js";

export function setActiveSlot(s) {
  setSlotActive(s);
  const slotABtn = $("#slotA");
  const slotBBtn = $("#slotB");
  slotABtn.classList.toggle("active", s === "A");
  slotBBtn.classList.toggle("active", s === "B");
  applySlotUI(s);
  
  import("./vista.js").then(({ renderVista }) => renderVista());
  refreshNotaInfo();
}

export function setSlotNota(s, nota) {
  if (s === "A") {
    setNotaA(nota);
    subRealtime("A");
  } else {
    setNotaB(nota);
    subRealtime("B");
  }

  slotState[s].cliente_id = nota.cliente_id || slotState[s].cliente_id;
  const c = getClient(slotState[s].cliente_id);
  slotState[s].telefono = c ? c.telefono || null : slotState[s].telefono;

  if (slotActive === s) {
    applySlotUI(s);
    import("./vista.js").then(({ renderVista }) => renderVista());
  }
  refreshNotaInfo();
}

export function refreshNotaInfo() {
  const slotALabel = $("#slotALabel");
  const slotBLabel = $("#slotBLabel");
  const notaInfo = $("#notaInfo");

  slotALabel.textContent = notaA ? `${notaA.folio}` : "—";
  slotBLabel.textContent = notaB ? `${notaB.folio}` : "—";

  const n = slotActive === "A" ? notaA : notaB;
  notaInfo.textContent = n ? `Nota: ${n.folio}` : "Sin nota en slot";
}

export function applySlotUI(s) {
  const n = s === "A" ? notaA : notaB;
  const cid =
    n?.cliente_id || slotState[s].cliente_id || (CLIENTES[0]?.id || "");

  const cliSelect = $("#cliSelect");
  const cliTelefono = $("#cliTelefono");

  cliSelect.value = cid;
  const c = getClient(cid);
  cliTelefono.value =
    n && c
      ? c.telefono || ""
      : slotState[s].telefono || c?.telefono || "";
}
