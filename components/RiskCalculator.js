"use client";

import { useMemo, useState } from "react";
import { computeRisk, riskZone } from "@/lib/risk";
import styles from "./RiskCalculator.module.css";

const NAME = "VIKAS HANAMANT TALAWAR";
const EMAIL = "talawarh316@gmail.com";

const CURRENCIES = [
  { code: "INR", symbol: "₹" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
];

const ZONE_COLOR = {
  safe: "var(--risk-safe)",
  moderate: "var(--risk-moderate)",
  danger: "var(--risk-danger)",
};

function formatNumber(n, decimals = 2) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
}

export default function RiskCalculator() {
  const [direction, setDirection] = useState("long");
  const [currency, setCurrency] = useState("INR");
  const [accountBalance, setAccountBalance] = useState("10000");
  const [riskPercent, setRiskPercent] = useState("1");
  const [entryPrice, setEntryPrice] = useState("250");
  const [stopPrice, setStopPrice] = useState("245");
  const [targetPrice, setTargetPrice] = useState("260");

  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "₹";

  const result = useMemo(
    () =>
      computeRisk({
        accountBalance: parseFloat(accountBalance),
        riskPercent: parseFloat(riskPercent),
        entryPrice: parseFloat(entryPrice),
        stopPrice: parseFloat(stopPrice),
        targetPrice: targetPrice === "" ? null : parseFloat(targetPrice),
        direction,
      }),
    [accountBalance, riskPercent, entryPrice, stopPrice, targetPrice, direction]
  );

  const zone = result.valid ? riskZone(parseFloat(riskPercent)) : null;
  const zoneColor = zone ? ZONE_COLOR[zone] : undefined;

  return (
    <section className={styles.ticket} aria-label="Risk and position size calculator">
      <div className={styles.ticketHead}>
        <div className={styles.directionToggle} role="group" aria-label="Position direction">
          <button
            type="button"
            className={`${styles.toggleBtn} ${direction === "long" ? styles.toggleBtnActive : ""}`}
            onClick={() => setDirection("long")}
            aria-pressed={direction === "long"}
          >
            Long
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${direction === "short" ? styles.toggleBtnActive : ""}`}
            onClick={() => setDirection("short")}
            aria-pressed={direction === "short"}
          >
            Short
          </button>
        </div>
        <select
          className={styles.currencySelect}
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          aria-label="Currency"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} {c.code}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.fields}>
        <Field label="Account balance" symbol={symbol} value={accountBalance} onChange={setAccountBalance} />
        <Field label="Risk per trade" symbol="%" value={riskPercent} onChange={setRiskPercent} suffix />
        <Field label="Entry price" symbol={symbol} value={entryPrice} onChange={setEntryPrice} />
        <Field label="Stop-loss price" symbol={symbol} value={stopPrice} onChange={setStopPrice} />
        <Field
          label="Target price (optional)"
          symbol={symbol}
          value={targetPrice}
          onChange={setTargetPrice}
          optional
        />
      </div>

      <div className={styles.perforation} aria-hidden="true" />

      <div className={styles.resultsWrap}>
        {!result.valid ? (
          <div className={styles.errorBox} role="alert">
            <span className={styles.voidStamp}>Void</span>
            <p className={styles.errorTitle}>This ticket doesn&apos;t add up yet.</p>
            <ul className={styles.errorList}>
              {result.errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <div className={styles.gauge}>
              <div className={styles.gaugeLabelRow}>
                <span>Risk per trade</span>
                <span className={styles.gaugeReading} style={{ color: zoneColor }}>
                  {formatNumber(parseFloat(riskPercent), 2)}%
                </span>
              </div>
              <div className={styles.gaugeTrack}>
                <div
                  className={styles.gaugeFill}
                  style={{
                    width: `${Math.min(parseFloat(riskPercent), 10) * 10}%`,
                    backgroundColor: zoneColor,
                  }}
                />
              </div>
              <div className={styles.gaugeScaleRow}>
                <span>0%</span>
                <span>5%</span>
                <span>10%+</span>
              </div>
            </div>

            <div className={styles.heroResult}>
              <span className={styles.heroLabel}>Position size</span>
              <span className={styles.heroValue}>{formatNumber(result.positionSize, 4)}</span>
              <span className={styles.heroHint}>
                units · round down if your market doesn&apos;t allow fractional size
              </span>
            </div>

            <div className={styles.statGrid}>
              <Stat label="Amount at risk" value={`${symbol}${formatNumber(result.riskAmount)}`} />
              <Stat label="Capital deployed" value={`${symbol}${formatNumber(result.positionValue)}`} />
              <Stat label="% of account used" value={`${formatNumber(result.percentOfAccount)}%`} />
              <Stat
                label="Risk : reward"
                value={result.riskReward ? `1 : ${formatNumber(result.riskReward, 2)}` : "—"}
                hint={result.rrError}
              />
            </div>
          </>
        )}
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerIdentity}>
          <span className={styles.footerName}>{NAME}</span>
          <a className={styles.footerEmail} href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
        </div>
        <a
          className={styles.heroesBadge}
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Built for Digital Heroes
        </a>
      </footer>

      <p className={styles.disclaimer}>
        Educational risk-sizing tool, not financial advice — always do your own assessment before placing a trade.
      </p>
    </section>
  );
}

function Field({ label, symbol, value, onChange, optional, suffix }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldInputWrap}>
        {!suffix && <span className={styles.fieldAffix}>{symbol}</span>}
        <input
          className={styles.fieldInput}
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={optional ? "—" : "0"}
          step="any"
        />
        {suffix && <span className={styles.fieldAffixRight}>{symbol}</span>}
      </span>
    </label>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
      {hint && <span className={styles.statHint}>{hint}</span>}
    </div>
  );
}
