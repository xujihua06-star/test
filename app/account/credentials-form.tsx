"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { browserClient } from "@/utils/supabase/browser";
import styles from "./account.module.css";

export default function CredentialsForm({ signup = false }: { signup?: boolean }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const title = signup ? "회원가입" : "로그인";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const nickname = String(form.get("nickname") ?? "").trim();
    setError("");
    if (signup && !nickname) {
      setError("닉네임을 입력해 주세요.");
      return;
    }
    setPending(true);
    try {
      const client = browserClient();
      const result = signup
        ? await client.auth.signUp({ email, password, options: { data: { nickname } } })
        : await client.auth.signInWithPassword({ email, password });
      if (!result.error && (signup ? result.data.user : result.data.session)) {
        if (signup && result.data.session) {
          await fetch("/api/newsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ source: "signup" }),
          }).catch(() => {});
        }
        window.location.assign("/");
        return;
      }
      if (!signup) {
        setError("이메일 또는 비밀번호가 틀렸습니다");
      } else if (result.error?.code === "user_already_exists") {
        setError("이미 가입된 이메일입니다.");
      } else if (result.error?.code === "weak_password") {
        setError("다른 비밀번호를 입력해 주세요.");
      } else {
        setError("회원가입을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } catch {
      setError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className={styles.screen}>
      <section className={styles.panel} aria-labelledby="account-title">
        <Link className={styles.brand} href="/">BLOOM.</Link>
        <h1 id="account-title">{title}</h1>
        <form className={styles.form} method="post" onSubmit={submit}>
          <label>이메일<input name="email" type="email" autoComplete="email" required /></label>
          <label>비밀번호<input name="password" type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={signup ? 6 : undefined} required /></label>
          {signup && <label>닉네임<input name="nickname" autoComplete="nickname" maxLength={40} required /></label>}
          {signup && <p>가입한 이메일은 회원가입 기록을 위해 저장됩니다.</p>}
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button className={styles.primary} disabled={pending}>{pending ? "처리 중…" : title}</button>
        </form>
        <Link className={styles.secondary} href={signup ? "/login" : "/signup"}>{signup ? "로그인" : "회원가입"}</Link>
      </section>
    </main>
  );
}
