import Link from "next/link";
import { cache } from "react";
import { accountClient } from "@/utils/supabase/server";
import { logout } from "./actions";
import styles from "./account.module.css";
import bloom from "../bloom.module.css";

export function GuestLinks() {
  return <div className={styles.links}><Link href="/login">로그인</Link><Link href="/signup">회원가입</Link></div>;
}

const getAccount = cache(async () => {
  const client = await accountClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;
  const { data: profile } = await client.from("profiles").select("nickname").eq("id", user.id).maybeSingle();
  return { nickname: profile?.nickname };
});

export async function AccountLinks() {
  const account = await getAccount();
  if (!account) return <GuestLinks />;

  return (
    <div className={styles.links}>
      {account.nickname && <span className={styles.nickname}>{account.nickname}님</span>}
      <Link href="/mypage">마이페이지</Link>
      <form action={logout}><button>로그아웃</button></form>
    </div>
  );
}

export async function AccountWelcome() {
  const account = await getAccount();
  if (!account) return null;

  return (
    <aside className={bloom.accountWelcome} aria-label="로그인 상태">
      <div>
        <p className={bloom.eyebrow}>BLOOM MEMBER</p>
        <strong>{account.nickname ? `${account.nickname}님, 반가워요!` : "BLOOM에 오신 것을 환영해요!"}</strong>
      </div>
      <Link className={bloom.outline} href="/mypage">마이페이지 ↗</Link>
    </aside>
  );
}
