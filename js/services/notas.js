import { supabase } from "../supabase-client.js";
import {
  slotState,
  slotActive,
  activeNota,
  setNotaA,
  setNotaB,
  clearDirty,
} from "../state.js";
import { $, todayISO, addDays, genFolio } from "../utils.js";

export async function continuarNota(notaFecha, notaVence, notaDias, notaObs, notaFolio) {
  const cliente_id = slotState[slotActive].cliente_id || $("#cliSelect").value;
  if (!cliente_id) return alert("Selecciona cliente");

  const fecha = notaFecha.value || todayISO();

  let { data: nota } = await supabase
    .from("notas_credito")
    .select("*")
    .eq("cliente_id", cliente_id)
    .eq("fecha", fecha)
    .eq("estado", "abierta")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!nota) {
    const folio = genFolio();
    const payload = {
      id: crypto.randomUUID(),
      folio,
      fecha,
      vence: notaVence.value || addDays(fecha, notaDias.value),
      cliente_id,
      total: 0,
      saldo: 0,
      observaciones: notaObs.value || null,
    };
    const { error } = await supabase.from("notas_credito").insert(payload);
    if (error) {
      console.error(error);
      return alert("No se pudo crear la nota");
    }
    nota = payload;
  }

  const { setSlotNota } = await import("../ui/slots.js");
  setSlotNota(slotActive, nota);
  notaFolio.value = nota.folio;
  notaObs.value = nota.observaciones || "";
}

export async function saveNotaObs(observaciones) {
  const n = activeNota();
  if (!n) return;

  const val = (observaciones || "").trim() || null;
  try {
    await supabase
      .from("notas_credito")
      .update({ observaciones: val })
      .eq("id", n.id);
    clearDirty();
  } catch (e) {
    console.error(e);
  }
}

export async function addPartida(producto, cantidad, precio) {
  const nota = activeNota();
  if (!nota) return alert("Primero crea/continúa una nota en el slot activo");

  const prod = (producto || "").trim();
  const cant = Number(cantidad || 0);
  const prec = Number(precio || 0);

  if (!prod || cant <= 0) return alert("Producto y kilos son obligatorios");

  const { error } = await supabase.from("notas_detalle").insert({
    id: crypto.randomUUID(),
    nota_id: nota.id,
    producto: prod,
    cantidad: cant,
    precio: prec,
    importe: cant * prec,
  });

  if (error) {
    console.error(error);
    return alert("No se pudo agregar la partida");
  }

  clearDirty();
  await recalcNota(nota.id);
}

export async function recalcNota(nota_id) {
  let total = 0;
  try {
    const { data } = await supabase.rpc("sum_importe_nota", {
      p_nota_id: nota_id,
    });
    total = Number(data?.total || 0);
  } catch {
    const { data } = await supabase
      .from("notas_detalle")
      .select("importe")
      .eq("nota_id", nota_id);
    total = (data || []).reduce((a, b) => a + Number(b.importe || 0), 0);
  }

  await supabase
    .from("notas_credito")
    .update({ total, saldo: total })
    .eq("id", nota_id);

  const { renderVista } = await import("../ui/vista.js");
  const { loadBandeja } = await import("../ui/bandeja.js");
  await renderVista();
  await loadBandeja();
}

export async function deleteDetalle(detId) {
  if (!confirm("¿Borrar esta partida?")) return;
  const n = activeNota();
  if (!n) return;

  await supabase.from("notas_detalle").delete().eq("id", detId);
  await recalcNota(n.id);
}

export async function updateDetalle(detId, field, newValue, nota_id) {
  const { data: cur } = await supabase
    .from("notas_detalle")
    .select("cantidad, precio")
    .eq("id", detId)
    .single();

  const cantidad = field === "cantidad" ? newValue : Number(cur?.cantidad || 0);
  const precio = field === "precio" ? newValue : Number(cur?.precio || 0);
  const importe = cantidad * precio;

  await supabase
    .from("notas_detalle")
    .update({ cantidad, precio, importe })
    .eq("id", detId);

  clearDirty();
  await recalcNota(nota_id);
}

export async function cerrarNota() {
  const n = activeNota();
  if (!n) return alert("Sin nota");

  await supabase.from("notas_credito").update({ estado: "cerrada" }).eq("id", n.id);

  const { renderVista } = await import("../ui/vista.js");
  const { loadBandeja } = await import("../ui/bandeja.js");
  await renderVista();
  await loadBandeja();
  alert("✅ Nota cerrada");
}

export async function getNota(nota_id) {
  const { data: nota } = await supabase
    .from("notas_credito")
    .select("*, clientes(nombre)")
    .eq("id", nota_id)
    .single();

  const { data: det } = await supabase
    .from("notas_detalle")
    .select("*")
    .eq("nota_id", nota_id)
    .order("created_at");

  return { nota, det };
}
