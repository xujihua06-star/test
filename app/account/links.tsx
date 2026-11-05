import Link from "next/link";
import { accountClient } from "@/utils/supabase/server";
import { logout } from "./actions";
import styles from "./account.module.css";

export function GuestLinks() {
  return <div className={styles.links}><Link href="/login">로그인</Link><Link href="/signup">회원가입</Link></div>;
}

export async function AccountLinks() {
  const client = await accountClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return <GuestLinks />;
  const { data: profile } = await client.from("profiles").select("nickname").eq("id", user.id).maybeSingle();

  return (
    <div className={styles.links}>
      {profile && <span className={styles.nickname}>{profile.nickname}님</span>}
      <Link href="/mypage">마이페이지</Link>
      <form action={logout}><button>로그아웃</button></form>
    </div>
  );
}
