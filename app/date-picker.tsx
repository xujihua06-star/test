"use client";

import { useEffect, useState } from "react";
import styles from "./bloom.module.css";

const weekdays = ["월", "화", "수", "목", "금", "토", "일"];
const monthFormat = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", timeZone: "UTC" });
const dayFormat = new Intl.DateTimeFormat("ko-KR", { dateStyle: "full", timeZone: "UTC" });
const seoulFormat = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" });

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function DatePicker() {
  const [month, setMonth] = useState<Date>();
  const [today, setToday] = useState("");
  const [selected, setSelected] = useState<Date>();

  useEffect(() => {
    const parts = seoulFormat.formatToParts(new Date());
    const year = Number(parts.find((part) => part.type === "year")?.value);
    const currentMonth = Number(parts.find((part) => part.type === "month")?.value) - 1;
    const day = Number(parts.find((part) => part.type === "day")?.value);
    setToday(dayKey(new Date(Date.UTC(year, currentMonth, day))));
    setMonth(new Date(Date.UTC(year, currentMonth, 1)));
  }, []);

  function moveMonth(offset: number) {
    setMonth((current) => current && new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + offset, 1)));
  }

  const days = month ? Array.from({ length: 42 }, (_, index) => {
    const offset = (month.getUTCDay() + 6) % 7;
    return new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1 - offset + index));
  }) : [];

  return (
    <section id="calendar" className={styles.section + " " + styles.calendarSection} aria-labelledby="calendar-title">
      <p className={styles.eyebrow}>BLOOM CALENDAR</p>
      <h2 id="calendar-title">날짜 선택</h2>
      <p className={styles.copy}>달력에서 원하는 날짜를 골라 주세요.</p>
      <div className={styles.calendar}>
        <div className={styles.calendarSelection}>
          <div role="status">
            <p className={styles.eyebrow}>선택한 날짜</p>
            <strong>{selected ? dayFormat.format(selected) : "날짜를 골라 주세요"}</strong>
          </div>
          {selected && <button className={styles.outline} onClick={() => setSelected(undefined)}>선택 해제</button>}
        </div>
        <div className={styles.calendarHeader}>
          <button className={styles.outline} onClick={() => moveMonth(-1)} disabled={!month} aria-label="이전 달">←</button>
          <h3 id="calendar-month" aria-live="polite">{month ? monthFormat.format(month) : "달력 불러오는 중"}</h3>
          <button className={styles.outline} onClick={() => moveMonth(1)} disabled={!month} aria-label="다음 달">→</button>
        </div>
        <div className={styles.calendarGrid} aria-labelledby="calendar-month" role="group">
          {weekdays.map((day) => <span className={styles.weekday} key={day}>{day}</span>)}
          {days.map((day) => {
            const key = dayKey(day);
            const isSelected = selected ? dayKey(selected) === key : false;
            return (
              <button
                key={key}
                className={styles.calendarDay}
                data-outside={day.getUTCMonth() !== month?.getUTCMonth() || undefined}
                aria-label={dayFormat.format(day)}
                aria-current={key === today ? "date" : undefined}
                aria-pressed={isSelected}
                onClick={() => {
                  setSelected(day);
                  setMonth(new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1)));
                }}
              >
                {day.getUTCDate()}
                {isSelected && <span className={styles.calendarCheck} aria-hidden="true">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
