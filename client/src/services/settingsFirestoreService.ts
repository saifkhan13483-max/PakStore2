import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ProfitRule {
  maxWholesalePrice: number;
  profit: number;
}

export interface ProfitRulesSettings {
  rules: ProfitRule[];
  updatedAt?: any;
}

const SETTINGS_COLLECTION = "settings";
const PROFIT_RULES_DOC = "profitRules";

const DEFAULT_RULES: ProfitRule[] = [
  { maxWholesalePrice: 1000, profit: 100 },
  { maxWholesalePrice: 2000, profit: 200 },
  { maxWholesalePrice: 3000, profit: 300 },
  { maxWholesalePrice: 4000, profit: 400 },
];

export const settingsFirestoreService = {
  async getProfitRules(): Promise<ProfitRulesSettings> {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, PROFIT_RULES_DOC);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as ProfitRulesSettings;
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

  calculateSellingPrice(wholesalePrice: number, rules: ProfitRule[]): { sellingPrice: number; profit: number } {
    const sorted = [...rules].sort((a, b) => a.maxWholesalePrice - b.maxWholesalePrice);
    for (const rule of sorted) {
      if (wholesalePrice <= rule.maxWholesalePrice) {
        return { sellingPrice: wholesalePrice + rule.profit, profit: rule.profit };
      }
    }
    const lastRule = sorted[sorted.length - 1];
    if (lastRule) {
      return { sellingPrice: wholesalePrice + lastRule.profit, profit: lastRule.profit };
    }
    return { sellingPrice: wholesalePrice, profit: 0 };
  },
};
