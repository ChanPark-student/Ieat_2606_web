import { apiRequest } from "./client";

export async function createDiagnosis(payload) {
  return apiRequest("/diagnoses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listDiagnoses() {
  return apiRequest("/diagnoses");
}

export async function getDiagnosis(caseId) {
  return apiRequest(`/diagnoses/${caseId}`);
}