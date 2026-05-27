"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type EventItem = {
  id: string;
  title: string;
  event_date: string;
  start_date?: string;
  end_date?: string;
  location: string;
  author?: string;
  description: string;
  approved: boolean;
  image_url?: string;
  upload_type?: string;
  video_url?: string;
};

type NoticeItem = {
  id: string;
  title: string;
  content: string;
  notice_date?: string;
  published: boolean;
  created_at?: string;
};

export default function Home() {
  const [title, setTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [author, setAuthor] = useState("");
  const [uploadType, setUploadType] = useState("image");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [searchText, setSearchText] = useState("");

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("approved", true)
      .order("event_date", { ascending: true });

    if (error) {
      console.log(error);
      return;
    }

    setEvents(data || []);
  };

  const fetchNotices = async () => {
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) {
      console.log(error);
      return;
    }

    setNotices(data || []);
  };

  useEffect(() => {
    fetchEvents();
    fetchNotices();
  }, []);

  const filteredEvents = events.filter((event) => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) {
      return true;
    }

    return (
      event.title.toLowerCase().includes(keyword) ||
      (event.event_date || "").toLowerCase().includes(keyword) ||
      (event.start_date || "").toLowerCase().includes(keyword) ||
      (event.end_date || "").toLowerCase().includes(keyword) ||
      event.location.toLowerCase().includes(keyword) ||
      (event.author || "").toLowerCase().includes(keyword) ||
      event.description.toLowerCase().includes(keyword)
    );
  });

  const handleImageChange = (file: File | null) => {
    if (!file) {
      setImageFile(null);
      return;
    }

    const maxSize = 1 * 1024 * 1024;

    if (file.size > maxSize) {
      alert(
        "이미지 용량이 너무 큽니다.\n모바일 화면에 적합하도록 1MB 이하 이미지를 올려주세요."
      );

      setImageFile(null);

      const fileInput = document.getElementById(
        "event-image-input"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      return;
    }

    setImageFile(file);
  };

  const resetForm = () => {
    setTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setLocation("");
    setAuthor("");
    setUploadType("image");
    setVideoUrl("");
    setDescription("");
    setImageFile(null);

    const fileInput = document.getElementById(
      "event-image-input"
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!title || !eventStartDate || !location || !author || !description) {
      alert("행사 제목, 시작일, 장소, 작성자, 설명은 반드시 입력해주세요.");
      return;
    }

    if (uploadType === "video" && !videoUrl) {
      alert("영상행사는 유튜브 링크를 입력해주세요.");
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
        alert(`이미지 업로드 실패: ${uploadError.message}`);
        return;
      }

      const { data } = supabase.storage
        .from("event-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const eventDateText = eventEndDate
      ? `${eventStartDate} ~ ${eventEndDate}`
      : eventStartDate;

    const { error } = await supabase.from("events").insert([
      {
        title,
        event_date: eventDateText,
        start_date: eventStartDate,
        end_date: eventEndDate,
        location,
        author,
        description,
        image_url: imageUrl,
        upload_type: uploadType,
        video_url: uploadType === "video" ? videoUrl : "",
        approved: false,
      },
    ]);

    if (error) {
      console.log(error);
      alert(`저장 실패: ${error.message}`);
      return;
    }

    alert("문화소식 등록 완료. 관리자 승인 후 게시됩니다.");
    resetForm();
  };

  return (
    <main className="min-h-screen bg-gray-100 text-black">
      {/* HERO */}
      <section className="relative flex min-h-[720px] items-center justify-center overflow-hidden bg-white px-6 text-white md:min-h-screen">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center opacity-60 blur-md"
          style={{ backgroundImage: "url('/images/main-hero.jpg')" }}
        />

        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/main-hero.jpg')" }}
        />

        <div className="absolute inset-0 bg-white/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/20" />

        <div className="relative z-10 text-center drop-shadow-[0_3px_8px_rgba(0,0,0,0.45)]">
          <p className="mb-5 text-xs tracking-[0.45em] text-white/95">
            JINAN CULTURE ART
          </p>

          <h1 className="mb-8 text-5xl font-black leading-tight md:text-8xl">
            문화가 머무는
            <br />
            진안고원
          </h1>

          <p className="text-lg leading-relaxed text-white md:text-2xl">
            시간과 사람이 머무는
            <br />
            진안 문화이야기
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#events"
              className="rounded-full bg-white px-6 py-3 font-bold text-black shadow-lg transition hover:bg-gray-100"
            >
              문화행사 보기
            </a>

            <a
              href="#upload"
              className="rounded-full border border-white bg-white/20 px-6 py-3 font-bold text-white shadow-lg backdrop-blur-sm transition hover:bg-white/30"
            >
              소식 올리기
            </a>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-5 shadow-xl md:p-12">
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs tracking-[0.4em] text-gray-500">
              JINAN CULTURE PLATFORM
            </p>

            <h2 className="mx-auto mb-6 max-w-3xl text-3xl font-black leading-tight md:text-6xl">
              진안의 문화가 군민의
              <br />
              이야기로 이어집니다
            </h2>

            <p className="text-base leading-relaxed text-gray-600 md:text-lg">
              군민참여 문화예술 기록 플랫폼
            </p>
          </div>

          {/* 카드 섹션 */}
          <div id="memory" className="mb-16 grid gap-6 md:grid-cols-2">
            <div className="order-2 overflow-hidden rounded-3xl bg-gray-50 shadow md:order-1">
              <img
                src="/images/flower-maisan.jpg"
                alt="오늘의 문화"
                className="h-64 w-full object-cover md:h-80"
              />

              <div className="p-5">
                <p className="mb-2 text-xs tracking-[0.25em] text-gray-400">
                  CULTURE
                </p>

                <h3 className="mb-2 text-2xl font-bold">오늘의 문화</h3>

                <p className="text-gray-600">
                  누구나 진안의 문화예술 소식을 전합니다.
                </p>
              </div>
            </div>

            <div className="order-1 overflow-hidden rounded-3xl bg-gray-50 shadow md:order-2">
              <img
                src="/images/old-jinan.jpg"
                alt="진안의 시간"
                className="h-64 w-full object-cover md:h-80"
              />

              <div className="p-5">
                <p className="mb-2 text-xs tracking-[0.25em] text-gray-400">
                  MEMORY
                </p>

                <h3 className="mb-2 text-2xl font-bold">진안의 시간</h3>

                <p className="mb-5 text-gray-600">
                  오래된 풍경과 기억을 함께 기록합니다.
                </p>

                <Link
                  href="/memory"
                  className="inline-flex rounded-2xl bg-black px-5 py-3 font-bold text-white transition hover:bg-gray-800"
                >
                  진안의 시간 보기
                </Link>
              </div>
            </div>
          </div>

          {/* 행사 목록 */}
          <div id="events" className="mb-16 scroll-mt-10">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-3 text-xs tracking-[0.35em] text-gray-500">
                  JINAN EVENTS
                </p>

                <h2 className="text-3xl font-black md:text-4xl">
                  등록된 행사
                </h2>
              </div>

              <p className="text-sm text-gray-500">
                관리자 승인 후 공개된 진안 문화예술 행사입니다.
              </p>
            </div>

            <div className="mb-8 rounded-3xl bg-gray-50 p-5 md:p-6">
              <label className="mb-3 block font-bold text-gray-700">
                행사 검색
              </label>

              <input
                className="w-full rounded-2xl border border-gray-300 bg-white p-4"
                placeholder="행사명, 장소, 날짜, 작성자, 소개 내용으로 검색하세요"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />

              <div className="mt-3 flex flex-col gap-2 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
                <p>
                  전체 {events.length}개 중 {filteredEvents.length}개 행사가
                  표시됩니다.
                </p>

                {searchText && (
                  <button
                    onClick={() => setSearchText("")}
                    className="w-fit font-bold text-gray-700 underline underline-offset-4"
                  >
                    검색 초기화
                  </button>
                )}
              </div>
            </div>

            {events.length === 0 ? (
              <div className="rounded-3xl bg-gray-50 p-8 text-gray-500">
                아직 승인된 행사가 없습니다.
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="rounded-3xl bg-gray-50 p-8 text-gray-500">
                검색 결과가 없습니다.
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="overflow-hidden rounded-3xl bg-white shadow-lg"
                  >
                    {event.upload_type === "video" && event.video_url ? (
                      <div className="bg-gray-100 p-6">
                        <p className="mb-3 text-sm font-bold text-gray-500">
                          영상행사
                        </p>

                        <a
                          href={event.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex rounded-2xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
                        >
                          유튜브 영상 보기
                        </a>
                      </div>
                    ) : (
                      event.image_url && (
                        <div className="flex w-full items-center justify-center bg-gray-100 p-3">
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="max-h-[680px] w-full object-contain"
                          />
                        </div>
                      )
                    )}

                    <div className="p-6 md:p-8">
                      <p className="mb-3 text-sm text-gray-500">
                        {event.event_date}
                      </p>

                      <h3 className="mb-5 text-2xl font-black leading-tight">
                        {event.title}
                      </h3>

                      <p className="mb-3 font-semibold text-gray-600">
                        장소: {event.location}
                      </p>

                      {event.author && (
                        <p className="mb-5 text-sm text-gray-500">
                          작성자: {event.author}
                        </p>
                      )}

                      <p className="mb-6 line-clamp-4 whitespace-pre-line leading-relaxed text-gray-700">
                        {event.description}
                      </p>

                      <Link
                        href={`/events/${event.id}`}
                        className="inline-flex rounded-2xl bg-black px-6 py-3 font-bold text-white transition hover:bg-gray-800"
                      >
                        자세히 보기
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 소식 올리기 */}
          <div
            id="upload"
            className="mb-16 scroll-mt-10 rounded-3xl bg-gray-100 p-5 md:p-10"
          >
            <p className="mb-3 text-xs tracking-[0.35em] text-gray-500">
              PARTICIPATION
            </p>

            <h2 className="mb-4 text-3xl font-black md:text-4xl">
              소식 올리기
            </h2>

            <p className="mb-8 text-gray-600">
              진안의 공연, 전시, 축제, 체험, 마을행사와 문화소식을 직접 올릴
              수 있습니다. 등록된 내용은 관리자 승인 후 게시됩니다.
            </p>

            <div className="rounded-3xl border border-gray-200 bg-white p-5 md:p-8">
              <h3 className="mb-4 text-2xl font-black">
                시민이 직접 문화소식 올리기
              </h3>

              <p className="mb-8 leading-relaxed text-gray-500">
                이미지를 올리고 행사 날짜를 입력하면 가까운 날짜순으로 자동
                정렬됩니다. 영상은 유튜브 링크로 등록해주세요. 권장 이미지
                크기는 <strong>800px ~ 1200px</strong>이며, 모바일 저장 용량을
                고려해 1MB 이하 이미지를 권장합니다.
              </p>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-bold text-gray-700">
                    행사 제목
                  </label>

                  <input
                    className="w-full rounded-2xl border border-gray-300 p-4"
                    placeholder="예: 진안 봄 전시회"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-gray-700">
                    행사 기간
                  </label>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-gray-300 p-4"
                      value={eventStartDate}
                      onChange={(e) => setEventStartDate(e.target.value)}
                    />

                    <span className="font-bold text-gray-500">~</span>

                    <input
                      type="date"
                      className="w-full rounded-2xl border border-gray-300 p-4"
                      value={eventEndDate}
                      onChange={(e) => setEventEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-bold text-gray-700">
                    장소
                  </label>

                  <input
                    className="w-full rounded-2xl border border-gray-300 p-4"
                    placeholder="예: 진안문화원"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-gray-700">
                    작성자
                  </label>

                  <input
                    className="w-full rounded-2xl border border-gray-300 p-4"
                    placeholder="예: 시민 제보자"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-gray-700">
                    올릴 파일 종류
                  </label>

                  <select
                    className="w-full rounded-2xl border border-gray-300 bg-white p-4"
                    value={uploadType}
                    onChange={(e) => {
                      setUploadType(e.target.value);
                      setImageFile(null);
                      setVideoUrl("");

                      const fileInput = document.getElementById(
                        "event-image-input"
                      ) as HTMLInputElement | null;

                      if (fileInput) {
                        fileInput.value = "";
                      }
                    }}
                  >
                    <option value="image">이미지</option>
                    <option value="video">영상행사</option>
                  </select>
                </div>

                {uploadType === "image" ? (
                  <div>
                    <label className="mb-2 block font-bold text-gray-700">
                      파일 업로드
                    </label>

                    <input
                      id="event-image-input"
                      type="file"
                      accept="image/*"
                      className="w-full rounded-2xl border border-gray-300 bg-white p-4"
                      onChange={(e) =>
                        handleImageChange(e.target.files?.[0] || null)
                      }
                    />

                    {imageFile && (
                      <p className="mt-3 text-sm text-gray-600">
                        선택된 이미지: {imageFile.name}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="mb-2 block font-bold text-gray-700">
                      유튜브 링크
                    </label>

                    <input
                      className="w-full rounded-2xl border border-gray-300 p-4"
                      placeholder="예: https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="mb-2 block font-bold text-gray-700">
                    설명
                  </label>

                  <textarea
                    className="min-h-40 w-full rounded-2xl border border-gray-300 p-4"
                    placeholder="행사 설명, 시간, 참가 방법 등을 적어주세요."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleSubmit}
                  className="rounded-2xl bg-purple-600 px-8 py-4 text-lg font-bold text-white transition hover:bg-purple-700"
                >
                  게시글 등록
                </button>

                <button
                  onClick={resetForm}
                  className="rounded-2xl bg-gray-200 px-8 py-4 text-lg font-bold text-gray-700 transition hover:bg-gray-300"
                >
                  다시 쓰기
                </button>
              </div>
            </div>
          </div>

          {/* 관리자 공지사항 */}
          <div className="mb-16 rounded-3xl bg-gray-50 p-6 shadow md:p-8">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-3 text-xs tracking-[0.35em] text-gray-500">
                  NOTICE
                </p>

                <h2 className="text-3xl font-black md:text-4xl">
                  관리자 공지사항
                </h2>
              </div>

              <Link
                href="/notices"
                className="w-fit rounded-2xl bg-black px-5 py-3 font-bold text-white transition hover:bg-gray-800"
              >
                공지사항 전체 보기
              </Link>
            </div>

            {notices.length === 0 ? (
              <p className="text-gray-500">등록된 공지사항이 없습니다.</p>
            ) : (
              <div className="grid gap-4">
                {notices.map((notice) => (
                  <Link
                    href="/notices"
                    key={notice.id}
                    className="rounded-2xl bg-white p-5 shadow transition hover:bg-gray-100"
                  >
                    <p className="mb-2 text-sm text-gray-500">
                      {notice.notice_date || "공지"}
                    </p>

                    <h3 className="mb-2 text-xl font-black">
                      {notice.title}
                    </h3>

                    <p className="line-clamp-2 leading-relaxed text-gray-600">
                      {notice.content}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 외부 연결 */}
          <div className="mb-8 rounded-3xl bg-white p-6 shadow md:p-8">
            <p className="mb-3 text-xs tracking-[0.35em] text-gray-500">
              RELATED LINKS
            </p>

            <h2 className="mb-6 text-3xl font-black md:text-4xl">
              관련 사이트
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href="https://jinanmunhwa.or.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-3xl bg-emerald-600 px-6 py-6 text-center text-xl font-black text-white shadow transition hover:bg-emerald-700"
              >
                진안문화원
              </a>

              <a
                href="https://blog.naver.com/kymo2002"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-3xl bg-green-600 px-6 py-6 text-center text-xl font-black text-white shadow transition hover:bg-green-700"
              >
                블로그
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white px-4 py-10 text-center">
        <p className="mb-2 text-lg font-black">진안문화아트</p>

        <p className="mb-6 text-sm text-gray-500">
          문화가 머무는 진안고원 · 군민참여 문화예술 기록 플랫폼
        </p>

        <div className="flex flex-col items-center gap-3 text-xs font-semibold text-gray-400 sm:flex-row sm:justify-center">
          <Link
            href="/memory"
            className="underline-offset-4 transition hover:text-gray-700 hover:underline"
          >
            진안의 시간
          </Link>

          <Link
            href="/notices"
            className="underline-offset-4 transition hover:text-gray-700 hover:underline"
          >
            공지사항
          </Link>

          <a
            href="https://jinanmunhwa.or.kr/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 transition hover:text-gray-700 hover:underline"
          >
            진안문화원
          </a>

          <a
            href="https://blog.naver.com/kymo2002"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 transition hover:text-gray-700 hover:underline"
          >
            블로그
          </a>

          <Link
            href="/admin"
            className="underline-offset-4 transition hover:text-gray-700 hover:underline"
          >
            관리자
          </Link>
        </div>
      </footer>
    </main>
  );
}