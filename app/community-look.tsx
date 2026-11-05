"use client";

import { useEffect, useState, type FormEvent } from "react";
import bloom from "./bloom.module.css";
import styles from "./experiences.module.css";

const storageKey = "bloom-community-tote-v1";
const reactions = [
  { id: "love", emoji: "🌺", label: "좋아요" },
  { id: "style", emoji: "✨", label: "코디가 멋져요" },
  { id: "jeju", emoji: "🫧", label: "제주 감성" },
];
const examples = [
  { name: "동백산책", text: "티셔츠랑 토트백의 꽃무늬가 잘 어울려요 🌺" },
  { name: "제주한컷", text: "비눗방울까지 있어서 산책하는 기분이 들어요 🫧" },
];
type Comment = { name: string; text: string };
type Activity = { reactions: string[]; comments: Comment[] };

export default function CommunityLook() {
  const [activity, setActivity] = useState<Activity>({ reactions: [], comments: [] });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      if (Array.isArray(stored?.reactions) && Array.isArray(stored?.comments)) {
        setActivity({
          reactions: reactions.filter(({ id }) => stored.reactions.includes(id)).map(({ id }) => id),
          comments: stored.comments.filter((comment: Comment) =>
            typeof comment?.name === "string" && typeof comment?.text === "string"
          ),
        });
      }
    } catch {
      // Reactions and comments can still be used during this visit.
    }
  }, []);

  function update(next: Activity) {
    setActivity(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Keep the update for this visit.
    }
  }

  function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim() || "나";
    const text = String(data.get("comment") ?? "").trim();
    if (!text) return;
    update({ ...activity, comments: [...activity.comments, { name, text }] });
    form.reset();
  }

  return (
    <article className={styles.communityLook} aria-labelledby="community-look-title">
      <img src="/bloom/community-tote.webp" alt="동백나무 아래에서 비눗방울을 불며 꽃무늬 토트백을 멘 모습" loading="lazy" />
      <div className={styles.communityLookBody}>
        <p className={bloom.eyebrow}>COMMUNITY LOOK / 예시 게시글</p>
        <h3 id="community-look-title">비눗방울과 꽃무늬 토트백</h3>
        <p className={bloom.copy}>동백길에서 보낸 오후. 꽃무늬 티셔츠에 토트백을 맞춰 들었어요!</p>
        <div className={styles.lookReactions} role="group" aria-label="게시글 리액션">
          {reactions.map(({ id, emoji, label }) => {
            const pressed = activity.reactions.includes(id);
            return <button key={id} type="button" className={bloom.outline} aria-pressed={pressed} onClick={() => update({
              ...activity,
              reactions: pressed ? activity.reactions.filter((reaction) => reaction !== id) : [...activity.reactions, id],
            })}>{emoji} {label}</button>;
          })}
        </div>
        <h4>댓글</h4>
        <ul className={styles.lookComments} aria-live="polite">
          {examples.map(({ name, text }) => <li key={name}><strong>{name}</strong> <small>예시</small><p>{text}</p></li>)}
          {activity.comments.map(({ name, text }, index) => <li key={index}><strong>{name}</strong><p>{text}</p></li>)}
        </ul>
        <form className={styles.fields} onSubmit={submitComment}>
          <label>닉네임<input name="name" maxLength={24} placeholder="나" /></label>
          <label>댓글<input name="comment" maxLength={200} placeholder="코디에 한마디 남겨 보세요" required pattern=".*\S.*" /></label>
          <button className={bloom.cta} type="submit">댓글 남기기</button>
        </form>
        <p className={bloom.note}>리액션과 댓글은 이 브라우저에 저장됩니다.</p>
      </div>
    </article>
  );
}
