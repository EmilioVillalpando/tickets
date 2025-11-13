// Application State
export let CLIENTES = [];
export let PRODUCTOS = [];
export let PRECIOS = {};
export let slotActive = "A";
export let notaA = null;
export let notaB = null;
export let chA = null;
export let chB = null;

export const slotState = {
  A: { cliente_id: null, telefono: null },
  B: { cliente_id: null, telefono: null },
};

// Exit Guard State
export let exitGuardEnabled = JSON.parse(
  localStorage.getItem("exitGuardEnabled") || "true"
);
export let isDirty = false;

// State Setters
export function setClientes(data) {
  CLIENTES = data;
}

export function setProductos(data) {
  PRODUCTOS = data;
}

export function setPrecios(data) {
  PRECIOS = data;
}

export function setSlotActive(slot) {
  slotActive = slot;
}

export function setNotaA(nota) {
  notaA = nota;
}

export function setNotaB(nota) {
  notaB = nota;
}

export function setChA(channel) {
  chA = channel;
}

export function setChB(channel) {
  chB = channel;
}

export function setExitGuardEnabled(enabled) {
  exitGuardEnabled = enabled;
  localStorage.setItem("exitGuardEnabled", JSON.stringify(enabled));
}

export function markDirty() {
  if (exitGuardEnabled) isDirty = true;
}

export function clearDirty() {
  isDirty = false;
}

// State Getters
export function getClient(id) {
  return (CLIENTES || []).find((c) => String(c.id) === String(id));
}

export function getClientName(id) {
  return getClient(id)?.nombre || "";
}

export function activeNota() {
  return slotActive === "A" ? notaA : notaB;
}
