// Pure calculation logic, mirrors what will go into the React component.
// Testing standalone with plain Node (no deps) since this sandbox has no
// network access to npm-install Next.js and run it for real.

function computeRisk({ accountBalance, riskPercent, entryPrice, stopPrice, targetPrice, direction }) {
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

function approxEqual(a, b, eps = 1e-6) {
  return Math.abs(a - b) < eps;
}

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("PASS:", msg);
  }
}

// Test 1: basic long position
{
  const r = computeRisk({
    accountBalance: 10000,
    riskPercent: 1,
    entryPrice: 250,
    stopPrice: 245,
    targetPrice: null,
    direction: "long",
  });
  assert(r.valid, "Test1: valid long position");
  assert(approxEqual(r.riskAmount, 100), "Test1: riskAmount = 100");
  assert(approxEqual(r.riskPerUnit, 5), "Test1: riskPerUnit = 5");
  assert(approxEqual(r.positionSize, 20), "Test1: positionSize = 20");
  assert(approxEqual(r.positionValue, 5000), "Test1: positionValue = 5000");
  assert(approxEqual(r.percentOfAccount, 50), "Test1: percentOfAccount = 50%");
}

// Test 2: long position with target -> risk reward
{
  const r = computeRisk({
    accountBalance: 10000,
    riskPercent: 1,
    entryPrice: 250,
    stopPrice: 245,
    targetPrice: 260,
    direction: "long",
  });
  assert(r.valid, "Test2: valid long with target");
  assert(approxEqual(r.riskReward, 2), "Test2: riskReward = 2 (1:2)");
}

// Test 3: short position with target
{
  const r = computeRisk({
    accountBalance: 10000,
    riskPercent: 1,
    entryPrice: 250,
    stopPrice: 255,
    targetPrice: 240,
    direction: "short",
  });
  assert(r.valid, "Test3: valid short with target");
  assert(approxEqual(r.riskPerUnit, 5), "Test3: riskPerUnit = 5");
  assert(approxEqual(r.riskReward, 2), "Test3: riskReward = 2 (1:2)");
}

// Test 4: invalid - stop on wrong side for long
{
  const r = computeRisk({
    accountBalance: 10000,
    riskPercent: 1,
    entryPrice: 250,
    stopPrice: 255,
    targetPrice: null,
    direction: "long",
  });
  assert(!r.valid, "Test4: invalid long (stop above entry)");
}

// Test 5: invalid - entry equals stop (division by zero guard)
{
  const r = computeRisk({
    accountBalance: 10000,
    riskPercent: 1,
    entryPrice: 250,
    stopPrice: 250,
    targetPrice: null,
    direction: "long",
  });
  assert(!r.valid, "Test5: invalid entry === stop");
}

// Test 6: invalid target on wrong side, base calc should still be valid
{
  const r = computeRisk({
    accountBalance: 10000,
    riskPercent: 1,
    entryPrice: 250,
    stopPrice: 245,
    targetPrice: 240,
    direction: "long",
  });
  assert(r.valid, "Test6: base position still valid even if target is bad");
  assert(r.riskReward === null, "Test6: riskReward null when target invalid");
  assert(!!r.rrError, "Test6: rrError message set");
}

// Test 7: realistic decimal example (crypto-style fractional units)
{
  const r = computeRisk({
    accountBalance: 50000,
    riskPercent: 2,
    entryPrice: 1800.5,
    stopPrice: 1755.25,
    targetPrice: 1900,
    direction: "long",
  });
  assert(r.valid, "Test7: valid decimal long");
  const expectedRiskAmount = 1000; // 2% of 50000
  assert(approxEqual(r.riskAmount, expectedRiskAmount), "Test7: riskAmount = 1000");
  const expectedRiskPerUnit = 1800.5 - 1755.25; // 45.25
  assert(approxEqual(r.riskPerUnit, expectedRiskPerUnit), "Test7: riskPerUnit = 45.25");
  const expectedPositionSize = expectedRiskAmount / expectedRiskPerUnit;
  assert(approxEqual(r.positionSize, expectedPositionSize), "Test7: positionSize matches manual calc");
}

console.log("\nAll checks ran.");
