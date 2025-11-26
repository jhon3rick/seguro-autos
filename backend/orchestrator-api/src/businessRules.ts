import { DriverProfile, CarInfo, ModelPrice } from "./types";

// Comentario en español: calcular edad a partir de la fecha de nacimiento
export function calculateAgeFromBirthdate(birthdate: string): number {
  const birth = new Date(birthdate);
  const now = new Date();

  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

// Comentario en español: reglas de negocio según el enunciado
export function validateBusinessRules(
  age: number,
  driverProfile: DriverProfile,
  carInfo: CarInfo,
  modelPrice: ModelPrice
): string | null {
  // Rango de edad 20-80
  if (age < 20 || age > 80) {
    return "Lo siento pero este cliente no cumple el rango de edad permitido (20-80 años), no podemos venderle el seguro.";
  }

  // Año mínimo del vehículo 1980
  if (carInfo.year < 1980) {
    return "Lo siento, este vehículo es anterior a 1980, no podemos asegurarlo.";
  }

  // Valor mínimo del vehículo 50 000 smartcars
  if (modelPrice.price < 50000) {
    return "Lo siento, el valor del vehículo es inferior a 50 000 smartcars, no podemos asegurarlo.";
  }

  // Debe ser dueño del vehículo
  if (driverProfile.nationalId !== carInfo.ownerNationalId) {
    return `Lo siento pero este cliente no es dueño del vehículo de matrícula ${carInfo.plate}.`;
  }

  // Máximo 10 infracciones
  if (driverProfile.infractionsCount > 10) {
    return "Este cliente tiene más de 10 infracciones, no podemos venderle el seguro.";
  }

  return null;
}
