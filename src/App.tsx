import { useState, useRef, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";

// ─── Photo placeholder component ─────────────────────────────────────────────
function PhotoSlot({
  rotate = 0,
  caption = "",
  wide = false,
  tall = false,
  src = "",
  alt = "",
}: {
  rotate?: number;
  caption?: string;
  wide?: boolean;
  tall?: boolean;
  src?: string;
  alt?: string;
}) {
  const w = wide ? "w-full" : "w-full";
  const h = tall ? "h-72" : "h-52";
  return (
    <figure
      className="inline-block"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div
        className={`${w} ${h} bg-[#E8E5DF] border-4 border-white shadow-md overflow-hidden`}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="text-[#B5B0A8] text-xs tracking-widest uppercase"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              photo
            </span>
          </div>
        )}
      </div>
      {caption && (
        <figcaption
          className="mt-2 text-[11px] text-[#8A8A8A] text-center"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ─── Interview block ──────────────────────────────────────────────────────────
function InterviewBlock({
  question,
  answer = "",
}: {
  question: string;
  answer?: string;
}) {
  return (
    <div className="border-l-2 border-[#D4D1CB] pl-5 py-1">
      <p
        className="text-[11px] uppercase tracking-widest text-[#8A8A8A] mb-1"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Q.
      </p>
      <p
        className="text-sm text-[#222222] leading-relaxed mb-3"
        style={{ fontFamily: "var(--font-sans)", fontStyle: "italic" }}
      >
        {question}
      </p>
      {answer ? (
        <p
          className="text-sm text-[#444444] leading-relaxed"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {answer}
        </p>
      ) : (
        <div className="h-8 border-b border-dashed border-[#D4D1CB]" />
      )}
    </div>
  );
}

// ─── Illustration slot ────────────────────────────────────────────────────────
function IllustrationSlot({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-24 h-24 border border-dashed border-[#C5C2BB] flex items-center justify-center">
        <span className="text-[10px] text-[#B5B0A8] uppercase tracking-widest">
          illus.
        </span>
      </div>
      {label && (
        <span className="text-[10px] text-[#8A8A8A] tracking-wide">{label}</span>
      )}
    </div>
  );
}

// ─── Thin divider ─────────────────────────────────────────────────────────────
function Divider() {
  return <hr className="border-t border-[#D4D1CB] my-16" />;
}

// ─── Chapter heading ──────────────────────────────────────────────────────────
function ChapterHeading({
  number,
  korean,
  english,
}: {
  number: string;
  korean: string;
  english: string;
}) {
  return (
    <div className="mb-12">
      <span
        className="text-[11px] text-[#8A8A8A] tracking-[0.2em] uppercase"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {number}
      </span>
      <h2
        className="text-4xl mt-1 text-[#222222] leading-tight"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {korean}
      </h2>
      <p
        className="text-xs text-[#8A8A8A] mt-1 tracking-widest uppercase"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {english}
      </p>
    </div>
  );
}

// ─── Sub-event heading ────────────────────────────────────────────────────────
function EventHeading({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-8">
      <h3
        className="text-2xl text-[#222222]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {title}
      </h3>
      {desc && (
        <p
          className="text-xs text-[#8A8A8A] mt-1 leading-relaxed max-w-xs"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {desc}
        </p>
      )}
    </div>
  );
}

// ─── Page number ──────────────────────────────────────────────────────────────
function PageNum({ n }: { n: string }) {
  return (
    <div className="flex justify-end mt-20">
      <span
        className="text-[11px] text-[#B5B0A8] tracking-widest"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {n}
      </span>
    </div>
  );
}

// ─── Guest Book ───────────────────────────────────────────────────────────────
type GuestEntry = {
  id: string | number;
  name: string;
  message: string;
  drawing?: string;
  createdAt?: number;
};

function GuestBook() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [entries, setEntries] = useState<GuestEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, "guestbook"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const list: GuestEntry[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<GuestEntry, "id">),
        }));
        setEntries(list);
      } catch (err) {
        console.error("불러오기 실패:", err);
      }
    };
    load();
  }, []);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX: number;
    let clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !lastPos.current) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };


  const isAdmin =
    new URLSearchParams(window.location.search).get("admin") === "diesukk2i";

  const removeEntry = async (id: string | number) => {
    if (!isAdmin) return;
    if (!confirm("이 방명록을 삭제할까요?")) return;
    try {
      await deleteDoc(doc(db, "guestbook", String(id)));
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제에 실패했어요.");
    }
  };
  const submit = async () => {
    const canvas = canvasRef.current;
    const drawing = canvas ? canvas.toDataURL("image/png") : "";
    const blank = canvas ? (() => {
      const c = document.createElement("canvas");
      c.width = canvas.width;
      c.height = canvas.height;
      return c.toDataURL("image/png");
    })() : "";
    const hasDrawing = drawing !== "" && drawing !== blank;
    if (!name.trim() && !message.trim() && !hasDrawing) return;
    const newEntry = {
      name: name.trim() || "익명",
      message: message.trim(),
      drawing,
      createdAt: Date.now(),
    };
    try {
      const ref = await addDoc(collection(db, "guestbook"), newEntry);
      setEntries((prev) => [{ id: ref.id, ...newEntry }, ...prev]);
      setName("");
      setMessage("");
      clearCanvas();
    } catch (err) {
      console.error("저장 실패:", err);
      alert("방명록 저장에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <section id="guestbook" className="px-16 py-20 max-w-4xl mx-auto">
      <ChapterHeading number="— IV" korean="Guest Book" english="Leave something behind" />
      <p
        className="text-sm text-[#8A8A8A] mb-12 max-w-sm leading-relaxed"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Leave something for the next person to find.
      </p>

      {/* Drawing canvas */}
      <div className="mb-8">
        <p
          className="text-[11px] uppercase tracking-widest text-[#8A8A8A] mb-3"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Draw something
        </p>
        <canvas
          ref={canvasRef}
          width={640}
          height={200}
          className="w-full border border-[#D4D1CB] bg-white cursor-crosshair"
          style={{ touchAction: "none" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <button
          onClick={clearCanvas}
          className="mt-2 text-[11px] text-[#8A8A8A] underline underline-offset-2 hover:text-[#3A7AFE] transition-colors"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          clear
        </button>
      </div>

      {/* Form */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (비워두면 익명)"
          className="col-span-1 border-b border-[#D4D1CB] bg-transparent py-2 text-sm text-[#222222] placeholder-[#B5B0A8] outline-none focus:border-[#3A7AFE] transition-colors"
          style={{ fontFamily: "var(--font-sans)" }}
        />
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message"
          className="col-span-2 border-b border-[#D4D1CB] bg-transparent py-2 text-sm text-[#222222] placeholder-[#B5B0A8] outline-none focus:border-[#3A7AFE] transition-colors"
          style={{ fontFamily: "var(--font-sans)" }}
        />
      </div>
      <button
        onClick={submit}
        className="px-6 py-2 text-xs tracking-widest uppercase text-[#222222] border border-[#D4D1CB] hover:border-[#3A7AFE] hover:text-[#3A7AFE] transition-colors"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Leave a mark
      </button>
      {/* Existing entries */}
      <div className="mb-12 grid grid-cols-2 gap-x-12 gap-y-8">
        {entries.map((e) => (
          <div key={e.id} className="border-b border-[#E0DDD7] pb-6">
            {e.drawing && (
              <img
                src={e.drawing}
                alt=""
                className="w-full mb-3 bg-white border border-[#E8E5E0]"
              />
            )}
            <div className="flex items-center justify-between mb-1">
              <p
                className="text-xs text-[#8A8A8A] uppercase tracking-widest"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {e.name}
              </p>
              {isAdmin && (
                <button
                  onClick={() => removeEntry(e.id)}
                  className="text-[10px] text-[#B5B0A8] hover:text-[#D14343] transition-colors"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  delete
                </button>
              )}
            </div>
            <p
              className="text-sm text-[#333333] leading-relaxed"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {e.message}
            </p>
          </div>
        ))}
      </div>


      <PageNum n="11" />
    </section>
  );
}

// ─── Top navigation ───────────────────────────────────────────────────────────
function TopNav({
  onNavClick,
}: {
  onNavClick: (id: string) => void;
}) {
  const [gradeOpen, setGradeOpen] = useState(false);
  const [actOpen, setActOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 flex items-stretch bg-[#F7F7F4] border-b border-[#D4D1CB]"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* Logo mark */}
      <div className="px-8 py-4 border-r border-[#D4D1CB] flex items-center gap-3 shrink-0">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A8A8A]">EWOO</span>
        <span className="text-[10px] text-[#D4D1CB]">22nd</span>
      </div>

      {/* 학년별 기록 */}
      <div
        className="relative"
        onMouseEnter={() => setGradeOpen(true)}
        onMouseLeave={() => setGradeOpen(false)}
      >
        <button
          className={`h-full px-7 py-4 text-[12px] tracking-wider border-r border-[#D4D1CB] transition-colors ${gradeOpen ? "text-[#3A7AFE]" : "text-[#444444]"} hover:text-[#3A7AFE]`}
        >
          학년별 기록
        </button>
        {gradeOpen && (
          <div className="absolute top-full left-0 bg-[#F7F7F4] border border-[#D4D1CB] shadow-sm min-w-[120px]">
            {["1학년", "2학년", "3학년"].map((item, i) => (
              <button
                key={item}
                onClick={() => { onNavClick(`grade${i + 1}`); setGradeOpen(false); }}
                className="w-full text-left px-5 py-3 text-[12px] text-[#444444] hover:text-[#3A7AFE] hover:bg-[#EEF3FF] border-b border-[#E8E5DF] last:border-0 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 그 외 활동 */}
      <div
        className="relative"
        onMouseEnter={() => setActOpen(true)}
        onMouseLeave={() => setActOpen(false)}
      >
        <button
          className={`h-full px-7 py-4 text-[12px] tracking-wider border-r border-[#D4D1CB] transition-colors ${actOpen ? "text-[#3A7AFE]" : "text-[#444444]"} hover:text-[#3A7AFE]`}
        >
          그 외 활동
        </button>
        {actOpen && (
          <div className="absolute top-full left-0 bg-[#F7F7F4] border border-[#D4D1CB] shadow-sm min-w-[120px]">
            {[
              { label: "체육대회", id: "sports" },
              { label: "축제", id: "festival" },
              { label: "학년시간", id: "classtime" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { onNavClick(item.id); setActOpen(false); }}
                className="w-full text-left px-5 py-3 text-[12px] text-[#444444] hover:text-[#3A7AFE] hover:bg-[#EEF3FF] border-b border-[#E8E5DF] last:border-0 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Guest Book */}
      <button
        onClick={() => onNavClick("guestbook")}
        className="px-7 py-4 text-[12px] tracking-wider text-[#444444] hover:text-[#3A7AFE] transition-colors"
      >
        Guest Book
      </button>
    </nav>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [bookOpen, setBookOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // After opening, scroll to top of archive
  const handleOpen = () => {
    setBookOpen(true);
    setTimeout(() => {
      document.getElementById("archive-top")?.scrollIntoView({ behavior: "smooth" });
    }, 400);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#DDDAD4" }}>
      {/* ── CLOSED BOOK COVER ─────────────────────────────────── */}
      {!bookOpen && (
        <div className="min-h-screen flex items-center justify-center">
          <div
            className="relative cursor-pointer select-none"
            style={{
              width: 420,
              boxShadow:
                "6px 8px 32px rgba(0,0,0,0.18), 2px 2px 8px rgba(0,0,0,0.08), inset -4px 0 12px rgba(0,0,0,0.06)",
            }}
            onClick={handleOpen}
          >
            {/* Spine shadow */}
            <div
              className="absolute left-0 top-0 bottom-0 w-8"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.02) 100%)",
                borderRight: "1px solid rgba(0,0,0,0.07)",
              }}
            />
            {/* Cover */}
            <div
              className="bg-[#F7F7F4] px-16 py-20 flex flex-col"
              style={{
                minHeight: 580,
                borderLeft: "5px solid #E0DDD7",
              }}
            >
              {/* Top label */}
              <div className="mb-auto">
                <span
                  className="text-[10px] tracking-[0.3em] uppercase text-[#8A8A8A]"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Digital Graduation Archive
                </span>
              </div>

              {/* Main title */}
              <div className="mt-16 mb-16">
                <div
                  className="text-[44px] leading-[1.05] text-[#222222] mb-1"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  EWOO
                  <br />
                  MIDDLE
                  <br />
                  SCHOOL
                </div>
                <div
                  className="text-[15px] tracking-[0.2em] text-[#8A8A8A] mt-4"
                  style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
                >
                  22nd ARCHIVE
                </div>
              </div>

              {/* Bottom */}
              <div className="mt-auto flex items-end justify-between">
                <span
                  className="text-xs text-[#B5B0A8]"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  2024 — 2026
                </span>
                <span
                  className="text-[10px] tracking-widest uppercase text-[#C5C2BB]"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Click to open
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── OPEN BOOK ─────────────────────────────────────────── */}
      {bookOpen && (
        <div
          id="archive-top"
          className="bg-[#F7F7F4]"
          style={{
            animation: "fadeIn 0.6s ease both",
          }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(12px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Sticky top nav */}
          <TopNav onNavClick={scrollTo} />

          {/* Book content wrapper — centered column like a book */}
          <div className="max-w-4xl mx-auto bg-[#F7F7F4]" style={{ boxShadow: "0 0 60px rgba(0,0,0,0.08)" }}>

            {/* ── PROLOGUE ──────────────────────────────────────── */}
            <section className="px-16 py-24">
              <div className="mb-16">
                <span
                  className="text-[10px] uppercase tracking-[0.3em] text-[#8A8A8A]"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Prologue
                </span>
                <h1
                  className="text-5xl mt-3 text-[#222222] leading-tight"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  EWOO<br />MIDDLE SCHOOL
                </h1>
                <p
                  className="text-sm text-[#8A8A8A] mt-2 tracking-widest"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  22nd ARCHIVE · 2024 — 2026
                </p>
              </div>

              {/* Prologue text area */}
              <div className="grid grid-cols-2 gap-16">
                <div>
                  <p
                    className="text-[11px] uppercase tracking-[0.2em] text-[#8A8A8A] mb-5"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    다정함으로 바라본 우리 학교
                  </p>
                  <div
                    className="text-sm text-[#444444] leading-[1.9] space-y-5"
                    style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
                  >
                    <p>
                      이 아카이브는 우리 22회 졸업생들이 함께 보낸 3년을 기록한 공간입니다.
                    </p>
                    <p>
                      거창한 이야기가 아니어도 괜찮습니다. 복도에서 나눈 짧은 대화,
                      창밖으로 보이던 운동장, 수업이 끝나고 함께했던 시간들 —
                      그 작고 평범한 순간들이 사실 가장 오래 기억될 것 같아서요.
                    </p>
                    <p>
                      {/* Creator's personal note will go here */}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-8">
                  <PhotoSlot caption="우리 학교, 어느 날" />
                  <IllustrationSlot label="school building" />
                </div>
              </div>
              <PageNum n="01" />
            </section>

            <Divider />

            {/* ── 학년별 기록 ──────────────────────────────────────── */}
            <section className="px-16 py-12">
              <div className="mb-16">
                <span
                  className="text-[11px] uppercase tracking-[0.25em] text-[#8A8A8A]"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  — I
                </span>
                <h2
                  className="text-5xl mt-2 text-[#222222]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  학년별 기록
                </h2>
                <p
                  className="text-xs text-[#8A8A8A] mt-1 tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Grade Records
                </p>
              </div>
            </section>

            {/* ── 1학년 ───────────────────────────────────────────── */}
            <section id="grade1" className="px-16 pb-20">
              <ChapterHeading number="I — 01" korean="1학년" english="First Year · 2024" />

              {/* 공감캠프 */}
              <div className="mb-16">
                <EventHeading
                  title="공감캠프"
                  desc="서로를 처음 알아가는 시간. 낯설고 어색했지만, 그래서 더 기억에 남는."
                />
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <PhotoSlot rotate={-1} caption="공감캠프 첫째 날" />
                  <PhotoSlot rotate={0.5} caption="조별 활동" />
                  <PhotoSlot rotate={1} caption="" />
                </div>
                <div className="grid grid-cols-2 gap-12 mt-8">
                  <InterviewBlock question="가장 기억에 남는 순간은?" />
                  <InterviewBlock question="그때 어떤 기분이었어?" />
                </div>
              </div>

              <div className="w-12 border-t border-[#D4D1CB] my-12" />

              {/* 역사캠프 */}
              <div>
                <EventHeading
                  title="역사캠프"
                  desc="교실 밖에서 배운 것들. 우리가 발로 걷고, 눈으로 본 역사."
                />
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="flex flex-col gap-6">
                    <PhotoSlot tall caption="역사캠프 현장" />
                  </div>
                  <div className="pt-8">
                    <p
                      className="text-sm text-[#444444] leading-[1.9] mb-8"
                      style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
                    >
                      {/* Short description of the history camp experience goes here */}
                    </p>
                    <InterviewBlock question="다시 돌아간다면 기억하고 싶은 순간은?" />
                    <div className="mt-8">
                      <IllustrationSlot label="지도 또는 장소 스케치" />
                    </div>
                  </div>
                </div>
              </div>
              <PageNum n="02" />
            </section>

            <Divider />

            {/* ── 2학년 ───────────────────────────────────────────── */}
            <section id="grade2" className="px-16 pb-20">
              <ChapterHeading number="I — 02" korean="2학년" english="Second Year · 2025" />

              {/* 명상캠프 */}
              <div className="mb-16">
                <EventHeading
                  title="명상캠프"
                  desc="멈추고, 바라보는 시간. 잠깐 조용해진 우리들."
                />
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <PhotoSlot rotate={-0.5} caption="명상 시간" />
                  <PhotoSlot rotate={1} caption="" />
                  <PhotoSlot rotate={-1} caption="자연 속에서" />
                </div>
                <div className="mt-8">
                  <InterviewBlock question="3년 동안 가장 많이 웃었던 순간은?" />
                </div>
              </div>

              <div className="w-12 border-t border-[#D4D1CB] my-12" />

              {/* 나바시 */}
              <div>
                <EventHeading
                  title="나바시"
                  desc="나를 바라보는 시간 — 패션, 움직임, 창작, 창업, 내면 탐구, 사회 탐구."
                />
                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <p
                      className="text-sm text-[#444444] leading-[1.9] mb-6"
                      style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
                    >
                      나바시는 학생들이 스스로 궁금한 것을 탐구하고,
                      잘 몰랐던 길을 걸어본 시간이었습니다.
                      정답을 찾는 것이 아니라, 자신이 무엇에 끌리는지를
                      조금씩 알아가는 과정이었죠.
                    </p>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {["패션", "움직임", "창작", "창업", "내면", "사회"].map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] tracking-widest uppercase text-[#8A8A8A] border border-[#D4D1CB] px-2 py-1 text-center"
                          style={{ fontFamily: "var(--font-sans)" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <InterviewBlock question="나바시에서 발견한 것이 있다면?" />
                  </div>
                  <div className="flex flex-col gap-6">
                    <PhotoSlot tall caption="나바시 발표 현장" />
                    <IllustrationSlot label="학생 노트 스케치" />
                  </div>
                </div>
              </div>
              <PageNum n="04" />
            </section>

            <Divider />

            {/* ── 3학년 ───────────────────────────────────────────── */}
            <section id="grade3" className="px-16 pb-20">
              <ChapterHeading number="I — 03" korean="3학년" english="Third Year · 2026" />

              {/* 공동체활동 */}
              <div>
                <EventHeading
                  title="공동체활동"
                  desc="마지막 해, 우리가 함께 만든 시간들."
                />
                <div className="grid grid-cols-2 gap-10 mb-10">
                  <PhotoSlot tall caption="공동체 활동" />
                  <PhotoSlot tall caption="" />
                </div>
                <div className="grid grid-cols-2 gap-12 mt-4">
                  <InterviewBlock question="3학년이 되어 달라진 것이 있다면?" />
                  <InterviewBlock question="졸업하고 나서도 기억하고 싶은 게 있어?" />
                </div>
                <div className="mt-12 border border-dashed border-[#D4D1CB] p-8">
                  <p
                    className="text-[11px] uppercase tracking-widest text-[#B5B0A8] mb-3"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Handwritten note
                  </p>
                  <div className="h-20" />
                </div>
              </div>
              <PageNum n="06" />
            </section>

            <Divider />

            {/* ── 그 외 활동 ──────────────────────────────────────── */}
            <section className="px-16 py-12">
              <div className="mb-16">
                <span
                  className="text-[11px] uppercase tracking-[0.25em] text-[#8A8A8A]"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  — II
                </span>
                <h2
                  className="text-5xl mt-2 text-[#222222]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  그 외 활동
                </h2>
                <p
                  className="text-xs text-[#8A8A8A] mt-1 tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Other Activities
                </p>
              </div>
            </section>

            {/* 체육대회 */}
            <section id="sports" className="px-16 pb-20">
              <ChapterHeading number="II — 01" korean="체육대회" english="Sports Day" />
              <div className="grid grid-cols-3 gap-6 mb-10">
                <PhotoSlot rotate={-1} caption="응원 현장" />
                <PhotoSlot rotate={0.5} caption="달리기" />
                <PhotoSlot rotate={-0.5} caption="단체전" />
              </div>
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <p
                    className="text-sm text-[#444444] leading-[1.9]"
                    style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
                  >
                    {/* Description of sports day goes here */}
                  </p>
                </div>
                <InterviewBlock question="체육대회에서 가장 기억에 남는 장면은?" />
              </div>
              <PageNum n="07" />
            </section>

            <div className="w-12 border-t border-[#D4D1CB] mx-16 my-4" />

            {/* 축제 */}
            <section id="festival" className="px-16 pb-20">
              <ChapterHeading number="II — 02" korean="축제" english="School Festival" />
              <div className="grid grid-cols-2 gap-8 mb-10">
                <PhotoSlot tall caption="무대 위에서" />
                <div className="flex flex-col gap-6">
                  <PhotoSlot caption="부스 활동" />
                  <PhotoSlot caption="관객석" />
                </div>
              </div>
              <InterviewBlock question="축제 때 가장 많이 웃었던 순간은?" />
              <PageNum n="08" />
            </section>

            <div className="w-12 border-t border-[#D4D1CB] mx-16 my-4" />

            {/* 학년시간 */}
            <section id="classtime" className="px-16 pb-20">
              <ChapterHeading number="II — 03" korean="학년시간" english="Grade Time" />
              <div className="grid grid-cols-3 gap-6 mb-10">
                <PhotoSlot rotate={1} caption="" />
                <PhotoSlot rotate={-0.5} caption="교실 풍경" />
                <div className="flex flex-col gap-4">
                  <IllustrationSlot label="교실" />
                  <IllustrationSlot label="칠판" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-12">
                <InterviewBlock question="학년시간에 무엇을 했어?" />
                <InterviewBlock question="가장 좋아했던 순간은?" />
              </div>
              <PageNum n="09" />
            </section>

            <Divider />

            {/* ── GUEST BOOK ──────────────────────────────────────── */}
            <GuestBook />

            {/* ── COLOPHON ────────────────────────────────────────── */}
            <footer className="px-16 py-16 border-t border-[#D4D1CB] flex justify-between items-end">
              <div>
                <p
                  className="text-[10px] uppercase tracking-[0.3em] text-[#B5B0A8]"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  EWOO MIDDLE SCHOOL
                </p>
                <p
                  className="text-[10px] text-[#C5C2BB] mt-1"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  22nd ARCHIVE · 2024 — 2026
                </p>
              </div>
              <p
                className="text-[10px] text-[#C5C2BB]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                다정함으로 바라본 우리 학교
              </p>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
