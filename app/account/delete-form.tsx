"use client";

import { deleteAccount } from "./actions";
import { useTransition } from "react";
import styles from "./account.module.css";

export default function DeleteForm() {
  const [pending, startTransition] = useTransition();
  return (
    <button type="button" className={styles.danger} disabled={pending} onClick={() => {
      if (window.confirm("회원 탈퇴를 진행할까요? 계정과 프로필이 삭제됩니다.")) {
        startTransition(deleteAccount);
      }
    }}>회원 탈퇴</button>
  );
}
