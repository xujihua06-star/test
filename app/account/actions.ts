"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { accountClient } from "@/utils/supabase/server";

export async function logout() {
  const client = await accountClient();
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) redirect("/mypage?error=logout");
  redirect("/");
}

export async function updateNickname(formData: FormData) {
  const client = await accountClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");
  const nickname = String(formData.get("nickname") ?? "").trim();
  if (!nickname || nickname.length > 40) redirect("/mypage?error=nickname");
  const { data, error } = await client.from("profiles").update({ nickname }).eq("id", user.id).select("id").maybeSingle();
  if (error || !data) redirect("/mypage?error=update");
  revalidatePath("/");
  redirect("/mypage?saved=1");
}

export async function deleteAccount() {
  const client = await accountClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await client.rpc("delete_own_account");
  if (error) redirect("/mypage?error=delete");
  await client.auth.signOut({ scope: "local" });
  redirect("/");
}
