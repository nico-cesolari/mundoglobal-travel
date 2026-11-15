import { calcularPrecioEstadiaHotel } from "./calcularPrecioEstadiaHotel";

describe("calcularPrecioEstadiaHotel - tests iniciales de IA", () => {
  test("calcula una habitación simple sin desayuno", () => {
    expect(calcularPrecioEstadiaHotel(2, "simple", 0, 100000, 1)).toBe(100000);
  });

  test("calcula una habitación doble con desayuno", () => {
    expect(calcularPrecioEstadiaHotel(3, "doble", 1, 10000, 2)).toBe(260000);
  });

  test("da error si las noches son negativas", () => {
    expect(() =>
      calcularPrecioEstadiaHotel(-1, "simple", 0, 100000, 1)
    ).toThrow("Noches inválidas");
  });
});
