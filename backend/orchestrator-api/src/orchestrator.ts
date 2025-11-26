import axios from "axios";
import {
  InsuranceRequest,
  DriverProfile,
  CarInfo,
  ModelPrice,
  PlanType
} from "./types";
import {
  calculateAgeFromBirthdate,
  validateBusinessRules
} from "./businessRules";

const mcpBaseUrl = process.env.MCP_BASE_URL || "http://mcp-server:4001";

// Comentario en español: helper para llamar a cada tool del MCP server

async function callGetInsuranceRequest(
  emailOrId: string
): Promise<InsuranceRequest> {
  const { data } = await axios.post(
    `${mcpBaseUrl}/tools/get_insurance_request`,
    { emailOrId }
  );
  return data;
}

async function callGetDriverProfile(
  nationalId: string
): Promise<DriverProfile> {
  const { data } = await axios.post(
    `${mcpBaseUrl}/tools/get_driver_profile`,
    { nationalId }
  );
  return data;
}

async function callGetCarInfo(plate: string): Promise<CarInfo> {
  const { data } = await axios.post(`${mcpBaseUrl}/tools/get_car_info`, {
    plate
  });
  return data;
}

async function callGetCarModelPrice(model: string): Promise<ModelPrice> {
  const { data } = await axios.post(
    `${mcpBaseUrl}/tools/get_car_model_price`,
    { model }
  );
  return data;
}

async function callCalculateRisk(age: number, infractionsCount: number) {
  const { data } = await axios.post(`${mcpBaseUrl}/tools/calculate_risk`, {
    age,
    infractionsCount
  });
  return data.risk as number;
}

async function callCalculateVehicleFactor(year: number, price: number) {
  const { data } = await axios.post(
    `${mcpBaseUrl}/tools/calculate_vehicle_factor`,
    { year, price }
  );
  return data.vehicleFactor as number;
}

async function callCalculatePremium(
  risk: number,
  vehicleFactor: number,
  plan: PlanType
) {
  const { data } = await axios.post(
    `${mcpBaseUrl}/tools/calculate_insurance_premium`,
    {
      risk,
      vehicleFactor,
      plan
    }
  );
  return {
    premium: data.premium as number,
    rawPremium: data.rawPremium as number
  };
}

// Comentario en español: calcula la prima usando ID de solicitud
export async function handlePremiumByRequestId(
  requestId: string
): Promise<string> {
  let insuranceRequest: InsuranceRequest;

  try {
    insuranceRequest = await callGetInsuranceRequest(requestId);
  } catch (error) {
    console.error("[Orchestrator] Error en get_insurance_request:", error);
    return "Lo siento, no existe una solicitud con ese identificador en nuestro sistema.";
  }

  return calculatePremiumForInsuranceRequest(insuranceRequest);
}

// Comentario en español: calcula la prima usando correo
export async function handlePremiumByEmail(email: string): Promise<string> {
  let insuranceRequest: InsuranceRequest;

  try {
    insuranceRequest = await callGetInsuranceRequest(email);
  } catch (error) {
    console.error("[Orchestrator] Error en get_insurance_request:", error);
    return "Lo siento, no existe una solicitud con ese correo en nuestro sistema.";
  }

  return calculatePremiumForInsuranceRequest(insuranceRequest);
}

// Comentario en español: solo calcula el factor del vehículo
export async function handleVehicleFactorByRequestId(
  requestId: string
): Promise<string> {
  let insuranceRequest: InsuranceRequest;

  try {
    insuranceRequest = await callGetInsuranceRequest(requestId);
  } catch (error) {
    console.error("[Orchestrator] Error en get_insurance_request:", error);
    return "Lo siento, no existe una solicitud con ese identificador en nuestro sistema.";
  }

  const carInfo = await callGetCarInfo(insuranceRequest.plate);
  const modelPrice = await callGetCarModelPrice(carInfo.model);

  const vehicleFactor = await callCalculateVehicleFactor(
    carInfo.year,
    modelPrice.price
  );

  return `El factor del vehículo para la solicitud ${requestId} es ${vehicleFactor.toFixed(
    4
  )}.`;
}

// Comentario en español: orquestación completa para calcular prima
async function calculatePremiumForInsuranceRequest(
  insuranceRequest: InsuranceRequest
): Promise<string> {
  const driverProfile = await callGetDriverProfile(insuranceRequest.nationalId);
  const carInfo = await callGetCarInfo(insuranceRequest.plate);
  const modelPrice = await callGetCarModelPrice(carInfo.model);

  const age = calculateAgeFromBirthdate(driverProfile.birthdate);

  const validationError = validateBusinessRules(
    age,
    driverProfile,
    carInfo,
    modelPrice
  );

  console.log('ddsadasdsadsadsa', validationError, driverProfile)

  if (validationError) {
    return validationError;
  }

  const risk = await callCalculateRisk(age, driverProfile.infractionsCount);
  const vehicleFactor = await callCalculateVehicleFactor(
    carInfo.year,
    modelPrice.price
  );

  // Comentario en español: ejemplo usando plan "advanced"
  const { premium, rawPremium } = await callCalculatePremium(
    risk,
    vehicleFactor,
    "advanced"
  );

  return `La prima estimada de esta solicitud es de ${rawPremium.toFixed(
    2
  )} smartcars (redondeada a ${premium} smartcars).`;
}
