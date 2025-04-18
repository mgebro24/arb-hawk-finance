
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RiskSettings } from "@/utils/types";
import { AlertTriangle, Shield, Zap } from "lucide-react";

interface RiskControlsProps {
  riskSettings: RiskSettings;
  updateRiskSettings: (settings: Partial<RiskSettings>) => void;
  isAutoTrading: boolean;
  toggleAutoTrading: () => void;
  isTestnet: boolean;
}

const RiskControls = ({
  riskSettings,
  updateRiskSettings,
  isAutoTrading,
  toggleAutoTrading,
  isTestnet
}: RiskControlsProps) => {
  const [localSettings, setLocalSettings] = useState<RiskSettings>(riskSettings);

  // Handle input changes
  const handleChange = (key: keyof RiskSettings, value: number | boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Apply changes
  const applyChanges = () => {
    updateRiskSettings(localSettings);
  };

  // Reset to current settings
  const resetChanges = () => {
    setLocalSettings(riskSettings);
  };

  return (
    <Card className="border-muted bg-gradient-to-b from-card to-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            <CardTitle className="text-lg">Risk Management</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Label 
              htmlFor="auto-trading" 
              className={`text-sm ${isAutoTrading ? 'text-success' : 'text-muted-foreground'}`}
            >
              {isAutoTrading ? 'Auto-Trading Active' : 'Auto-Trading Off'}
            </Label>
            <Switch
              id="auto-trading"
              checked={isAutoTrading}
              onCheckedChange={toggleAutoTrading}
              className={isAutoTrading ? "bg-success" : ""}
            />
          </div>
        </div>
        <CardDescription className="flex items-center mt-1">
          {isTestnet ? (
            <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-sm text-xs mr-2">Testnet</span>
          ) : (
            <span className="bg-warning/20 text-warning px-2 py-0.5 rounded-sm text-xs flex items-center mr-2">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Mainnet
            </span>
          )}
          Configure trading parameters to manage your risk exposure
        </CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="max-trade-amount">Max Trade Amount ($)</Label>
              <span className="text-sm text-muted-foreground">${localSettings.maxTradeAmount}</span>
            </div>
            <div className="flex gap-2">
              <Slider
                id="max-trade-amount"
                min={10}
                max={5000}
                step={10}
                value={[localSettings.maxTradeAmount]}
                onValueChange={(value) => handleChange("maxTradeAmount", value[0])}
              />
              <Input
                type="number"
                value={localSettings.maxTradeAmount}
                onChange={(e) => handleChange("maxTradeAmount", parseFloat(e.target.value) || 0)}
                className="w-20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="min-profit">Min Profit Threshold ($)</Label>
              <span className="text-sm text-muted-foreground">${localSettings.minProfitThreshold}</span>
            </div>
            <div className="flex gap-2">
              <Slider
                id="min-profit"
                min={0.1}
                max={10}
                step={0.1}
                value={[localSettings.minProfitThreshold]}
                onValueChange={(value) => handleChange("minProfitThreshold", value[0])}
              />
              <Input
                type="number"
                value={localSettings.minProfitThreshold}
                onChange={(e) => handleChange("minProfitThreshold", parseFloat(e.target.value) || 0)}
                className="w-20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="max-slippage">Max Slippage (%)</Label>
              <span className="text-sm text-muted-foreground">{localSettings.maxSlippage}%</span>
            </div>
            <div className="flex gap-2">
              <Slider
                id="max-slippage"
                min={0.1}
                max={3}
                step={0.1}
                value={[localSettings.maxSlippage]}
                onValueChange={(value) => handleChange("maxSlippage", value[0])}
              />
              <Input
                type="number"
                value={localSettings.maxSlippage}
                onChange={(e) => handleChange("maxSlippage", parseFloat(e.target.value) || 0)}
                className="w-20"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="gas-limit">Gas Limit (SOL)</Label>
              <span className="text-sm text-muted-foreground">{localSettings.gasLimit} SOL</span>
            </div>
            <div className="flex gap-2">
              <Slider
                id="gas-limit"
                min={0.001}
                max={0.1}
                step={0.001}
                value={[localSettings.gasLimit]}
                onValueChange={(value) => handleChange("gasLimit", value[0])}
              />
              <Input
                type="number"
                value={localSettings.gasLimit}
                onChange={(e) => handleChange("gasLimit", parseFloat(e.target.value) || 0)}
                className="w-20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="max-daily-trades">Max Daily Trades</Label>
              <span className="text-sm text-muted-foreground">{localSettings.maxDailyTradeCount}</span>
            </div>
            <div className="flex gap-2">
              <Slider
                id="max-daily-trades"
                min={1}
                max={100}
                step={1}
                value={[localSettings.maxDailyTradeCount]}
                onValueChange={(value) => handleChange("maxDailyTradeCount", value[0])}
              />
              <Input
                type="number"
                value={localSettings.maxDailyTradeCount}
                onChange={(e) => handleChange("maxDailyTradeCount", parseInt(e.target.value) || 0)}
                className="w-20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="max-daily-loss">Max Daily Loss ($)</Label>
              <span className="text-sm text-muted-foreground">${localSettings.maxDailyLoss}</span>
            </div>
            <div className="flex gap-2">
              <Slider
                id="max-daily-loss"
                min={5}
                max={500}
                step={5}
                value={[localSettings.maxDailyLoss]}
                onValueChange={(value) => handleChange("maxDailyLoss", value[0])}
              />
              <Input
                type="number"
                value={localSettings.maxDailyLoss}
                onChange={(e) => handleChange("maxDailyLoss", parseFloat(e.target.value) || 0)}
                className="w-20"
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-2 md:col-span-2">
          <Button 
            onClick={applyChanges} 
            className="flex-1 bg-gradient-1 hover:opacity-90"
          >
            <Zap className="mr-2 h-4 w-4" />
            Apply Changes
          </Button>
          <Button 
            onClick={resetChanges} 
            variant="outline" 
            className="flex-1"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskControls;
