// Risk / position-size math.
// Logic verified separately via calc-logic-test.js (run with plain `node`)
// before being wired into the UI — copied here verbatim, only the
// export style changed from CommonJS to ESM for use inside Next.js.

export function computeRisk({ accountBalance, riskPercent, entryPrice, stopPrice, targetPrice, direction }) {
  const errors = [];

  if (!(accountBalance > 0)) errors.push("Account balance must be greater than 0.");
  if (!(riskPercent > 0)) errors.push("Risk % must be greater than 0.");
  if (!(entryPrice > 0)) errors.push("Entry price must be greater than 0.");
  if (!(stopPrice > 0)) errors.push("Stop-loss price must be greater than 0.");

  if (errors.length) return { valid: false, errors };

  if (entryPrice === stopPrice) {
    errors.push("Stop-loss price can't be equal to entry price.");
  } else if (direction === "long" && stopPrice >= entryPrice) {
    errors.push("For a long position, stop-loss must be below entry price.");
  } else if (direction === "short" && stopPrice <= entryPrice) {
    errors.push("For a short position, stop-loss must be above entry price.");
  }

  if (errors.length) return { valid: false, errors };

  const riskAmount = accountBalance * (riskPercent / 100);
  const riskPerUnit = Math.abs(entryPrice - stopPrice);
  const positionSize = riskAmount / riskPerUnit;
  const positionValue = positionSize * entryPrice;
  const percentOfAccount = (positionValue / accountBalance) * 100;

  let riskReward = null;
  let rrError = null;
  if (targetPrice !== null && targetPrice !== undefined && targetPrice !== "") {
    if (!(targetPrice > 0)) {
      rrError = "Target price must be greater than 0.";
    } else {
      const rewardPerUnit = direction === "long" ? targetPrice - entryPrice : entryPrice - targetPrice;
      if (rewardPerUnit <= 0) {
        rrError =
          direction === "long"
            ? "Target should be above entry price for a long position."
            : "Target should be below entry price for a short position.";
      } else {
        riskReward = rewardPerUnit / riskPerUnit;
      }
    }
  }

  return {
    valid: true,
    errors: [],
    riskAmount,
    riskPerUnit,
    positionSize,
    positionValue,
    percentOfAccount,
    riskReward,
    rrError,
  };
}

// Risk gauge zones, expressed as a fraction of account risked per trade.
// Standard, widely-taught retail risk-management bands (not advice on any
// specific trade) — under 1% conservative, 1-3% moderate, above that aggressive.
export function riskZone(riskPercent) {
  if (riskPercent <= 1) return "safe";
  if (riskPercent <= 3) return "moderate";
  return "danger";
}
