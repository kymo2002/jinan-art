"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type EventItem = {
  id?: string;
  title: string;
  event_date: string;
  location: string;
  description: string;
  approved: boolean;
  image_url?: string;
  is_featured?: boolean;
  display_order?: number | null;
  created_at?: string;
};

export default function Home() {
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);

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

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async () => {
    if (!title || !eventDate || !location || !description) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    let imageUrl = "";

    if (imageFile) {
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

    const { error } = await supabase.from("events").insert([
      {
        title,
        event_date: eventDate,
        location,
        description,
        image_url: imageUrl,
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
    setEventDate("");
    setLocation("");
    setDescription("");
    setImageFile(null);
  };

  return (
    <main className="min-h-screen bg-gray-100 text-black">
      {/* HERO */}
      <section
        className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-6 text-white"
        style={{ backgroundImage: "url('/images/main-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/45" />

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

          {/* CARD SECTION */}
          <div className="mb-16 grid gap-6 md:grid-cols-3">
            <div className="overflow-hidden rounded-3xl bg-gray-50 shadow">
              <img
                src="/images/flower-maisan.jpg"
                alt="오늘의 문화"
                className="h-80 w-full object-cover"
              />
              <div className="p-5">
                <p className="mb-2 text-xs tracking-[0.25em] text-gray-400">
                  CULTURE
                </p>
                <h3 className="mb-2 text-2xl font-bold">오늘의 문화</h3>
                <p className="text-gray-600">
                  진안의 문화예술 소식을 전합니다.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl bg-gray-50 shadow">
              <img
                src="/images/old-jinan.jpg"
                alt="진안의 시간"
                className="h-80 w-full object-cover"
              />
              <div className="p-5">
                <p className="mb-2 text-xs tracking-[0.25em] text-gray-400">
                  MEMORY
                </p>
                <h3 className="mb-2 text-2xl font-bold">진안의 시간</h3>
                <p className="text-gray-600">
                  오래된 풍경과 기억을 보존합니다.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl bg-gray-50 shadow">
              <img
                src="/images/festival.jpg"
                alt="지역 문화 축제"
                className="h-80 w-full object-cover"
              />
              <div className="p-5">
                <p className="mb-2 text-xs tracking-[0.25em] text-gray-400">
                  FESTIVAL
                </p>
                <h3 className="mb-2 text-2xl font-bold">지역 문화 축제</h3>
                <p className="text-gray-600">
                  누구나 참여하는 문화 플랫폼입니다.
                </p>
              </div>
            </div>
          </div>

          {/* UPLOAD FORM */}
          <div id="upload" className="rounded-3xl bg-gray-100 p-6 md:p-10">
            <p className="mb-3 text-xs tracking-[0.35em] text-gray-500">
              PARTICIPATION
            </p>

            <h2 className="mb-4 text-3xl font-black md:text-4xl">
              행사 올리기
            </h2>

            <p className="mb-8 text-gray-600">
              진안의 공연, 전시, 축제, 체험, 마을행사를 자유롭게 등록할 수
              있습니다. 등록된 내용은 관리자 승인 후 게시됩니다.
            </p>

            <div className="grid gap-4">
              <input
                className="rounded-2xl border border-gray-300 p-4"
                placeholder="행사명"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                className="rounded-2xl border border-gray-300 p-4"
                placeholder="행사 날짜"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />

              <input
                className="rounded-2xl border border-gray-300 p-4"
                placeholder="행사 장소"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              <textarea
                className="min-h-40 rounded-2xl border border-gray-300 p-4"
                placeholder="행사 소개"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <input
                type="file"
                accept="image/*"
                className="rounded-2xl border border-gray-300 bg-white p-4"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />

              <button
                onClick={handleSubmit}
                className="rounded-2xl bg-black py-4 text-lg font-bold text-white transition hover:bg-gray-800"
              >
                관리자 승인 요청하기
              </button>
            </div>
          </div>

          {/* EVENT LIST */}
          <div id="events" className="mt-16">
            <h2 className="mb-8 text-3xl font-black md:text-4xl">
              등록된 행사
            </h2>

            {events.length === 0 ? (
              <div className="rounded-3xl bg-gray-50 p-8 text-gray-500">
                아직 승인된 행사가 없습니다.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {events.map((event) => (
                  <div
                    key={event.id || event.title}
                    className="rounded-3xl bg-white p-8 shadow-lg"
                  >
                    {event.image_url && (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="mb-6 h-72 w-full rounded-2xl object-cover"
                      />
                    )}

                    <p className="mb-2 text-sm text-gray-500">
                      {event.event_date}
                    </p>

                    <h3 className="mb-4 text-2xl font-bold">
                      {event.title}
                    </h3>

                    <p className="mb-4 text-gray-600">{event.location}</p>

                    <p className="leading-relaxed text-gray-700">
                      {event.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
