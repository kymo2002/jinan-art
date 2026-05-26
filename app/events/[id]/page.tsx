"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type EventItem = {
  id: string;
  title: string;
  event_date: string;
  location: string;
  description: string;
  approved: boolean;
  image_url?: string;
};

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvent = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .eq("approved", true)
      .single();

    if (error) {
      console.log(error);
      setEvent(null);
      setLoading(false);
      return;
    }

    setEvent(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-10 text-black">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-xl">
          불러오는 중입니다...
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-10 text-black">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-xl">
          <p className="mb-6 text-gray-600">
            해당 행사를 찾을 수 없거나 아직 승인되지 않은 행사입니다.
          </p>

          <Link
            href="/"
            className="inline-flex rounded-2xl bg-black px-6 py-3 font-bold text-white transition hover:bg-gray-800"
          >
            메인으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 text-black md:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex rounded-full border border-gray-300 bg-white px-5 py-3 font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            ← 메인으로 돌아가기
          </Link>
        </div>

        <article className="overflow-hidden rounded-3xl bg-white shadow-xl">
          {event.image_url && (
            <div className="flex w-full items-center justify-center bg-gray-100 p-4 md:p-8">
              <img
                src={event.image_url}
                alt={event.title}
                className="max-h-[850px] w-full object-contain"
              />
            </div>
          )}

          <div className="p-6 md:p-10">
            <p className="mb-4 text-xs tracking-[0.35em] text-gray-500">
              JINAN CULTURE EVENT
            </p>

            <h1 className="mb-6 text-4xl font-black leading-tight md:text-6xl">
              {event.title}
            </h1>

            <div className="mb-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-gray-100 p-5">
                <p className="mb-2 text-sm text-gray-500">행사 날짜</p>
                <p className="text-lg font-bold">{event.event_date}</p>
              </div>

              <div className="rounded-2xl bg-gray-100 p-5">
                <p className="mb-2 text-sm text-gray-500">행사 장소</p>
                <p className="text-lg font-bold">{event.location}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white">
              <h2 className="mb-4 text-2xl font-black">행사 소개</h2>

              <p className="whitespace-pre-line text-lg leading-relaxed text-gray-700">
                {event.description}
              </p>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}