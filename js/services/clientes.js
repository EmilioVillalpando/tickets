import { supabase } from "../supabase-client.js";
import { setClientes, CLIENTES, slotState, slotActive } from "../state.js";
import { $ } from "../utils.js";

export async function loadClientes() {
  const { data, error } = await supabase
    .from("clientes")
    .select("id, nombre, telefono")
    .order("nombre");

  if (error) {
    console.error(error);
    alert("No se pudieron cargar CLIENTES");
    return;
  }

  setClientes(data || []);
  const cliSelect = $("#cliSelect");
  cliSelect.innerHTML = (CLIENTES || [])
    .map((c) => `<option value="${c.id}">${c.nombre}</option>`)
    .join("");
}

export async function addCliente() {
  const nombre = prompt("Nombre del cliente:");
  if (!nombre || !nombre.trim()) return;

  const telefono = prompt("Teléfono (WhatsApp, opcional):") || null;
  const row = {
    id: crypto.randomUUID(),
    nombre: nombre.trim(),
    telefono: telefono || null,
  };

  const { error } = await supabase.from("clientes").insert(row);
  if (error) {
    console.error(error);
    return alert("No se pudo crear el cliente (RLS/SQL)");
  }

  await loadClientes();
  const c = CLIENTES.find((x) => x.nombre === nombre.trim());
  if (c) {
    slotState[slotActive].cliente_id = c.id;
    slotState[slotActive].telefono = c.telefono || null;
    const { applySlotUI } = await import("../ui/slots.js");
    applySlotUI(slotActive);
  }
  alert("✅ Cliente creado");
}

export async function saveClientPhone(clienteId, telefono) {
  if (!clienteId) return;

  const val = (telefono || "").trim() || null;
  try {
    await supabase.from("clientes").update({ telefono: val }).eq("id", clienteId);
    const c = CLIENTES.find((cl) => String(cl.id) === String(clienteId));
    if (c) c.telefono = val;
    slotState[slotActive].telefono = val;
  } catch (e) {
    console.error(e);
  }
}
