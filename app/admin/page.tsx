"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type EventItem = {
  id: string;
  title: string;
  event_date: string;
  location: string;
  description: string;
  approved: boolean;
  image_url?: string;
  is_featured: boolean;
  display_order: number | null;
  created_at?: string;
};

export default function AdminPage() {
  const [pendingEvents, setPendingEvents] = useState<EventItem[]>([]);
  const [approvedEvents, setApprovedEvents] = useState<EventItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchEvents = async () => {
    const [pendingResult, approvedResult] = await Promise.all([
      supabase
        .from("events")
        .select("*")
        .eq("approved", false)
        .order("created_at", { ascending: false }),
      supabase
        .from("events")
        .select("*")
        .eq("approved", true)
        .order("is_featured", { ascending: false })
        .order("display_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false }),
    ]);

    if (pendingResult.error) {
      console.log(pendingResult.error);
      alert("승인 대기 목록을 불러오지 못했습니다.");
    } else {
      setPendingEvents(pendingResult.data || []);
    }

    if (approvedResult.error) {
      console.log(approvedResult.error);
      alert("승인된 문화소식 목록을 불러오지 못했습니다.");
    } else {
      setApprovedEvents(approvedResult.data || []);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getNextDisplayOrder = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("display_order")
      .eq("approved", true)
      .order("display_order", { ascending: false, nullsFirst: false })
      .limit(1);

    if (error) {
      console.log(error);
      return approvedEvents.length + 1;
    }

    const currentMax = data?.[0]?.display_order;
    return typeof currentMax === "number" ? currentMax + 1 : 1;
  };

  const approveEvent = async (id: string) => {
    setIsSaving(true);

    const nextOrder = await getNextDisplayOrder();
    const { error } = await supabase
      .from("events")
      .update({
        approved: true,
        is_featured: false,
        display_order: nextOrder,
      })
      .eq("id", id);

    setIsSaving(false);

    if (error) {
      console.log(error);
      alert("승인 실패");
      return;
    }

    alert("승인 완료");
    fetchEvents();
  };

  const setFeaturedEvent = async (id: string) => {
    setIsSaving(true);

    const { error: clearError } = await supabase
      .from("events")
      .update({ is_featured: false })
      .eq("approved", true);

    if (clearError) {
      setIsSaving(false);
      console.log(clearError);
      alert("기존 맨앞 고정을 해제하지 못했습니다.");
      return;
    }

    const { error: featureError } = await supabase
      .from("events")
      .update({ is_featured: true })
      .eq("id", id);

    setIsSaving(false);

    if (featureError) {
      console.log(featureError);
      alert("맨앞 고정 실패");
      return;
    }

    alert("선택한 문화소식을 맨앞에 고정했습니다.");
    fetchEvents();
  };

  const clearFeaturedEvent = async (id: string) => {
    setIsSaving(true);

    const { error } = await supabase
      .from("events")
      .update({ is_featured: false })
      .eq("id", id);

    setIsSaving(false);

    if (error) {
      console.log(error);
      alert("고정 해제 실패");
      return;
    }

    alert("맨앞 고정을 해제했습니다.");
    fetchEvents();
  };

  const saveRegularOrder = async (orderedEvents: EventItem[]) => {
    const updateResults = await Promise.all(
      orderedEvents.map((event, index) =>
        supabase
          .from("events")
          .update({ display_order: index + 1 })
          .eq("id", event.id),
      ),
    );

    const failedResult = updateResults.find((result) => result.error);

    if (failedResult?.error) {
      console.log(failedResult.error);
      throw failedResult.error;
    }
  };

  const moveEvent = async (id: string, direction: "up" | "down") => {
    const regularEvents = approvedEvents.filter((event) => !event.is_featured);
    const currentIndex = regularEvents.findIndex((event) => event.id === id);

    if (currentIndex === -1) {
      return;
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= regularEvents.length) {
      return;
    }

    const reorderedEvents = [...regularEvents];
    [reorderedEvents[currentIndex], reorderedEvents[targetIndex]] = [
      reorderedEvents[targetIndex],
      reorderedEvents[currentIndex],
    ];

    setIsSaving(true);

    try {
      await saveRegularOrder(reorderedEvents);
      await fetchEvents();
    } catch (error) {
      console.log(error);
      alert("순서 변경 실패");
    } finally {
      setIsSaving(false);
    }
  };

  const regularEvents = approvedEvents.filter((event) => !event.is_featured);

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 text-black md:p-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-4 text-4xl font-black md:text-5xl">
          관리자 페이지
        </h1>

        <p className="mb-10 text-gray-600">
          행사 승인과 메인페이지 문화소식 표시 순서를 관리합니다.
        </p>

        {/* 승인 대기 */}
        <section className="mb-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-3xl font-black">승인 대기</h2>
            <span className="text-sm text-gray-500">
              {pendingEvents.length}건
            </span>
          </div>

          {pendingEvents.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-gray-500 shadow">
              승인 대기 중인 행사가 없습니다.
            </div>
          ) : (
            <div className="grid gap-6">
              {pendingEvents.map((event) => (
                <article
                  key={event.id}
                  className="rounded-3xl bg-white p-6 shadow-lg md:p-8"
                >
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="mb-6 h-64 w-full rounded-2xl object-cover"
                    />
                  )}

                  <p className="mb-2 text-sm text-gray-500">
                    {event.event_date}
                  </p>

                  <h3 className="mb-4 text-2xl font-bold md:text-3xl">
                    {event.title}
                  </h3>

                  <p className="mb-4 text-gray-600">{event.location}</p>

                  <p className="mb-6 whitespace-pre-wrap leading-relaxed text-gray-700">
                    {event.description}
                  </p>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => approveEvent(event.id)}
                    className="rounded-2xl bg-black px-6 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    승인하기
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 승인된 문화소식 순서 관리 */}
        <section>
          <div className="mb-6">
            <h2 className="mb-3 text-3xl font-black">
              문화소식 순서 관리
            </h2>
            <p className="text-gray-600">
              맨앞 고정은 한 건만 가능하며, 나머지 소식은 위·아래 버튼으로
              순서를 바꿀 수 있습니다.
            </p>
          </div>

          {approvedEvents.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-gray-500 shadow">
              승인된 문화소식이 없습니다.
            </div>
          ) : (
            <div className="grid gap-5">
              {approvedEvents.map((event) => {
                const regularIndex = regularEvents.findIndex(
                  (item) => item.id === event.id,
                );
                const isFirstRegular = regularIndex === 0;
                const isLastRegular = regularIndex === regularEvents.length - 1;

                return (
                  <article
                    key={event.id}
                    className={`rounded-3xl border-2 bg-white p-5 shadow-lg md:p-7 ${
                      event.is_featured
                        ? "border-amber-400"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center">
                      {event.image_url && (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="h-36 w-full rounded-2xl object-cover md:w-52"
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          {event.is_featured && (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                              맨앞 고정됨
                            </span>
                          )}
                          {!event.is_featured && (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                              일반 순서 {regularIndex + 1}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {event.event_date}
                          </span>
                        </div>

                        <h3 className="mb-2 text-xl font-bold md:text-2xl">
                          {event.title}
                        </h3>
                        <p className="text-gray-600">{event.location}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 md:w-56 md:justify-end">
                        {event.is_featured ? (
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => clearFeaturedEvent(event.id)}
                            className="rounded-xl bg-gray-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            고정 해제
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => setFeaturedEvent(event.id)}
                            className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            맨앞 고정
                          </button>
                        )}

                        {!event.is_featured && (
                          <>
                            <button
                              type="button"
                              disabled={isSaving || isFirstRegular}
                              onClick={() => moveEvent(event.id, "up")}
                              className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                            >
                              ▲ 위로
                            </button>

                            <button
                              type="button"
                              disabled={isSaving || isLastRegular}
                              onClick={() => moveEvent(event.id, "down")}
                              className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                            >
                              ▼ 아래로
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
