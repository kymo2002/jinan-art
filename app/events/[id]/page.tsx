"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  created_at?: string;
};

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const eventId = params?.id;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageOpen, setImageOpen] = useState(false);
  const [message, setMessage] = useState("");

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    const fetchEvent = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .eq("approved", true)
        .maybeSingle();

      if (error) {
        console.error(error);
      }

      if (!data) {
        setEvent(null);
        setLoading(false);
        return;
      }

      setEvent(data as EventItem);
      setLoading(false);
    };

    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    const fetchAllEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("approved", true);

      if (error) {
        console.error("행사 목록 불러오기 실패:", error);
        return;
      }

      const sortedEvents = ((data || []) as EventItem[]).sort((a, b) => {
        const aDate = a.start_date || a.event_date || "";
        const bDate = b.start_date || b.event_date || "";

        const dateCompare = aDate.localeCompare(bDate);
        if (dateCompare !== 0) {
          return dateCompare;
        }

        return (a.created_at || "").localeCompare(b.created_at || "");
      });

      setAllEvents(sortedEvents);
    };

    fetchAllEvents();
  }, []);

  useEffect(() => {
    if (!imageOpen) {
      return;
    }

    const closeWithEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setImageOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeWithEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [imageOpen]);

  const currentIndex = allEvents.findIndex((item) => item.id === eventId);
  const previousEvent =
    currentIndex > 0 ? allEvents[currentIndex - 1] : null;
  const nextEvent =
    currentIndex >= 0 && currentIndex < allEvents.length - 1
      ? allEvents[currentIndex + 1]
      : null;

  const goToPreviousEvent = () => {
    if (previousEvent) {
      router.push(`/events/${previousEvent.id}`);
    }
  };

  const goToNextEvent = () => {
    if (nextEvent) {
      router.push(`/events/${nextEvent.id}`);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    if (imageOpen) {
      return;
    }

    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    if (
      imageOpen ||
      touchStartX.current === null ||
      touchStartY.current === null
    ) {
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    const isHorizontalSwipe =
      Math.abs(deltaX) >= 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25;

    if (!isHorizontalSwipe) {
      return;
    }

    if (deltaX < 0) {
      goToNextEvent();
    } else {
      goToPreviousEvent();
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage("행사 주소를 복사했습니다.");
    } catch {
      setMessage("주소 복사에 실패했습니다.");
    }

    window.setTimeout(() => setMessage(""), 2500);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-16 text-black">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 text-center shadow">
          문화행사를 불러오는 중입니다.
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 text-black">
        <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-xl">
          <p className="mb-3 text-xs font-bold tracking-[0.3em] text-gray-400">
            JINAN CULTURE ART
          </p>
          <h1 className="mb-4 text-3xl font-black">행사를 찾을 수 없습니다</h1>
          <p className="mb-8 leading-relaxed text-gray-600">
            삭제되었거나 아직 승인되지 않은 문화행사입니다.
          </p>
          <Link
            href="/#events"
            className="inline-flex rounded-full bg-black px-7 py-4 font-bold text-white"
          >
            문화행사 목록으로
          </Link>
        </div>
      </main>
    );
  }

  const eventPeriod =
    event.start_date && event.end_date
      ? `${event.start_date} ~ ${event.end_date}`
      : event.event_date;

  return (
    <main
      className="min-h-screen bg-gray-100 px-4 py-8 text-black md:py-14"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <article className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-10">
          <Link
            href="/#events"
            className="inline-flex items-center gap-2 font-bold text-gray-600 transition hover:text-black"
          >
            <span aria-hidden="true">←</span>
            문화행사 목록
          </Link>

          <p className="text-xs font-bold tracking-[0.25em] text-gray-400">
            JINAN CULTURE ART
          </p>
        </div>

        {event.upload_type === "video" && event.video_url ? (
          <div className="bg-gray-950 px-5 py-14 text-center md:px-10">
            <p className="mb-5 font-bold text-white">영상 문화행사</p>
            <a
              href={event.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-full bg-red-600 px-7 py-4 font-bold text-white"
            >
              유튜브 영상 보기
            </a>
          </div>
        ) : event.image_url ? (
          <button
            type="button"
            onClick={() => setImageOpen(true)}
            className="group relative block w-full cursor-zoom-in bg-gray-100"
            aria-label="행사 사진 크게 보기"
          >
            <img
              src={event.image_url}
              alt={event.title}
              className="max-h-[78vh] w-full object-contain"
            />
            <span className="absolute bottom-4 right-4 rounded-full bg-black/65 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm transition group-hover:bg-black/80">
              사진 크게 보기
            </span>
          </button>
        ) : (
          <div className="flex min-h-72 items-center justify-center bg-gray-100 font-bold text-gray-400">
            행사 이미지 준비 중
          </div>
        )}

        <div className="px-5 py-8 md:px-10 md:py-12">
          <p className="mb-3 text-sm font-black text-blue-600">문화행사</p>

          <h1 className="mb-8 break-keep text-3xl font-black leading-tight md:text-5xl">
            {event.title}
          </h1>

          <div className="mb-10 grid gap-3 rounded-3xl bg-gray-50 p-5 text-sm md:grid-cols-2 md:p-7 md:text-base">
            <div className="flex gap-3">
              <span aria-hidden="true">📅</span>
              <div>
                <p className="mb-1 font-bold text-gray-900">행사 기간</p>
                <p className="text-gray-600">{eventPeriod}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span aria-hidden="true">📍</span>
              <div>
                <p className="mb-1 font-bold text-gray-900">행사 장소</p>
                <p className="text-gray-600">{event.location}</p>
              </div>
            </div>

            {event.author && (
              <div className="flex gap-3">
                <span aria-hidden="true">✍️</span>
                <div>
                  <p className="mb-1 font-bold text-gray-900">작성자</p>
                  <p className="text-gray-600">{event.author}</p>
                </div>
              </div>
            )}
          </div>

          <section className="mb-12">
            <h2 className="mb-5 text-2xl font-black">행사 소개</h2>
            <p className="whitespace-pre-line break-words text-base leading-8 text-gray-700 md:text-lg md:leading-9">
              {event.description}
            </p>
          </section>

          <div className="mb-7 border-t border-gray-100 pt-7">
            <p className="mb-4 text-center text-xs font-bold text-gray-400 md:hidden">
              화면을 좌우로 밀어 이전·다음 행사를 볼 수 있습니다
            </p>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {previousEvent ? (
                <Link
                  href={`/events/${previousEvent.id}`}
                  className="flex min-h-14 items-center justify-center rounded-2xl border border-gray-300 px-2 py-3 text-center text-sm font-bold text-gray-700 transition hover:bg-gray-100 sm:px-5 sm:text-base"
                >
                  <span className="mr-1" aria-hidden="true">〈</span>
                  이전 행사
                </Link>
              ) : (
                <div className="flex min-h-14 items-center justify-center rounded-2xl border border-gray-200 px-2 py-3 text-center text-sm font-bold text-gray-300 sm:px-5 sm:text-base">
                  <span className="mr-1" aria-hidden="true">〈</span>
                  이전 행사
                </div>
              )}

              <Link
                href="/#events"
                className="flex min-h-14 items-center justify-center rounded-2xl bg-black px-2 py-3 text-center text-sm font-bold text-white transition hover:bg-gray-800 sm:px-5 sm:text-base"
              >
                행사목록
              </Link>

              {nextEvent ? (
                <Link
                  href={`/events/${nextEvent.id}`}
                  className="flex min-h-14 items-center justify-center rounded-2xl border border-gray-300 px-2 py-3 text-center text-sm font-bold text-gray-700 transition hover:bg-gray-100 sm:px-5 sm:text-base"
                >
                  다음 행사
                  <span className="ml-1" aria-hidden="true">〉</span>
                </Link>
              ) : (
                <div className="flex min-h-14 items-center justify-center rounded-2xl border border-gray-200 px-2 py-3 text-center text-sm font-bold text-gray-300 sm:px-5 sm:text-base">
                  다음 행사
                  <span className="ml-1" aria-hidden="true">〉</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 pt-7 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={copyLink}
              className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700"
            >
              링크 복사
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-2xl border border-gray-300 px-6 py-4 font-bold text-gray-700 transition hover:bg-gray-100"
            >
              인쇄하기
            </button>

            <Link
              href="/#events"
              className="rounded-2xl border border-gray-300 px-6 py-4 text-center font-bold text-gray-700 transition hover:bg-gray-100"
            >
              목록으로 돌아가기
            </Link>
          </div>

          {message && (
            <p className="mt-4 text-sm font-bold text-blue-600">{message}</p>
          )}
        </div>
      </article>

      {imageOpen && event.image_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="확대된 행사 사진"
          onClick={() => setImageOpen(false)}
        >
          <button
            type="button"
            onClick={() => setImageOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white px-4 py-2 font-black text-black shadow-lg"
          >
            닫기 ×
          </button>

          <img
            src={event.image_url}
            alt={event.title}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
