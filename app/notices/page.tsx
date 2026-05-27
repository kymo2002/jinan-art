"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type NoticeItem = {
  id: string;
  title: string;
  content: string;
  notice_date?: string;
  published: boolean;
  created_at?: string;
};

export default function NoticesPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [searchText, setSearchText] = useState("");

  const fetchNotices = async () => {
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setNotices(data || []);
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const filteredNotices = notices.filter((notice) => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) {
      return true;
    }

    return (
      notice.title.toLowerCase().includes(keyword) ||
      notice.content.toLowerCase().includes(keyword) ||
      (notice.notice_date || "").toLowerCase().includes(keyword)
    );
  });

  return (
    <main className="min-h-screen bg-gray-100 text-black">
      <section className="bg-white px-4 py-16 shadow-sm md:px-6 md:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-xs tracking-[0.4em] text-gray-500">
            JINAN CULTURE ART NOTICE
          </p>

          <h1 className="mb-6 text-5xl font-black leading-tight md:text-7xl">
            공지사항
          </h1>

          <p className="mb-8 text-lg leading-relaxed text-gray-600">
            진안문화아트 관리자가 전하는 안내와 운영 소식입니다.
          </p>

          <Link
            href="/"
            className="inline-flex rounded-2xl bg-black px-6 py-3 font-bold text-white transition hover:bg-gray-800"
          >
            메인으로 돌아가기
          </Link>
        </div>
      </section>

      <section className="px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-5 shadow-xl md:p-10">
          <div className="mb-8 rounded-3xl bg-gray-50 p-5">
            <label className="mb-3 block font-bold text-gray-700">
              공지사항 검색
            </label>

            <input
              className="w-full rounded-2xl border border-gray-300 bg-white p-4"
              placeholder="제목, 날짜, 내용으로 검색하세요"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <p className="mt-3 text-sm text-gray-500">
              전체 {notices.length}개 중 {filteredNotices.length}개 공지가
              표시됩니다.
            </p>
          </div>

          {notices.length === 0 ? (
            <div className="rounded-3xl bg-gray-50 p-8 text-gray-500">
              등록된 공지사항이 없습니다.
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="rounded-3xl bg-gray-50 p-8 text-gray-500">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredNotices.map((notice) => (
                <article
                  key={notice.id}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow md:p-8"
                >
                  <p className="mb-3 text-sm text-gray-500">
                    {notice.notice_date || "공지"}
                  </p>

                  <h2 className="mb-5 text-3xl font-black leading-tight">
                    {notice.title}
                  </h2>

                  <p className="whitespace-pre-line leading-relaxed text-gray-700">
                    {notice.content}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white px-4 py-10 text-center">
        <p className="mb-2 text-lg font-black">진안문화아트</p>

        <p className="mb-6 text-sm text-gray-500">
          문화가 머무는 진안고원 · 관리자 공지사항
        </p>

        <div className="flex flex-col items-center gap-3 text-xs font-semibold text-gray-400 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="underline-offset-4 transition hover:text-gray-700 hover:underline"
          >
            메인
          </Link>

          <Link
            href="/memory"
            className="underline-offset-4 transition hover:text-gray-700 hover:underline"
          >
            진안의 시간
          </Link>

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