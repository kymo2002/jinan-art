"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
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
  created_at?: string;
  views?: number;
};

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const eventId = params?.id;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageOpen, setImageOpen] = useState(false);
  const [message, setMessage] = useState("");

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

      let currentEvent = data as EventItem;
      const viewStorageKey = `jinan-art-viewed-event-${eventId}`;
      const alreadyCounted =
        typeof window !== "undefined" &&
        window.sessionStorage.getItem(viewStorageKey) === "true";

      if (!alreadyCounted) {
        const { data: updatedViews, error: viewError } = await supabase.rpc(
          "increment_event_views",
          { event_id_input: eventId }
        );

        if (viewError) {
          console.error("조회수 증가 실패:", viewError);
        } else {
          currentEvent = {
            ...currentEvent,
            views:
              typeof updatedViews === "number"
                ? updatedViews
                : (currentEvent.views ?? 0) + 1,
          };

          window.sessionStorage.setItem(viewStorageKey, "true");
        }
      }

      setEvent(currentEvent);
      setLoading(false);
    };

    fetchEvent();
  }, [eventId]);

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
    <main className="min-h-screen bg-gray-100 px-4 py-8 text-black md:py-14">
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

            <div className="flex gap-3">
              <span aria-hidden="true">👁</span>
              <div>
                <p className="mb-1 font-bold text-gray-900">조회수</p>
                <p className="text-gray-600">{event.views ?? 0}</p>
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
