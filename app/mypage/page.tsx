import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { logout, updateNickname } from "../account/actions";
import DeleteForm from "../account/delete-form";
import { accountClient } from "@/utils/supabase/server";
import styles from "../account/account.module.css";

type SearchParams = Promise<{ saved?: string; error?: string }>;
const messages: Record<string, string> = {
  nickname: "닉네임은 1~40자로 입력해 주세요.",
  update: "닉네임을 저장하지 못했습니다.",
  delete: "탈퇴를 완료하지 못했습니다. 다시 시도해 주세요.",
  logout: "로그아웃하지 못했습니다. 다시 시도해 주세요.",
};

async function Profile({ searchParams }: { searchParams: SearchParams }) {
  const client = await accountClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await client.from("profiles").select("nickname").eq("id", user.id).maybeSingle();
  const { saved, error } = await searchParams;

  return (
    <section className={styles.panel} aria-labelledby="account-title">
      <header className={styles.profileHeader}>
        <Link className={styles.brand} href="/">BLOOM.</Link>
        <form action={logout}><button className={styles.secondary}>로그아웃</button></form>
      </header>
      <h1 id="account-title">마이페이지</h1>
      <p className={styles.email}>이메일 <strong>{user.email}</strong></p>
      {profile ? (
        <form className={styles.form} action={updateNickname}>
          <label>닉네임<input name="nickname" defaultValue={profile.nickname} maxLength={40} required /></label>
          <button className={styles.primary}>닉네임 저장</button>
        </form>
      ) : <p role="alert">프로필을 불러오지 못했습니다.</p>}
      {saved === "1" && <p role="status">닉네임을 저장했습니다.</p>}
      {error && Object.hasOwn(messages, error) && <p className={styles.error} role="alert">{messages[error]}</p>}
      <DeleteForm />
    </section>
  );
}

export default function MyPage({ searchParams }: { searchParams: SearchParams }) {
  return <main className={styles.screen}><Suspense fallback={<p role="status">마이페이지를 불러오는 중입니다.</p>}><Profile searchParams={searchParams} /></Suspense></main>;
}
