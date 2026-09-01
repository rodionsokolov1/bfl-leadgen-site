import type { Metadata } from "next";
import type { CSSProperties } from "react";

import { SiteFooter } from "@/components/home/SiteFooter";
import { Header } from "@/components/layout/Header";
import { ProgressiveFunnel } from "@/components/small-company/ProgressiveFunnel";
import { FinalTelegramCTA } from "@/components/small-company/FinalTelegramCTA";
import { ProofVideoTabs } from "@/components/small-company/ProofVideoTabs";
import { SmallPageAnalytics } from "@/components/small-company/SmallPageAnalytics";
import { FunnelIntro, SmallCompanyHero, TrustSection } from "@/components/small-company/StaticSections";
import { smallCompanyConfig } from "@/config/small-company";

import styles from "@/components/small-company/smallCompany.module.css";

export const metadata: Metadata = {
  title: "Диагностика воронки БФЛ — Родион Соколов",
  description: "Пошаговая диагностика воронки для частного юриста или небольшой БФЛ-компании.",
};

export default function QuizPage() {
  return (
    <main className={styles.page} style={{ "--accent": smallCompanyConfig.accent } as CSSProperties}>
      <SmallPageAnalytics />
      <div className={styles.top}>
        <div className={styles.frame}><Header accent={smallCompanyConfig.accent} homeHref="/" /></div>
      </div>
      <SmallCompanyHero />
      <FunnelIntro />
      <ProgressiveFunnel />
      <TrustSection />
      <ProofVideoTabs />
      <FinalTelegramCTA />
      <SiteFooter />
    </main>
  );
}
