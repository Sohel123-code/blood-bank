import statesRaw from "../data/states.json";

type StatesShape = {
  India: Record<string, string[]>;
};

const statesData = statesRaw as StatesShape;

export const getStates = (): string[] => {
  const entries = Object.keys(statesData.India || {});
  return entries.sort((a, b) => a.localeCompare(b));
};

export const getDistricts = (state: string): string[] => {
  const districts = statesData.India?.[state] || [];
  return [...districts].sort((a, b) => a.localeCompare(b));
};

