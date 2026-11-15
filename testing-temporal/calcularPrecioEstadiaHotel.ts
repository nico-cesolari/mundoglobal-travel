const VALOR_HABITACION = {
  simple: 50000,
  doble: 80000
} as const;

type TipoHabitacion = keyof typeof VALOR_HABITACION;

/**
 * Función aislada creada exclusivamente para la actividad de Testing.
 * No está conectada al cálculo de precios de las reservas reales.
 */
export function calcularPrecioEstadiaHotel(
  cantNoches: number,
  tipoHabitacion: string,
  desayuno: number,
  precioPorNoche: number,
  cantPersonas: number
): number {
  if (!Number.isInteger(cantNoches) || cantNoches < 1) {
    throw new Error("Noches inválidas");
  }

  if (
    typeof tipoHabitacion !== "string" ||
    !Object.prototype.hasOwnProperty.call(VALOR_HABITACION, tipoHabitacion)
  ) {
    throw new Error("Tipo de habitación inválido");
  }

  if (desayuno !== 0 && desayuno !== 1) {
    throw new Error("Desayuno inválido");
  }

  if (
    typeof precioPorNoche !== "number" ||
    !Number.isFinite(precioPorNoche) ||
    precioPorNoche < 0
  ) {
    throw new Error("Precio por noche inválido");
  }

  if (!Number.isInteger(cantPersonas) || cantPersonas < 1) {
    throw new Error("Cantidad de personas inválida");
  }

  const habitacion = tipoHabitacion as TipoHabitacion;

  return (
    cantNoches * VALOR_HABITACION[habitacion] +
    desayuno * precioPorNoche * cantPersonas
  );
}
