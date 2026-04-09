import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ProfitRule {
  maxCostPrice: number;
  profit: number;
}

export interface ProfitRulesSettings {
  rules: ProfitRule[];
  updatedAt?: any;
}

const SETTINGS_COLLECTION = "settings";
const PROFIT_RULES_DOC = "profitRules";

const DEFAULT_RULES: ProfitRule[] = [
  { maxCostPrice: 1000, profit: 100 },
  { maxCostPrice: 2000, profit: 200 },
  { maxCostPrice: 3000, profit: 300 },
  { maxCostPrice: 4000, profit: 400 },
];

export const settingsFirestoreService = {
  async getProfitRules(): Promise<ProfitRulesSettings> {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, PROFIT_RULES_DOC);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const rules: ProfitRule[] = (data.rules ?? []).map((r: any) => ({
          maxCostPrice: r.maxCostPrice ?? r.maxWholesalePrice ?? 0,
          profit: r.profit ?? 0,
        }));
        return { ...data, rules } as ProfitRulesSettings;
      }
      return { rules: DEFAULT_RULES };
    } catch (error: any) {
      console.error("Error getting profit rules:", error);
      return { rules: DEFAULT_RULES };
    }
  },

  async saveProfitRules(rules: ProfitRule[]): Promise<void> {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, PROFIT_RULES_DOC);
      await setDoc(docRef, { rules, updatedAt: serverTimestamp() });
    } catch (error: any) {
      console.error("Error saving profit rules:", error);
      throw error;
    }
  },

  calculateProfit(costPrice: number, rules: ProfitRule[]): number {
    const sorted = [...rules].sort((a, b) => a.maxCostPrice - b.maxCostPrice);
    for (const rule of sorted) {
      if (costPrice <= rule.maxCostPrice) {
        return rule.profit;
      }
    }
    return sorted[sorted.length - 1]?.profit ?? 0;
  },
};
