import { supabase } from "../supabase-client.js";
import { setProductos, setPrecios, PRODUCTOS, PRECIOS } from "../state.js";
import { $ } from "../utils.js";

export async function loadProductos() {
  let { data, error } = await supabase
    .from("productos")
    .select("id,nombre,precio_kg,activo")
    .eq("activo", true)
    .order("nombre");

  if (error) {
    ({ data } = await supabase
      .from("productos")
      .select("id,nombre,precio_kg")
      .order("nombre"));
  }

  setProductos(data || []);
  setPrecios(
    Object.fromEntries(
      PRODUCTOS.map((p) => [p.nombre, Number(p.precio_kg || 0).toFixed(2)])
    )
  );

  $("#catProductos").innerHTML = PRODUCTOS.map(
    (p) => `<option value="${p.nombre}"></option>`
  ).join("");
}

export function prefPrecio(productoNombre, precioInput) {
  const n = (productoNombre || "").trim();
  if (PRECIOS[n]) precioInput.value = PRECIOS[n];
}
