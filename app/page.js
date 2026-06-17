import RiskCalculator from "@/components/RiskCalculator";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.intro}>
        <span className={styles.eyebrow}>Order ticket · before you click buy</span>
        <h1 className={styles.title}>Risk &amp; Position Size Calculator</h1>
        <p className={styles.subtitle}>
          Fill in your account size and where your stop sits — the ticket works out exactly
          how many units keeps you inside the risk you actually meant to take.
        </p>
      </div>
      <RiskCalculator />
    </main>
  );
}
