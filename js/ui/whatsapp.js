import { to2 } from "../utils.js";
import { STORE_NAME } from "../config.js";
import { getNota } from "../services/notas.js";
import { getClientName, activeNota, slotActive, slotState, getClient } from "../state.js";

function plantillaWA(nota, det, clienteNombre) {
  const items = (det || [])
    .map(
      (d) =>
        `• ${d.producto} ${to2(d.cantidad)}kg × $${to2(d.precio)} = $${to2(d.importe)}`
    )
    .join("\n");

  return [
    `Hola *${clienteNombre}*,`,
    `te compartimos el detalle de tu cuenta del día:\n`,
    `*Folio:* ${nota.folio}`,
    `*Fecha:* ${nota.fecha}  |  *Vence:* ${nota.vence || "s/d"}`,
    "",
    items,
    "",
    `*Total:* $${to2(nota.total)}   |   *Saldo:* $${to2(nota.saldo)}`,
    nota.observaciones ? `\n*Notas:* ${nota.observaciones}` : "",
    "",
    `¡Gracias por tu preferencia! — ${STORE_NAME}`,
  ].join("\n");
}

export async function waNota(nota_id) {
  const { nota, det } = await getNota(nota_id);
  const nombre = getClientName(nota.cliente_id);

  let phone = slotState[slotActive].telefono;
  if (!phone || activeNota()?.cliente_id !== nota.cliente_id) {
    const c = getClient(nota.cliente_id);
    phone = c ? c.telefono || "" : "";
  }

  const msg = plantillaWA(nota, det || [], nombre);
  const u = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  const u2 = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  const w = window.open(u, "_blank");
  setTimeout(() => {
    if (!w || w.closed) window.open(u2, "_blank");
  }, 600);
}
