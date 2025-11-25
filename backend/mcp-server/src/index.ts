import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

type InsuranceRequest = {
  id: string;
  email: string;
  fullName: string;
  nationalId: string;
  plate: string;
};

type DriverProfile = {
  nationalId: string;
  birthdate: string;
  infractionsCount: number;
};

type CarInfo = {
  plate: string;
  year: number;
  model: string;
  ownerNationalId: string;
};

type ModelPrice = {
  model: string;
  price: number;
};

function loadJson<T>(fileName: string): T[] {
  const filePath = path.join(__dirname, "data", fileName);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T[];
}

const insuranceRequests = loadJson<InsuranceRequest>("insurance_requests.json");
const driverProfiles = loadJson<DriverProfile>("driver_profiles.json");
const carInfos = loadJson<CarInfo>("car_info.json");
const modelPrices = loadJson<ModelPrice>("model_prices.json");

app.post("/tools/get_insurance_request", (req: Request, res: Response) => {
  const { emailOrId } = req.body as { emailOrId: string };
  const found = insuranceRequests.find(
    (r) => r.id === emailOrId || r.email === emailOrId
  );
  if (!found) {
    return res.status(404).json({ error: "Insurance request not found" });
  }
  return res.json(found);
});

app.post("/tools/get_driver_profile", (req: Request, res: Response) => {
  const { nationalId } = req.body as { nationalId: string };
  const profile = driverProfiles.find((d) => d.nationalId === nationalId);
  if (!profile) {
    return res.status(404).json({ error: "Driver profile not found" });
  }
  return res.json(profile);
});

app.post("/tools/get_car_info", (req: Request, res: Response) => {
  const { plate } = req.body as { plate: string };
  const car = carInfos.find((c) => c.plate === plate);
  if (!car) {
    return res.status(404).json({ error: "Car not found" });
  }
  return res.json(car);
});

app.post("/tools/get_car_model_price", (req: Request, res: Response) => {
  const { model } = req.body as { model: string };
  const found = modelPrices.find((m) => m.model === model);
  if (!found) {
    return res.status(404).json({ error: "Model price not found" });
  }
  return res.json(found);
});

app.post("/tools/calculate_risk", (req: Request, res: Response) => {
  const { age, infractionsCount } = req.body as { age: number; infractionsCount: number };
  let ageFactor = 1.0;
  if (age < 25) ageFactor = 1.5;
  else if (age <= 40) ageFactor = 1.2;
  else if (age <= 65) ageFactor = 1.0;
  else ageFactor = 1.3;
  const infractionFactor = 0.1 * infractionsCount;
  const risk = 1.0 * ageFactor + infractionFactor;
  return res.json({ risk });
});

app.post("/tools/calculate_vehicle_factor", (req: Request, res: Response) => {
  const { year, price } = req.body as { year: number; price: number };
  let yearFactor = 1.0;
  if (year >= 2020) yearFactor = 1.3;
  else if (year >= 2010) yearFactor = 1.1;
  else if (year >= 2000) yearFactor = 1.0;
  else yearFactor = 0.9;
  let priceFactor = 1.0;
  if (price >= 200000) priceFactor = 1.5;
  else if (price >= 100000) priceFactor = 1.2;
  const vehicleFactor = yearFactor * priceFactor;
  return res.json({ vehicleFactor });
});

app.post("/tools/calculate_insurance_premium", (req: Request, res: Response) => {
  const { risk, vehicleFactor, plan } = req.body as {
    risk: number;
    vehicleFactor: number;
    plan: "basic" | "advanced" | "premium";
  };
  const baseMap = { basic: 200, advanced: 350, premium: 500 };
  const base = baseMap[plan];
  const rawPremium = base * risk * vehicleFactor;
  const roundedPremium = Math.round(rawPremium);
  return res.json({ premium: roundedPremium, rawPremium });
});

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`MCP-like server running on port ${PORT}`);
});
