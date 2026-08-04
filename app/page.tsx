"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type EventItem = {
  id?: string;
  title: string;
  event_date: string;
  location: string;
  author?: string;
  description: string;
  approved: boolean;
  image_url?: string;
  upload_type?: "image" | "video";
  video_url?: string;
  is_featured?: boolean;
  display_order?: number | null;
  created_at?: string;
  views?: number;
};

type SiteViewStats = {
  totalViews: number;
  todayViews: number;
};

export default function Home() {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [author, setAuthor] = useState("");
  const [uploadType, setUploadType] = useState<"image" | "video">("image");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [siteViewStats, setSiteViewStats] = useState<SiteViewStats>({
    totalViews: 0,
    todayViews: 0,
  });

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("approved", true)
      .order("is_featured", { ascending: false })
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setEvents(data || []);
  };

  const fetchSiteViewStats = async () => {
    const storageKey = "jinan-art-site-view-counted";
    const alreadyCounted =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(storageKey) === "true";

    const { data, error } = await supabase.rpc(
      alreadyCounted ? "get_site_view_stats" : "increment_site_view_stats"
    );

    if (error) {
      console.log("사이트 조회수 불러오기 실패:", error);
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;

    setSiteViewStats({
      totalViews: Number(result?.total_views ?? result?.totalViews ?? 0),
      todayViews: Number(result?.today_views ?? result?.todayViews ?? 0),
    });

    if (!alreadyCounted && typeof window !== "undefined") {
      window.sessionStorage.setItem(storageKey, "true");
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchSiteViewStats();
  }, []);

  const handleSubmit = async () => {
    if (
      !title ||
      !startDate ||
      !endDate ||
      !location ||
      !author ||
      !description
    ) {
      alert(
        "행사 제목, 행사 기간, 장소, 작성자, 설명을 모두 입력해주세요."
      );
      return;
    }

    if (endDate < startDate) {
      alert("종료일은 시작일보다 빠를 수 없습니다.");
      return;
    }

    if (uploadType === "video" && !videoUrl.trim()) {
      alert("유튜브 영상 주소를 입력해주세요.");
      return;
    }

    let imageUrl = "";

    if (uploadType === "image" && imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        console.log(uploadError);
        alert("이미지 업로드 실패");
        return;
      }

      const { data } = supabase.storage
        .from("event-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const eventDate =
      startDate === endDate
        ? `${startDate} ~ ${endDate}`
        : `${startDate} ~ ${endDate}`;

    const { error } = await supabase.from("events").insert([
      {
        title,
        event_date: eventDate,
        location,
        author,
        description,
        image_url: uploadType === "image" ? imageUrl : "",
        upload_type: uploadType,
        video_url: uploadType === "video" ? videoUrl.trim() : "",
        approved: false,
        is_featured: false,
        display_order: null,
      },
    ]);

    if (error) {
      console.log(error);
      alert("저장 실패");
      return;
    }

    alert("행사 등록 완료. 관리자 승인 후 게시됩니다.");

    setTitle("");
    setStartDate("");
    setEndDate("");
    setLocation("");
    setAuthor("");
    setUploadType("image");
    setVideoUrl("");
    setDescription("");
    setImageFile(null);
  };

  return (
    <main className="min-h-screen bg-gray-100 text-black">
      {/* HERO */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-100 px-6 text-white">
        {/* 좌우 배경: 같은 사진을 화면 전체에 확대해 흐리게 표시 */}
        <div
          className="absolute -inset-10 scale-110 bg-cover bg-center blur-3xl"
          style={{
            backgroundImage: "url('/images/main-hero.jpg')",
            filter: "blur(28px) brightness(1.08) saturate(0.9)",
          }}
        />

        {/* 흐린 배경이 너무 진하지 않도록 밝은 막을 아주 약하게 추가 */}
        <div className="absolute inset-0 bg-white/18" />

        {/* 원본 HERO 전체: 위쪽 하늘부터 아래 꽃밭까지 자르지 않음 */}
        <img
          src="/images/main-hero.jpg"
          alt="진안고원 HERO"
          className="absolute inset-0 h-full w-full object-contain"
        />

        {/* 중앙 원본 위에만 약한 음영을 줘 글자 가독성 유지 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.08) 28%, rgba(0,0,0,0.32) 50%, rgba(0,0,0,0.08) 72%, rgba(255,255,255,0.06) 100%)",
          }}
        />

        <div className="relative z-10 text-center">
          <p className="mb-5 text-xs tracking-[0.45em] text-white/80">
            JINAN CULTURE ART
          </p>

          <h1 className="mb-8 text-5xl font-black leading-tight md:text-8xl">
            문화가 머무는
            <br />
            진안고원
          </h1>

          <p className="text-lg leading-relaxed text-white/90 md:text-2xl">
            시간과 사람이 머무는
            <br />
            진안 문화이야기
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <a
              href="#events"
              className="rounded-full bg-white px-6 py-3 font-bold text-black"
            >
              문화행사 보기
            </a>

            <a
              href="#upload"
              className="rounded-full border border-white px-6 py-3 font-bold text-white"
            >
              행사 올리기
            </a>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-xl md:p-12">
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs tracking-[0.4em] text-gray-500">
              JINAN CULTURE PLATFORM
            </p>

            <h2 className="mb-6 text-4xl font-black leading-tight md:text-6xl">
              진안의 문화가
              <br />
              시민의 이야기로 이어집니다
            </h2>

            <p className="text-base leading-relaxed text-gray-600 md:text-lg">
              공연, 전시, 축제, 체험, 옛사진과 기록을 함께 모아가는
              <br />
              시민 참여형 문화 플랫폼
            </p>
          </div>

          {/* CARD SECTION: 오늘의 문화 + 진안의 시간 */}
          <div className="mb-16 grid grid-cols-2 gap-3 md:gap-6">
            <a
              href="#events"
              className="group order-2 relative overflow-hidden rounded-3xl bg-gray-900 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl md:order-1"
            >
              <img
                src="/images/flower-maisan.jpg"
                alt="오늘의 문화"
                className="h-56 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-72 md:h-96"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-7">
                <span className="mb-3 inline-flex rounded-full border border-white/40 bg-white/15 px-3 py-1 text-[9px] font-bold tracking-[0.25em] backdrop-blur-sm md:text-xs">
                  CULTURE
                </span>
                <h3 className="mb-1 text-xl font-black md:text-3xl">오늘의 문화</h3>
                <p className="text-xs leading-relaxed text-white/85 md:text-base">
                  진안의 문화예술 소식을 전합니다.
                </p>
                <p className="mt-3 text-xs font-bold text-white/90 md:text-sm">
                  문화행사 보기 →
                </p>
              </div>
            </a>

            <a
              href="/memory"
              className="group order-1 relative overflow-hidden rounded-3xl bg-gray-900 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl md:order-2"
            >
              <img
                src="/images/old-jinan.jpg"
                alt="진안의 시간"
                className="h-56 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-72 md:h-96"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-7">
                <span className="mb-3 inline-flex rounded-full border border-white/40 bg-white/15 px-3 py-1 text-[9px] font-bold tracking-[0.25em] backdrop-blur-sm md:text-xs">
                  MEMORY
                </span>
                <h3 className="mb-1 text-xl font-black md:text-3xl">진안의 시간</h3>
                <p className="text-xs leading-relaxed text-white/85 md:text-base">
                  오래된 풍경과 기억을 보존합니다.
                </p>
                <p className="mt-3 text-xs font-bold text-white/90 md:text-sm">
                  사진 기록 보기 →
                </p>
              </div>
            </a>
          </div>

          {/* UPLOAD FORM */}
          <section
            id="upload"
            className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="border-b border-gray-200 px-5 py-5 md:px-8">
              <p className="text-xs font-bold tracking-[0.3em] text-gray-400">
                PARTICIPATION
              </p>
              <h2 className="mt-2 text-2xl font-black md:text-3xl">
                소식올리기
              </h2>
            </div>

            <div className="p-5 md:p-8">
              <h3 className="text-2xl font-black md:text-3xl">
                시민이 직접 문화소식 올리기
              </h3>

              <p className="mt-3 break-keep text-sm leading-7 text-gray-500 md:text-base">
                이미지를 올리고 행사 날짜를 입력하면 가까운 날짜순으로 자동
                정렬됩니다. 영상을 선택하면 유튜브 링크로 등록할 수 있습니다.
                권장 이미지 크기는{" "}
                <strong className="font-black text-gray-700">
                  800px × 1200px
                </strong>
                입니다. 너무 큰 이미지는 로딩이 느려질 수 있습니다.
              </p>

              <div className="mt-8 grid gap-x-4 gap-y-6 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-gray-800">
                    행사 제목
                  </span>
                  <input
                    className="h-14 w-full rounded-xl border border-gray-300 bg-white px-4 text-base outline-none transition focus:border-black"
                    placeholder="예: 정읍 봄 전시회"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </label>

                <fieldset className="block">
                  <legend className="mb-2 text-sm font-black text-gray-800">
                    행사 기간
                  </legend>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      aria-label="행사 시작일"
                      className="h-14 min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-black md:text-base"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <span className="shrink-0 text-gray-500">~</span>
                    <input
                      type="date"
                      aria-label="행사 종료일"
                      className="h-14 min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-black md:text-base"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </fieldset>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-gray-800">
                    장소
                  </span>
                  <input
                    className="h-14 w-full rounded-xl border border-gray-300 bg-white px-4 text-base outline-none transition focus:border-black"
                    placeholder="예: 진안문화원"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-gray-800">
                    작성자
                  </span>
                  <input
                    className="h-14 w-full rounded-xl border border-gray-300 bg-white px-4 text-base outline-none transition focus:border-black"
                    placeholder="예: 시민 제보자 또는 단체명"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-gray-800">
                    올릴 파일 종류
                  </span>
                  <select
                    className="h-14 w-full rounded-xl border border-gray-300 bg-white px-4 text-base outline-none transition focus:border-black"
                    value={uploadType}
                    onChange={(e) => {
                      const nextType = e.target.value as "image" | "video";
                      setUploadType(nextType);
                      setImageFile(null);
                      setVideoUrl("");
                    }}
                  >
                    <option value="image">이미지</option>
                    <option value="video">유튜브 영상</option>
                  </select>
                </label>

                {uploadType === "image" ? (
                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-gray-800">
                      파일 업로드
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="block h-14 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:font-bold file:text-gray-700"
                      onChange={(e) =>
                        setImageFile(e.target.files?.[0] || null)
                      }
                    />
                  </label>
                ) : (
                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-gray-800">
                      유튜브 영상 주소
                    </span>
                    <input
                      type="url"
                      className="h-14 w-full rounded-xl border border-gray-300 bg-white px-4 text-base outline-none transition focus:border-black"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                  </label>
                )}

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-black text-gray-800">
                    설명
                  </span>
                  <textarea
                    className="min-h-44 w-full resize-y rounded-xl border border-gray-300 bg-white p-4 text-base leading-7 outline-none transition focus:border-black"
                    placeholder="행사 설명, 시간, 참가 방법 등을 적어주세요."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="mt-7 w-full rounded-xl bg-black py-4 text-base font-black text-white transition hover:bg-gray-800 md:text-lg"
              >
                관리자 승인 요청하기
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-gray-400">
                등록된 문화소식은 관리자 확인과 승인 후 메인화면에 게시됩니다.
              </p>
            </div>
          </section>

          {/* EVENT LIST */}
          <div id="events" className="mt-16">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold tracking-[0.28em] text-gray-400">
                  TODAY&apos;S CULTURE
                </p>
                <h2 className="text-3xl font-black md:text-4xl">
                  오늘의 문화행사
                </h2>
              </div>

              <p className="hidden text-sm text-gray-500 md:block">
                진안의 공연·전시·축제·체험 소식
              </p>
            </div>

            {events.length === 0 ? (
              <div className="rounded-3xl bg-gray-50 p-8 text-gray-500">
                아직 승인된 행사가 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
                {events.map((event) => (
                  <Link
                    key={event.id || event.title}
                    href={event.id ? `/events/${event.id}` : "#events"}
                    className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl md:rounded-3xl"
                    aria-label={`${event.title} 상세보기`}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-4 text-center text-xs font-bold text-gray-400">
                          행사 이미지 준비 중
                        </div>
                      )}

                    </div>

                    <div className="p-3 md:p-5">
                      <p className="mb-1.5 text-[10px] font-bold text-blue-600 md:text-sm">
                        {event.event_date}
                      </p>

                      <h3
                        className="mb-2 min-h-[2.6rem] text-sm font-black leading-snug text-gray-900 md:min-h-[3.5rem] md:text-xl"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {event.title}
                      </h3>

                      <div className="mb-2 flex items-center justify-between gap-2 text-[10px] font-semibold text-gray-500 md:text-sm">
                        <p
                          className="min-w-0 flex-1 leading-relaxed"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          📍 {event.location}
                        </p>

                        <span className="shrink-0" title="조회수">
                          👁 {event.views ?? 0}
                        </span>
                      </div>

                      <p
                        className="text-[10px] leading-relaxed text-gray-600 md:text-sm"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {event.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white px-4 py-12 text-center">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-xl font-black">진안문화아트</p>
          <p className="mb-7 text-sm leading-relaxed text-gray-500">
            진안의 문화와 오래된 시간을 시민과 함께 기록합니다.
          </p>

          <div className="mb-8 grid gap-3 sm:grid-cols-2">
            <a
              href="https://jinanmunhwa.or.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-blue-700 px-5 py-4 font-bold text-white transition hover:bg-blue-800"
            >
              진안문화원 홈페이지 ↗
            </a>
            <a
              href="https://blog.naver.com/kymo2002"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-green-600 px-5 py-4 font-bold text-white transition hover:bg-green-700"
            >
              有河의 鎭安 이야기 블로그 ↗
            </a>
          </div>

          <div className="mb-8 flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="rounded-full bg-gray-100 px-4 py-2 font-bold text-gray-700">
              전체 조회수 {siteViewStats.totalViews.toLocaleString()}
            </span>
            <span className="rounded-full bg-gray-100 px-4 py-2 font-bold text-gray-700">
              오늘 조회수 {siteViewStats.todayViews.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm font-semibold text-gray-500">
            <Link href="/memory" className="transition hover:text-black">진안의 시간</Link>
            <Link href="/notices" className="transition hover:text-black">공지사항</Link>
            <Link href="/admin" className="transition hover:text-black">관리자 메뉴</Link>
          </div>

          <p className="mt-8 text-xs text-gray-400">© JINAN CULTURE ART</p>
        </div>
      </footer>
    </main>
  );
}
