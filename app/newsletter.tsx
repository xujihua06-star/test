"use client";

import { useState, type FormEvent } from "react";
import styles from "./bloom.module.css";

export default function Newsletter() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const email = new FormData(form).get("email");
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      setMessage(result.message);
      if (response.ok) form.reset();
    } catch {
      setMessage("제출하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className={styles.section} aria-labelledby="newsletter-title">
      <p className={styles.eyebrow}>BLOOM NEWS</p>
      <h2 id="newsletter-title">BLOOM 소식 받기</h2>
      <p className={styles.copy} id="newsletter-description">동백마을 이야기와 BLOOM 소식을 받을 이메일을 남겨 주세요.</p>
      <form className={styles.newsletterForm} onSubmit={submit}>
        <label>이메일<input name="email" type="email" autoComplete="email" maxLength={254} aria-describedby="newsletter-description" required /></label>
        <button className={styles.cta} type="submit" disabled={pending}>{pending ? "제출 중…" : "소식 받기"}</button>
      </form>
      <p className={styles.copy} role="status">{message}</p>
    </section>
  );
}
