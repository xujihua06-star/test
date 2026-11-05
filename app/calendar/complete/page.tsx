import Link from "next/link";
import { Suspense } from "react";
import styles from "../../bloom.module.css";

type SearchParams = Promise<{ date?: string | string[] }>;
const dateFormat = new Intl.DateTimeFormat("ko-KR", { dateStyle: "full", timeZone: "UTC" });

async function Confirmation({ searchParams }: { searchParams: SearchParams }) {
  const { date } = await searchParams;
  const value = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
  const parsed = new Date(value + "T00:00:00Z");
  const valid = Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;

  return (
    <div className={styles.calendarCompletion}>
      <p className={styles.eyebrow}>BLOOM CALENDAR</p>
      <h1>{valid ? "✓ 선택 완료" : "날짜를 선택해 주세요"}</h1>
      {valid && <p className={styles.copy}>선택한 날짜 · <strong>{dateFormat.format(parsed)}</strong></p>}
      <Link href="/#calendar" className={styles.cta}>달력으로 돌아가기 <span aria-hidden="true">→</span></Link>
    </div>
  );
}

export default function CalendarComplete({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className={styles.site + " " + styles.calendarCompletePage}>
      <Suspense fallback={<p role="status">선택한 날짜를 불러오는 중입니다.</p>}>
        <Confirmation searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
