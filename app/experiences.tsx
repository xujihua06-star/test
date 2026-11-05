"use client";

import { useState } from "react";
import styles from "./experiences.module.css";
import bloom from "./bloom.module.css";

type Photo = { id: string; title: string };
type TourStop = Photo & { story: string; stamp: string; symbol: string };
type GiftProduct = { name: string; price: number; options: string[] };
type GiftItem = { name: string; price: number; option: string };
const image = (id: string) => "/bloom/" + id + ".webp";
const won = (price: number) => price.toLocaleString("ko-KR") + "원";

export function Postcard({ photos, date, setDate, completedTour }: { photos: Photo[]; date: string; setDate: (date: string) => void; completedTour: boolean }) {
  const [photoId, setPhotoId] = useState(photos[0].id);
  const [message, setMessage] = useState("");
  const [exportState, setExportState] = useState("");
  const [saving, setSaving] = useState(false);
  const photo = photos.find((item) => item.id === photoId) ?? photos[0];
  const dateLabel = date ? date.replaceAll("-", ".") : "";

  async function download() {
    setSaving(true);
    setExportState("");
    try {
      const picture = new Image();
      picture.src = image(photo.id);
      await picture.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 900;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");

      ctx.fillStyle = "#fbf8f2";
      ctx.fillRect(0, 0, 1200, 900);
      const scale = Math.max(1120 / picture.width, 605 / picture.height);
      const width = 1120 / scale;
      const height = 605 / scale;
      ctx.drawImage(picture, (picture.width - width) / 2, (picture.height - height) / 2, width, height, 40, 40, 1120, 605);
      ctx.fillStyle = "#784638";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText("BLOOM / JEJU POSTCARD", 52, 702);
      ctx.textAlign = "right";
      ctx.fillText(dateLabel, 1148, 702);
      ctx.textAlign = "left";
      ctx.fillStyle = "#392b25";
      ctx.font = '42px "Malgun Gothic", sans-serif';
      ctx.fillText(message.trim() || photo.title, 52, 797, completedTour ? 900 : 1096);
      if (completedTour) {
        ctx.save();
        ctx.translate(1080, 798);
        ctx.rotate(-0.12);
        ctx.strokeStyle = "#9a5145";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, 72, 51, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#9a5145";
        ctx.textAlign = "center";
        ctx.font = "bold 19px sans-serif";
        ctx.fillText("BLOOM", 0, -5);
        ctx.fillText("동백길 완주", 0, 22);
        ctx.restore();
      }

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Image export failed");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bloom-jeju-postcard.png";
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportState("엽서 저장을 시작했습니다.");
    } catch {
      setExportState("엽서를 저장하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={bloom.section + " " + styles.postcard} id="postcard" aria-labelledby="postcard-title">
      <p className={bloom.eyebrow}>BLOOM STUDIO / 01</p>
      <h2 id="postcard-title">나만의 제주 엽서.</h2>
      <div className={styles.postcardGrid}>
        <figure className={styles.cardPreview}>
          <img src={image(photo.id)} alt={photo.title} loading="lazy" />
          <figcaption>
            <div><span>BLOOM / JEJU POSTCARD</span><time dateTime={date || undefined}>{dateLabel}</time></div>
            <div className={styles.postcardMessage}>
              <p>{message.trim() || photo.title}</p>
              {completedTour && <span className={styles.postcardStamp}>BLOOM<br />동백길 완주</span>}
            </div>
          </figcaption>
        </figure>
        <div className={styles.fields}>
          <p className={bloom.copy}>마음에 드는 풍경에 한 줄을 더해 엽서로 간직해 보세요.</p>
          <label>갤러리 사진<select value={photoId} onChange={(event) => setPhotoId(event.target.value)}>{photos.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          <label>엽서 문구<input value={message} onChange={(event) => setMessage(event.target.value)} maxLength={44} placeholder="제주에서 보낸 하루" /></label>
          <label>엽서 날짜<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
          <a className={bloom.outline} href="#calendar">달력에서 날짜 고르기</a>
          <button type="button" className={bloom.cta} onClick={download} disabled={saving}>{saving ? "엽서 만드는 중…" : "PNG 엽서 저장 ↓"}</button>
          <p className={bloom.copy} role="status">{exportState}</p>
        </div>
      </div>
    </section>
  );
}

export function PhotoTour({ stops, stamps, onStamp, complete, discountRate }: {
  stops: TourStop[];
  stamps: string[];
  onStamp: (id: string) => void;
  complete: boolean;
  discountRate: number;
}) {
  const [index, setIndex] = useState(0);
  const stop = stops[index];
  return (
    <section className={bloom.section + " " + styles.tour} id="photo-tour" aria-labelledby="tour-title">
      <p className={bloom.eyebrow}>BLOOM STUDIO / 02</p>
      <h2 id="tour-title">동백길 포토 투어.</h2>
      <div className={styles.tourCard}>
        <img src={image(stop.id)} alt={stop.title} loading="lazy" />
        <div className={styles.tourContent}>
          <div aria-live="polite">
            <p className={bloom.eyebrow}>STOP {String(index + 1).padStart(2, "0")} / {String(stops.length).padStart(2, "0")}</p>
            <h3>{stop.title}</h3>
            <p className={bloom.copy}>{stop.story}</p>
          </div>
          <div className={styles.tourControls}>
            <button type="button" className={bloom.outline} disabled={index === 0} onClick={() => setIndex(index - 1)}>← 이전</button>
            <button type="button" className={bloom.outline} disabled={index === stops.length - 1} onClick={() => setIndex(index + 1)}>다음 →</button>
          </div>
          <button type="button" className={bloom.cta} disabled={stamps.includes(stop.id)} onClick={() => onStamp(stop.id)}>
            {stamps.includes(stop.id) ? "✓ 도장 받았어요" : "도장 찍기"}
          </button>
        </div>
      </div>
      <div className={styles.stampBook}>
        <p className={bloom.eyebrow}>BLOOM STAMP BOOK</p>
        <h3>동백길 스탬프북</h3>
        <p className={bloom.copy}>도장 {stops.length}개를 모으면 완주 엽서와 굿즈 {discountRate}% 할인이 열려요.</p>
        <ul className={styles.stampSlots}>
          {stops.map(({ id, stamp, symbol }) => (
            <li key={id} data-collected={stamps.includes(id)}>
              <span aria-hidden="true">{stamps.includes(id) ? symbol : "○"}</span>
              <strong>{stamp}</strong>
              <small>{stamps.includes(id) ? "획득" : "미획득"}</small>
            </li>
          ))}
        </ul>
        <p role="status">{complete ? "동백길 완주!" : "완주까지 " + stamps.length + " / " + stops.length}</p>
        {complete && <div className={styles.stampLinks}>
          <a className={bloom.cta} href="#postcard">완주 엽서 만들기 ↗</a>
          <a className={bloom.cta} href="#collection">굿즈 둘러보기 ↗</a>
        </div>}
      </div>
    </section>
  );
}

const swatches = [
  { color: "#df6670", x: "21%", y: "49%" },
  { color: "#a9ae39", x: "49%", y: "64%" },
  { color: "#4d89b9", x: "78%", y: "49%" },
];

export function KeyringPreview({ options, selected, onSelect }: { options: string[]; selected: string; onSelect: (option: string) => void }) {
  const spot = swatches[options.indexOf(selected)];
  return (
    <div className={styles.keyring}>
      <div className={styles.keyringImage}>
        <img src="/bloom/keyring.webp?v=flower" alt={"꽃 키링 3종. 선택한 색상은 " + selected} loading="lazy" />
        {spot && <span aria-hidden="true" className={styles.spotlight} style={{ background: "radial-gradient(ellipse 24% 47% at " + spot.x + " " + spot.y + ", transparent 64%, #22171080 100%)" }} />}
      </div>
      <div className={styles.swatches} role="group" aria-label="키링 색상 미리보기">
        {options.map((option, index) => (
          <button type="button" key={option} aria-pressed={option === selected} onClick={() => onSelect(option)}>
            <span aria-hidden="true" style={{ background: swatches[index]?.color }} />{option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function GiftBuilder({ products, onAdd }: { products: GiftProduct[]; onAdd: (items: GiftItem[]) => void }) {
  const [choices, setChoices] = useState<Record<string, string>>({});
  const items = products.flatMap(({ name, price }) => choices[name] ? [{ name, price, option: choices[name] }] : []);
  return (
    <section className={bloom.section + " " + styles.gift} id="gift" aria-labelledby="gift-title">
      <p className={bloom.eyebrow}>BLOOM STUDIO / 03</p>
      <h2 id="gift-title">선물 조합 만들기.</h2>
      <p className={bloom.copy}>선물할 상품과 옵션을 고르면 한 번에 장바구니에 담을 수 있어요.</p>
      <div className={styles.giftGrid}>
        {products.map((product) => (
          <label className={styles.fields} key={product.name}>
            <strong>{product.name}</strong><span>{won(product.price)}</span>
            <select value={choices[product.name] ?? ""} onChange={(event) => setChoices({ ...choices, [product.name]: event.target.value })}>
              <option value="">선물에 넣지 않기</option>
              {product.options.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        ))}
      </div>
      <div className={styles.giftTotal}>
        <strong role="status">상품 {items.length}개 · {won(items.reduce((total, item) => total + item.price, 0))}</strong>
        <button type="button" className={bloom.cta} disabled={!items.length} onClick={() => onAdd(items)}>선물 조합 담기 ↗</button>
      </div>
    </section>
  );
}
