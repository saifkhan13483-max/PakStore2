import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { settingsFirestoreService, type ProfitRule } from "@/services/settingsFirestoreService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Plus, Trash2, TrendingUp, Info } from "lucide-react";
import SEO from "@/components/SEO";

export default function AdminProfitRules() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings", "profitRules"],
    queryFn: () => settingsFirestoreService.getProfitRules(),
  });

  const [rules, setRules] = useState<ProfitRule[] | null>(null);

  const effectiveRules: ProfitRule[] = rules ?? settings?.rules ?? [];

  const saveMutation = useMutation({
    mutationFn: (newRules: ProfitRule[]) => settingsFirestoreService.saveProfitRules(newRules),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "profitRules"] });
      setRules(null);
      toast({ title: "Profit rules saved!", description: "Your pricing rules have been updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error saving rules", description: error.message, variant: "destructive" });
    },
  });

  const handleRuleChange = (index: number, field: keyof ProfitRule, value: string) => {
    const updated = effectiveRules.map((r, i) =>
      i === index ? { ...r, [field]: Number(value) } : r
    );
    setRules(updated);
  };

  const handleAddRule = () => {
    const sorted = [...effectiveRules].sort((a, b) => a.maxCostPrice - b.maxCostPrice);
    const lastMax = sorted[sorted.length - 1]?.maxCostPrice ?? 0;
    const lastProfit = sorted[sorted.length - 1]?.profit ?? 0;
    setRules([...effectiveRules, { maxCostPrice: lastMax + 1000, profit: lastProfit + 100 }]);
  };

  const handleRemoveRule = (index: number) => {
    setRules(effectiveRules.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const sorted = [...effectiveRules].sort((a, b) => a.maxCostPrice - b.maxCostPrice);
    saveMutation.mutate(sorted);
  };

  const sortedRules = [...effectiveRules].sort((a, b) => a.maxCostPrice - b.maxCostPrice);

  return (
    <>
      <SEO title="Profit Rules - Admin" />
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Profit Rules
          </h1>
          <p className="text-muted-foreground mt-1">
            Define how much profit to add based on a product's cost price range.
          </p>
        </div>

        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <strong>How it works:</strong> When you enter a cost price for a product, the system finds the matching rule and fills in the profit automatically. For example, if cost price is Rs. 850 and the rule says "Up to Rs. 1000 → Rs. 100 profit", the selling price becomes Rs. 950.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Price Range Rules</CardTitle>
            <CardDescription>
              Each rule sets a maximum cost price and the profit to add. The lowest matching rule is applied first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center text-sm font-medium text-muted-foreground px-1">
                  <span>Cost Price up to (Rs.)</span>
                  <span>Profit to Add (Rs.)</span>
                  <span></span>
                </div>

                {sortedRules.map((rule, index) => (
                  <div
                    key={index}
                    data-testid={`profit-rule-row-${index}`}
                    className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center"
                  >
                    <div>
                      <Label htmlFor={`max-price-${index}`} className="sr-only">Cost Price up to</Label>
                      <Input
                        id={`max-price-${index}`}
                        type="number"
                        min={0}
                        value={rule.maxCostPrice}
                        onChange={(e) => handleRuleChange(
                          effectiveRules.findIndex(r => r === rule),
                          "maxCostPrice",
                          e.target.value
                        )}
                        data-testid={`input-max-price-${index}`}
                        placeholder="e.g. 1000"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`profit-${index}`} className="sr-only">Profit</Label>
                      <Input
                        id={`profit-${index}`}
                        type="number"
                        min={0}
                        value={rule.profit}
                        onChange={(e) => handleRuleChange(
                          effectiveRules.findIndex(r => r === rule),
                          "profit",
                          e.target.value
                        )}
                        data-testid={`input-profit-${index}`}
                        placeholder="e.g. 100"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRule(effectiveRules.findIndex(r => r === rule))}
                      data-testid={`button-remove-rule-${index}`}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={effectiveRules.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-3">
                    <strong>Summary:</strong>{" "}
                    {sortedRules.map((rule, i) => (
                      <span key={i}>
                        Cost ≤ Rs.{rule.maxCostPrice.toLocaleString()} → +Rs.{rule.profit} profit
                        {i < sortedRules.length - 1 ? " · " : ""}
                      </span>
                    ))}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleAddRule}
                    data-testid="button-add-rule"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Rule
                  </Button>
                  <Button
                    onClick={handleSave}
                    data-testid="button-save-rules"
                    disabled={saveMutation.isPending}
                    className="gap-2"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Rules
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Example Calculation</CardTitle>
            <CardDescription>How these rules will calculate selling prices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {sortedRules.map((rule, i) => {
                const exampleCost = i === 0
                  ? Math.min(rule.maxCostPrice, Math.floor(rule.maxCostPrice * 0.8))
                  : Math.floor((sortedRules[i - 1].maxCostPrice + rule.maxCostPrice) / 2);
                return (
                  <div key={i} className="flex items-center justify-between text-sm py-3 border-b last:border-0">
                    <span className="text-muted-foreground">
                      Cost: <strong className="text-foreground">Rs. {exampleCost.toLocaleString()}</strong>
                    </span>
                    <span className="text-muted-foreground">
                      + Profit: <strong className="text-green-600">Rs. {rule.profit}</strong>
                    </span>
                    <span className="font-semibold text-primary">
                      Selling: Rs. {(exampleCost + rule.profit).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
