"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import styles from "./bloom.module.css";
import DatePicker from "./date-picker";
import { GiftBuilder, KeyringPreview, PhotoTour, Postcard } from "./experiences";

const sections = [
  ["village", "VILLAGE GALLERY"],
  ["postcard", "JEJU POSTCARD"],
  ["collection", "COLLECTION"],
  ["photo-tour", "PHOTO TOUR"],
  ["community", "COMMUNITY"],
  ["calendar", "CALENDAR"],
];

const archive = [
  ["archive-camellia", "CAMELLIA MOMENTS", "동백꽃의 순간"],
  ["archive-bloom", "BLOOM IN JEJU", "제주에 피어난 꽃"],
  ["archive-village", "VILLAGE STORIES", "동백마을 이야기"],
];

const photos = [
  ["camellia", "햇살에 핀 붉은 동백", "동백꽃", "짙은 초록 잎 사이로 피어난 동백꽃"],
  ["stone-house", "동백이 있는 돌담집", "마을 풍경", "동백나무와 제주 돌담이 어우러진 집"],
  ["sea", "제주의 푸른 바다", "제주 자연", "유채꽃 너머로 펼쳐지는 제주 바다"],
  ["alley", "동백꽃이 흐르는 골목", "마을 풍경", "붉은 꽃이 이어지는 조용한 돌담길"],
  ["sunset", "노을빛 제주 해안", "제주 자연", "하루 끝의 따뜻한 바다 풍경"],
  ["meadow", "바람 부는 초원", "제주 자연", "바람과 풍차가 있는 제주 들판"],
  ["village-road", "마을로 가는 길", "마을 풍경", "돌담과 동백이 반기는 마을길"],
  ["dolhareubang", "동백과 돌하르방", "동백꽃", "제주의 상징과 동백꽃이 만난 풍경"],
  ["tangerine", "귤나무 아래 돌집", "마을 풍경", "귤나무와 오래된 제주 돌집"],
  ["lighthouse", "해안의 작은 등대", "제주 자연", "푸른 바다와 흰 등대가 있는 풍경"],
];

const products = [
  { id: "cardigan", label: "01 / WEAR", name: "플라워 가디건", price: 62000, options: ["S", "M", "L"] },
  { id: "puzzle", label: "02 / PLAY", name: "BLOOM 퍼즐", price: 25000, options: ["퍼즐 + 보관 패키지"] },
  { id: "keyring", label: "03 / KEEP", name: "BLOOM 키링", price: 9900, options: ["Camellia Pink", "Nature Lime", "Jeju Blue"] },
];
const outfit = { name: "BLOOM 재킷·팬츠 세트", price: 129000, options: ["S", "M", "L"] };
const postcardPhotos = photos.map(([id, title]) => ({ id, title }));
const tourStops = [
  { id: "alley", stamp: "돌담길", symbol: "▧", title: "붉은 꽃이 이어지는 돌담길", story: "검은 돌담 사이로 붉은 동백이 이어집니다. 골목을 따라가며 발밑에 내려앉은 꽃잎도 찾아보세요." },
  { id: "camellia", stamp: "동백꽃", symbol: "✿", title: "가까이에서 만나는 동백", story: "짙은 초록 잎 사이, 붉은 꽃잎 가운데 노란 꽃술이 보입니다. 걸음을 멈추면 멀리서는 보이지 않던 색이 드러납니다." },
  { id: "sea", stamp: "제주 바다", symbol: "≈", title: "골목 끝에서 만나는 바다", story: "유채꽃 너머로 바다가 펼쳐집니다. 돌담길에서 시작한 산책을 수평선을 바라보며 마무리해 보세요." },
];
const stampKey = "bloom-tour-stamps";
const stampRate = 10;
type BagProduct = { name: string; price: number; option: string };
type BagItem = BagProduct & { quantity: number };
const bagKey = "bloom-bag-v1";
const coupon = { minimum: 50000, amount: 5000 };

const categories = ["전체", "동백꽃", "마을 풍경", "제주 자연", "저장한 사진"];
const highlights = [
  { id: "village", number: "01", image: "alley", label: "THE PHOTO ARCHIVE", title: "동백꽃 따라 걷는 길", description: "붉은 동백과 검은 돌담이 만나는 마을의 장면들" },
  { id: "collection", number: "02", image: "puzzle", label: "THE COLLECTION", title: "제주를 간직하는 방법", description: "가디건, 퍼즐, 키링에 담은 여행의 기억" },
  { id: "community", number: "03", image: "sunset", label: "YOUR MOMENTS", title: "나만의 제주 한 컷", description: "내가 만난 제주의 순간을 사진으로 남기기" },
];
const favoritesKey = "bloom-favorites";
const asset = (name: string) => "/bloom/" + name + ".webp";
const won = (amount: number) => "₩" + amount.toLocaleString("ko-KR");

function Heading({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return (
    <div className={styles.heading}>
      <div><p className={styles.eyebrow}>{label}</p><h2>{title}</h2></div>
      <p className={styles.copy}>{children}</p>
    </div>
  );
}

export default function Home() {
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>();
  const [bag, setBag] = useState<BagItem[]>([]);
  const [bagLoaded, setBagLoaded] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [stamps, setStamps] = useState<string[]>([]);
  const [preview, setPreview] = useState<{ title: string; urls: string[] }>();
  const [message, setMessage] = useState("");
  const [postcardDate, setPostcardDate] = useState("");
  const [keyringColor, setKeyringColor] = useState(products[2].options[0]);
  const photoDialog = useRef<HTMLDialogElement>(null);
  const bagDialog = useRef<HTMLDialogElement>(null);
  const previewUrls = useRef<string[]>([]);

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(stampKey) ?? "[]");
      if (Array.isArray(stored)) setStamps(tourStops.filter((stop) => stored.includes(stop.id)).map((stop) => stop.id));
    } catch {
      // Keep the stamp book available without storage.
    }
  }, []);

  function collectStamp(id: string) {
    if (stamps.includes(id)) return;
    const next = [...stamps, id];
    setStamps(next);
    try {
      localStorage.setItem(stampKey, JSON.stringify(next));
    } catch {
      // Keep stamps for this visit.
    }
  }

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(favoritesKey) ?? "[]");
      if (Array.isArray(stored)) setFavorites(stored.filter((item): item is string => typeof item === "string"));
    } catch {
      // The gallery remains available when storage is disabled.
    }
    return () => previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function savePhoto(id: string) {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
    setFavorites(next);
    try {
      localStorage.setItem(favoritesKey, JSON.stringify(next));
    } catch {
      // Keep the selection in memory for this visit.
    }
  }

  function showPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const nickname = String(data.get("nickname") ?? "").trim();
    const files = data.getAll("photos").filter((item): item is File => item instanceof File && item.name !== "");
    if (!title || !nickname) {
      setMessage("사진 제목과 닉네임을 입력해 주세요.");
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!files.length || files.length > 5 || files.some((file) => !allowed.includes(file.type) || file.size > 10 * 1024 * 1024)) {
      setMessage("JPG, PNG, WebP 사진을 장당 10MB 이하로 1~5장 선택해 주세요.");
      return;
    }
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.current = files.map((file) => URL.createObjectURL(file));
    setPreview({ title: title + " · " + nickname, urls: previewUrls.current });
    setMessage("");
  }

  const visiblePhotos = photos.filter(([id, title, group]) => {
    const matchesCategory = category === "전체" || group === category || (category === "저장한 사진" && favorites.includes(id));
    return matchesCategory && title.toLowerCase().includes(query.trim().toLowerCase());
  });
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(bagKey) ?? "[]");
      if (Array.isArray(saved)) {
        setBag(saved.filter((item): item is BagItem =>
          item && typeof item.name === "string" && typeof item.option === "string" &&
          Number.isSafeInteger(item.price) && item.price >= 0 &&
          Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 99
        ));
      }
    } catch {
      // The bag still works when browser storage is unavailable.
    }
    setBagLoaded(true);
  }, []);

  useEffect(() => {
    if (!bagLoaded) return;
    try {
      localStorage.setItem(bagKey, JSON.stringify(bag));
    } catch {
      // Keep the bag in memory for this visit.
    }
  }, [bag, bagLoaded]);

  const subtotal = bag.reduce((total, item) => total + item.price * item.quantity, 0);
  const bagCount = bag.reduce((total, item) => total + item.quantity, 0);
  const shipping = subtotal > 0 && subtotal < 50000 ? 3000 : 0;
  const couponEligible = subtotal >= coupon.minimum;
  const tourComplete = tourStops.every(({ id }) => stamps.includes(id));
  const stampDiscount = tourComplete ? Math.floor(subtotal * stampRate / 100) : 0;
  const couponDiscount = couponApplied && couponEligible ? coupon.amount : 0;
  const discount = Math.max(couponDiscount, stampDiscount);
  const stampWins = stampDiscount > 0 && stampDiscount >= couponDiscount;

  function addToBag(...additions: BagProduct[]) {
    setBag((current) => additions.reduce((items, item) => {
      const index = items.findIndex((entry) => entry.name === item.name && entry.option === item.option);
      if (index === -1) return [...items, { ...item, quantity: 1 }];
      return items.map((entry, position) => position === index
        ? { ...item, quantity: Math.min(entry.quantity + 1, 99) }
        : entry);
    }, current));
    bagDialog.current?.showModal();
  }

  function changeQuantity(index: number, delta: number) {
    setBag((items) => items.map((item, position) => position === index
      ? { ...item, quantity: Math.min(99, Math.max(1, item.quantity + delta)) }
      : item));
  }

  return (
    <div className={styles.site}>
      <header className={styles.header}>
        <a className={styles.brand} href="#home">BLOOM<span>.</span></a>
        <nav aria-label="주 메뉴">
          {sections.map(([id, label]) => <a key={id} href={"#" + id}>{label}</a>)}
        </nav>
        <button className={styles.outline} onClick={() => bagDialog.current?.showModal()} aria-label={"장바구니 " + bagCount + "개"}>BAG <span>{bagCount}</span></button>
      </header>
      <main>
        <section className={styles.hero} id="home">
          <div className={styles.intro}>
            <p className={styles.eyebrow}>JEJU DONGBAEK VILLAGE</p>
            <h1>BL<em>OO</em>M<span>.</span></h1>
            <p className={styles.tagline}>제주의 순간을,<br />일상에 피우다.</p>
            <p className={styles.copy}>동백마을의 아름다운 풍경을 기록하고<br />작은 마을의 이야기를 일상으로 가져가세요.</p>
            <div className={styles.heroActions}>
              <a className={styles.cta} href="#village">동백마을 둘러보기 <span aria-hidden="true">↗</span></a>
              <a className={styles.textLink} href="#collection">컬렉션 보기 <span aria-hidden="true">→</span></a>
            </div>
          </div>
          <img className={styles.heroImage} src={asset("hero")} alt="BLOOM 제주 동백마을 캠페인" fetchPriority="high" />
          <span className={styles.heroIndex}>01 / JEJU ISLAND</span>
        </section>

        <section className={styles.highlights + " " + styles.section} aria-labelledby="highlights-title">
          <div className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>THE BLOOM EDIT / JEJU</p>
              <h2 id="highlights-title">제주를 만나는 세 가지 순간.</h2>
            </div>
            <p className={styles.copy}>동백길을 따라 걷고, 마음에 남은 풍경을<br />나만의 방식으로 간직해 보세요.</p>
          </div>
          <div className={styles.grid}>
            {highlights.map(({ id, number, image, label, title, description }) => (
              <a href={"#" + id} className={styles.highlight} key={id}>
                <img src={asset(image)} alt="" loading="lazy" />
                <div className={styles.highlightBody}>
                  <p className={styles.eyebrow}>{number} / {label}</p>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <span className={styles.highlightArrow} aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>

        <section className={styles.archive + " " + styles.section} id="archive">
          <Heading label="01 / THE ARCHIVE" title="Moments of Jeju.">동백이 피어나는 순간부터 마을의 일상까지,<br />제주의 장면을 담았습니다.</Heading>
          <div className={styles.grid}>
            {archive.map(([id, label, alt], index) => (
              <figure className={styles.archiveTile} key={id}>
                <img src={asset(id)} alt={alt} loading="lazy" />
                <figcaption><span>0{index + 1} /</span> {label}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className={styles.village + " " + styles.section} id="village">
          <Heading label="JEJU DONGBAEK VILLAGE / PHOTO ARCHIVE" title="동백마을 갤러리.">꽃이 피는 골목, 제주의 바람, 마을의 일상.<br />동백마을의 순간을 사진으로 만나보세요.</Heading>
          <div className={styles.controls}>
            <div className={styles.filters} aria-label="사진 분류">
              {categories.map((item) => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item === "저장한 사진" ? "♡ " : ""}{item}</button>)}
            </div>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="사진 제목 검색" aria-label="사진 제목 검색" />
          </div>
          <p className={styles.results} role="status">{visiblePhotos.length}장의 사진 <span> / 전체 {photos.length}장</span></p>
          <div className={styles.grid}>
            {visiblePhotos.map((photo) => {
              const [id, title, group, description] = photo;
              const saved = favorites.includes(id);
              return (
                <article className={styles.card} key={id}>
                  <button className={styles.photoButton} aria-label={title + " 확대"} onClick={() => { setSelected(photo); photoDialog.current?.showModal(); }}>
                    <img src={asset(id)} alt={title} loading="lazy" />
                  </button>
                  <div className={styles.cardBody}>
                    <p className={styles.eyebrow}>{group}</p><h3>{title}</h3><p className={styles.copy}>{description}</p>
                    <button className={styles.outline} aria-pressed={saved} onClick={() => savePhoto(id)}>{saved ? "♥ 저장됨" : "♡ 즐겨찾기"}</button>
                  </div>
                </article>
              );
            })}
          </div>
          {!visiblePhotos.length && <p className={styles.empty} role="status">조건에 맞는 사진이 없습니다.</p>}
          <p className={styles.note}>갤러리의 풍경은 시연용 예시 이미지입니다. 즐겨찾기는 현재 브라우저에 저장됩니다.</p>
        </section>

        <PhotoTour stops={tourStops} stamps={stamps} onStamp={collectStamp} complete={tourComplete} discountRate={stampRate} />
        <Postcard photos={postcardPhotos} date={postcardDate} setDate={setPostcardDate} completedTour={tourComplete} />
        <section className={styles.collection + " " + styles.section} id="collection">
          <Heading label="02 / THE COLLECTION" title="Take Jeju Home.">제주의 기억을 오래 간직하는<br />BLOOM 의류와 소품.</Heading>
          <aside className={styles.collectionCoupon} aria-label="할인 쿠폰 안내">
            <div>
              <p className={styles.eyebrow}>BLOOM COUPON</p>
              <strong>{won(coupon.amount)} 할인 쿠폰</strong>
              <p className={styles.copy}>상품 합계 {won(coupon.minimum)} 이상이면 장바구니에서 적용할 수 있어요.</p>
            </div>
            <button className={styles.cta} type="button" onClick={() => bagDialog.current?.showModal()}>
              장바구니에서 쿠폰 보기 <span aria-hidden="true">↗</span>
            </button>
          </aside>
          <p className={styles.stampOffer}><a href="#photo-tour">동백길 스탬프북 완주 혜택 · 굿즈 {stampRate}% 할인 ↗</a></p>
          <div className={styles.grid}>
            {products.map((product) => (
              <article className={styles.card} key={product.id}>
                {product.id === "keyring"
                  ? <KeyringPreview options={product.options} selected={keyringColor} onSelect={setKeyringColor} />
                  : <img src={asset(product.id)} alt={product.name} loading="lazy" />}
                <form className={styles.cardBody} onSubmit={(event) => {
                  event.preventDefault();
                  const option = String(new FormData(event.currentTarget).get("option"));
                  addToBag({ name: product.name, price: product.price, option });
                }}>
                  <p className={styles.eyebrow}>{product.label}</p><h3>{product.name}</h3><p className={styles.copy}>{won(product.price)}</p>
                  <select name="option" aria-label={product.name + " 옵션"} value={product.id === "keyring" ? keyringColor : undefined} onChange={product.id === "keyring" ? (event) => setKeyringColor(event.target.value) : undefined}>{product.options.map((option) => <option key={option}>{option}</option>)}</select>
                  <button className={styles.cta}>ADD TO BAG <span aria-hidden="true">↗</span></button>
                </form>
              </article>
            ))}
          </div>
          <article className={styles.editorial}>
            <img src={asset("fashion-editorial")} alt="제주 바다와 동백꽃을 배경으로 한 BLOOM 패션 화보와 소품 디테일" loading="lazy" />
            <form onSubmit={(event) => {
              event.preventDefault();
              const option = String(new FormData(event.currentTarget).get("size"));
              addToBag({ name: outfit.name, price: outfit.price, option });
            }}>
              <p className={styles.eyebrow}>04 / WEAR</p>
              <h3>{outfit.name}</h3>
              <p className={styles.copy}>동백꽃을 모티프로 한 차콜 재킷과 와이드 팬츠 세트입니다.</p>
              <p className={styles.editorialStatus}>{won(outfit.price)} · 재킷 + 팬츠</p>
              <label>사이즈 <select name="size">{outfit.options.map((size) => <option key={size}>{size}</option>)}</select></label>
              <button className={styles.cta}>ADD TO BAG <span aria-hidden="true">↗</span></button>
            </form>
          </article>
          <p className={styles.note}>상품과 가격은 시연용입니다. 장바구니에서 예상 배송비와 합계를 확인할 수 있습니다.</p>
        </section>

        <GiftBuilder products={[...products, outfit]} onAdd={(items) => addToBag(...items)} />
        <section className={styles.story + " " + styles.section} id="story">
          <img src={asset("story")} alt="제주 동백마을에서 영감을 받은 BLOOM 이야기" loading="lazy" />
          <div>
            <p className={styles.eyebrow}>03 / OUR STORY</p>
            <h2>A little village,<br />a lot of bloom.</h2>
            <p className={styles.copy}>제주 동백마을의 소박한 풍경에서 시작된 BLOOM.<br />꽃이 피어나는 순간처럼 여행의 기억도 저마다의 방식으로 오래 남습니다.</p>
            <a href="#community" className={styles.cta}>SHARE YOUR MOMENT <span aria-hidden="true">↗</span></a>
          </div>
        </section>

        <section className={styles.community + " " + styles.section} id="community">
          <p className={styles.eyebrow}>04 / YOUR MOMENTS</p>
          <h2>Share your bloom.</h2>
          <p className={styles.copy}>당신이 만난 동백마을의 순간을 사진으로 남겨 보세요.</p>
          <form className={styles.upload} onSubmit={showPreview}>
            <label>사진 제목<input name="title" placeholder="제주의 어느 오후" required /></label>
            <label>닉네임<input name="nickname" placeholder="닉네임" required /></label>
            <label>사진 선택<input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple required /></label>
            <button className={styles.cta}>사진 미리보기 <span aria-hidden="true">↗</span></button>
            <p className={styles.note}>최대 5장, 장당 10MB. 사진은 현재 기기에서 미리보기로 표시됩니다.</p>
            {message && <p role="alert">{message}</p>}
          </form>
          {preview && <div className={styles.preview}><h3>{preview.title}</h3><div>{preview.urls.map((url, index) => <img key={url} src={url} alt={"선택한 사진 " + (index + 1)} />)}</div></div>}
        </section>
        <DatePicker onSelect={setPostcardDate} />
        {postcardDate && <div className={styles.calendarReturn}><a className={styles.outline} href="#postcard">고른 날짜로 엽서 만들기 ↗</a></div>}
      </main>

      <footer className={styles.footer}>
        <div><a className={styles.brand} href="#home">BLOOM.</a><p>제주의 순간을, 일상에 피우다.</p></div>
        <nav aria-label="하단 메뉴">
          <a href="#village">동백마을 갤러리</a>
          <a href="#collection">컬렉션</a>
          <a href="#community">나만의 제주 한 컷</a>
        </nav>
        <div className={styles.footerEnd}><a href="#home">맨 위로 ↑</a><p>© 2026 BLOOM · 시연용</p></div>
      </footer>
      <nav className={styles.mobile} aria-label="모바일 메뉴"><a href="#home">HOME</a><a href="#photo-tour">포토 투어</a><a href="#postcard">제주 엽서</a><a href="#collection">SHOP</a><a href="#calendar">날짜 선택</a></nav>

      <dialog className={styles.lightbox} ref={photoDialog} aria-label="사진 확대">
        <form method="dialog"><button className={styles.outline}>닫기 ✕</button></form>
        {selected && <figure><img src={asset(selected[0])} alt={selected[1]} /><figcaption>{selected[1]} · {selected[3]}</figcaption></figure>}
      </dialog>
      <dialog className={styles.bag} ref={bagDialog} aria-labelledby="bag-title">
        <form method="dialog"><button className={styles.outline} aria-label="장바구니 닫기">✕</button></form>
        <h2 id="bag-title">Your Bag.</h2>
        {bag.length ? (
          <ul>{bag.map((item, index) => (
            <li key={JSON.stringify([item.name, item.option])}>
              <div>{item.name}<br /><small>{item.option}</small></div>
              <span>{won(item.price * item.quantity)}</span>
              <button className={styles.outline} onClick={() => setBag((items) => items.filter((_, position) => position !== index))}>삭제</button>
              <div className={styles.quantity} role="group" aria-label={item.name + " " + item.option + " 수량"}>
                <button className={styles.outline} aria-label="수량 줄이기" disabled={item.quantity === 1} onClick={() => changeQuantity(index, -1)}>−</button>
                <output>{item.quantity}</output>
                <button className={styles.outline} aria-label="수량 늘리기" disabled={item.quantity === 99} onClick={() => changeQuantity(index, 1)}>+</button>
              </div>
            </li>
          ))}</ul>
        ) : <p>장바구니가 비어 있습니다.</p>}
        <div className={styles.bagCoupon}>
          <div>
            <strong>{won(coupon.amount)} 할인 쿠폰</strong>
            <p role="status">{!couponEligible
              ? `상품 금액 ${won(coupon.minimum - subtotal)} 더 담으면 사용 가능`
              : couponApplied
                ? stampWins ? "더 큰 완주 할인이 적용됩니다." : "쿠폰이 적용되었습니다."
                : `상품 합계 ${won(coupon.minimum)} 이상 구매 시 사용 가능`}</p>
          </div>
          <button className={styles.outline} type="button" disabled={!couponEligible && !couponApplied} onClick={() => setCouponApplied(!couponApplied)}>
            {couponApplied ? "적용 해제" : "쿠폰 적용"}
          </button>
        </div>
        {tourComplete && <p className={styles.stampOffer}>동백길 완주 · 굿즈 {stampRate}% 할인 자동 적용. 쿠폰과 중복되지 않습니다.</p>}
        <p>상품 {won(subtotal)} + 배송 {won(shipping)}</p>
        {discount > 0 && <p>{stampWins ? "동백길 완주 할인" : "쿠폰 할인"} −{won(discount)}</p>}
        <strong aria-live="polite">합계 {won(subtotal + shipping - discount)}</strong>
        <p className={styles.note}>실물 상품 ₩50,000 이상 무료배송 · 결제는 제공되지 않는 시연용 장바구니입니다.</p>
      </dialog>
    </div>
  );
}
