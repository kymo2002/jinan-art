"use client";

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

type MemoryPost = {
  id: string;
  title: string;
  memory_date?: string;
  location?: string;
  description: string;
  person_name?: string;
  approved: boolean;
  image_url?: string;
  created_at?: string;
};

type NoticeItem = {
  id: string;
  title: string;
  content: string;
  notice_date?: string;
  published: boolean;
  created_at?: string;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"events" | "memory" | "notices">(
    "events"
  );

  const [events, setEvents] = useState<EventItem[]>([]);
  const [memoryPosts, setMemoryPosts] = useState<MemoryPost[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);

  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDate, setNoticeDate] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticePublished, setNoticePublished] = useState(true);

  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);

  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  useEffect(() => {
    const savedAdmin = sessionStorage.getItem("jinan-art-admin");

    if (savedAdmin === "true") {
      setIsAdmin(true);
      fetchAllData();
    }
  }, []);

  const handleLogin = () => {
    if (!adminPassword) {
      setLoginError("관리자 비밀번호 환경변수가 설정되지 않았습니다.");
      return;
    }

    if (password === adminPassword) {
      setIsAdmin(true);
      setLoginError("");
      sessionStorage.setItem("jinan-art-admin", "true");
      fetchAllData();
    } else {
      setLoginError("비밀번호가 맞지 않습니다.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("jinan-art-admin");
    setIsAdmin(false);
    setPassword("");
  };

  const fetchAllData = async () => {
    await Promise.all([fetchEvents(), fetchMemoryPosts(), fetchNotices()]);
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("approved", { ascending: true })
      .order("event_date", { ascending: true });

    if (error) {
      console.log(error);
      alert("행사 목록을 불러오지 못했습니다.");
      return;
    }

    setEvents(data || []);
  };

  const fetchMemoryPosts = async () => {
    const { data, error } = await supabase
      .from("memory_posts")
      .select("*")
      .order("approved", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setMemoryPosts(data || []);
  };

  const fetchNotices = async () => {
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setNotices(data || []);
  };

  const getImagePathFromUrl = (imageUrl: string | undefined, bucket: string) => {
    if (!imageUrl) {
      return null;
    }

    const marker = `/${bucket}/`;
    const markerIndex = imageUrl.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(imageUrl.substring(markerIndex + marker.length));
  };

  const deleteImageFromStorage = async (
    imageUrl: string | undefined,
    bucket: string
  ) => {
    const imagePath = getImagePathFromUrl(imageUrl, bucket);

    if (!imagePath) {
      return true;
    }

    const { error } = await supabase.storage.from(bucket).remove([imagePath]);

    if (error) {
      console.log(error);
      return false;
    }

    return true;
  };

  const approveEvent = async (id: string) => {
    const { error } = await supabase
      .from("events")
      .update({ approved: true })
      .eq("id", id);

    if (error) {
      console.log(error);
      alert("승인 실패");
      return;
    }

    alert("승인 완료");
    fetchEvents();
  };

  const cancelApproveEvent = async (id: string) => {
    const { error } = await supabase
      .from("events")
      .update({ approved: false })
      .eq("id", id);

    if (error) {
      console.log(error);
      alert("승인 취소 실패");
      return;
    }

    alert("승인 취소 완료");
    fetchEvents();
  };

  const deleteEvent = async (event: EventItem) => {
    const confirmDelete = window.confirm(
      `"${event.title}" 행사를 삭제하시겠습니까?\n이미지가 있으면 함께 삭제됩니다.`
    );

    if (!confirmDelete) {
      return;
    }

    if (event.image_url) {
      const imageDeleted = await deleteImageFromStorage(
        event.image_url,
        "event-images"
      );

      if (!imageDeleted) {
        alert("이미지 삭제 실패. 글 삭제를 중단합니다.");
        return;
      }
    }

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", event.id);

    if (error) {
      console.log(error);
      alert("행사 삭제 실패");
      return;
    }

    alert("행사 삭제 완료");
    fetchEvents();
  };

  const approveMemory = async (id: string) => {
    const { error } = await supabase
      .from("memory_posts")
      .update({ approved: true })
      .eq("id", id);

    if (error) {
      console.log(error);
      alert("승인 실패");
      return;
    }

    alert("승인 완료");
    fetchMemoryPosts();
  };

  const cancelApproveMemory = async (id: string) => {
    const { error } = await supabase
      .from("memory_posts")
      .update({ approved: false })
      .eq("id", id);

    if (error) {
      console.log(error);
      alert("승인 취소 실패");
      return;
    }

    alert("승인 취소 완료");
    fetchMemoryPosts();
  };

  const deleteMemory = async (post: MemoryPost) => {
    const confirmDelete = window.confirm(
      `"${post.title}" 사진 기록을 삭제하시겠습니까?\n이미지가 있으면 함께 삭제됩니다.`
    );

    if (!confirmDelete) {
      return;
    }

    if (post.image_url) {
      const imageDeleted = await deleteImageFromStorage(
        post.image_url,
        "memory-images"
      );

      if (!imageDeleted) {
        alert("이미지 삭제 실패. 글 삭제를 중단합니다.");
        return;
      }
    }

    const { error } = await supabase
      .from("memory_posts")
      .delete()
      .eq("id", post.id);

    if (error) {
      console.log(error);
      alert("사진 기록 삭제 실패");
      return;
    }

    alert("사진 기록 삭제 완료");
    fetchMemoryPosts();
  };

  const resetNoticeForm = () => {
    setNoticeTitle("");
    setNoticeDate("");
    setNoticeContent("");
    setNoticePublished(true);
    setEditingNoticeId(null);
  };

  const saveNotice = async () => {
    if (!noticeTitle || !noticeContent) {
      alert("공지 제목과 내용을 입력해주세요.");
      return;
    }

    if (editingNoticeId) {
      const { error } = await supabase
        .from("notices")
        .update({
          title: noticeTitle,
          content: noticeContent,
          notice_date: noticeDate,
          published: noticePublished,
        })
        .eq("id", editingNoticeId);

      if (error) {
        console.log(error);
        alert("공지 수정 실패");
        return;
      }

      alert("공지 수정 완료");
      resetNoticeForm();
      fetchNotices();
      return;
    }

    const { error } = await supabase.from("notices").insert([
      {
        title: noticeTitle,
        content: noticeContent,
        notice_date: noticeDate,
        published: noticePublished,
      },
    ]);

    if (error) {
      console.log(error);
      alert("공지 등록 실패");
      return;
    }

    alert("공지 등록 완료");
    resetNoticeForm();
    fetchNotices();
  };

  const startEditNotice = (notice: NoticeItem) => {
    setEditingNoticeId(notice.id);
    setNoticeTitle(notice.title);
    setNoticeDate(notice.notice_date || "");
    setNoticeContent(notice.content);
    setNoticePublished(notice.published);
  };

  const deleteNotice = async (notice: NoticeItem) => {
    const confirmDelete = window.confirm(
      `"${notice.title}" 공지사항을 삭제하시겠습니까?`
    );

    if (!confirmDelete) {
      return;
    }

    const { error } = await supabase
      .from("notices")
      .delete()
      .eq("id", notice.id);

    if (error) {
      console.log(error);
      alert("공지 삭제 실패");
      return;
    }

    alert("공지 삭제 완료");
    fetchNotices();
  };

  const toggleNoticePublished = async (notice: NoticeItem) => {
    const { error } = await supabase
      .from("notices")
      .update({ published: !notice.published })
      .eq("id", notice.id);

    if (error) {
      console.log(error);
      alert("공개 상태 변경 실패");
      return;
    }

    fetchNotices();
  };

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 text-black">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <p className="mb-3 text-xs tracking-[0.35em] text-gray-500">
            JINAN CULTURE ART ADMIN
          </p>

          <h1 className="mb-4 text-4xl font-black">관리자 로그인</h1>

          <p className="mb-8 leading-relaxed text-gray-600">
            행사, 진안의 시간, 공지사항을 관리하려면 비밀번호를 입력해주세요.
          </p>

          <input
            type="password"
            className="mb-4 w-full rounded-2xl border border-gray-300 p-4"
            placeholder="관리자 비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLogin();
              }
            }}
          />

          {loginError && (
            <p className="mb-4 text-sm font-semibold text-red-600">
              {loginError}
            </p>
          )}

          <button
            onClick={handleLogin}
            className="w-full rounded-2xl bg-black py-4 text-lg font-bold text-white transition hover:bg-gray-800"
          >
            관리자 접속
          </button>
        </div>
      </main>
    );
  }

  const waitingEvents = events.filter((event) => !event.approved);
  const waitingMemory = memoryPosts.filter((post) => !post.approved);

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 text-black md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-lg md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="mb-3 text-xs tracking-[0.35em] text-gray-500">
                JINAN CULTURE ART ADMIN
              </p>

              <h1 className="mb-4 text-4xl font-black md:text-5xl">
                관리자 페이지
              </h1>

              <p className="leading-relaxed text-gray-600">
                행사, 진안의 시간 사진 기록, 공지사항을 관리합니다.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-2xl border border-gray-300 px-5 py-3 font-bold text-gray-700 transition hover:bg-gray-100"
            >
              로그아웃
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-5">
          <div className="rounded-3xl bg-white p-6 shadow">
            <p className="mb-2 text-sm text-gray-500">전체 행사</p>
            <p className="text-4xl font-black">{events.length}</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow">
            <p className="mb-2 text-sm text-gray-500">행사 승인 대기</p>
            <p className="text-4xl font-black text-orange-600">
              {waitingEvents.length}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow">
            <p className="mb-2 text-sm text-gray-500">사진 승인 대기</p>
            <p className="text-4xl font-black text-orange-600">
              {waitingMemory.length}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow">
            <p className="mb-2 text-sm text-gray-500">공지사항</p>
            <p className="text-4xl font-black">{notices.length}</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow">
            <p className="mb-2 text-sm text-gray-500">공개 공지</p>
            <p className="text-4xl font-black text-green-600">
              {notices.filter((notice) => notice.published).length}
            </p>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-3 rounded-3xl bg-white p-4 shadow sm:flex-row">
          <button
            onClick={() => setActiveTab("events")}
            className={`rounded-2xl px-6 py-4 font-bold transition ${
              activeTab === "events"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            문화행사 관리
          </button>

          <button
            onClick={() => setActiveTab("memory")}
            className={`rounded-2xl px-6 py-4 font-bold transition ${
              activeTab === "memory"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            진안의 시간 관리
          </button>

          <button
            onClick={() => setActiveTab("notices")}
            className={`rounded-2xl px-6 py-4 font-bold transition ${
              activeTab === "notices"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            공지사항 관리
          </button>
        </div>

        {activeTab === "events" && (
          <section>
            <h2 className="mb-6 text-3xl font-black">문화행사 관리</h2>

            {events.length === 0 ? (
              <div className="rounded-3xl bg-white p-8 text-gray-500 shadow">
                등록된 행사가 없습니다.
              </div>
            ) : (
              <div className="grid gap-6">
                {events.map((event) => (
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
                          className="inline-flex rounded-2xl bg-red-600 px-6 py-3 font-bold text-white"
                        >
                          유튜브 영상 보기
                        </a>
                      </div>
                    ) : (
                      event.image_url && (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="max-h-[680px] w-full bg-gray-100 object-contain"
                        />
                      )
                    )}

                    <div className="p-6 md:p-8">
                      <span
                        className={`mb-5 inline-flex rounded-full px-4 py-2 text-sm font-bold ${
                          event.approved
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {event.approved ? "승인 완료" : "승인 대기"}
                      </span>

                      <p className="mb-2 text-sm text-gray-500">
                        {event.event_date}
                      </p>

                      <h3 className="mb-4 text-3xl font-bold">
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

                      <p className="mb-8 whitespace-pre-line leading-relaxed text-gray-700">
                        {event.description}
                      </p>

                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        {!event.approved ? (
                          <button
                            onClick={() => approveEvent(event.id)}
                            className="rounded-2xl bg-black px-6 py-4 font-bold text-white"
                          >
                            승인하기
                          </button>
                        ) : (
                          <button
                            onClick={() => cancelApproveEvent(event.id)}
                            className="rounded-2xl bg-orange-500 px-6 py-4 font-bold text-white"
                          >
                            승인취소
                          </button>
                        )}

                        <button
                          onClick={() => deleteEvent(event)}
                          className="rounded-2xl bg-red-600 px-6 py-4 font-bold text-white"
                        >
                          삭제하기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "memory" && (
          <section>
            <h2 className="mb-6 text-3xl font-black">진안의 시간 관리</h2>

            {memoryPosts.length === 0 ? (
              <div className="rounded-3xl bg-white p-8 text-gray-500 shadow">
                등록된 사진 기록이 없습니다.
              </div>
            ) : (
              <div className="grid gap-6">
                {memoryPosts.map((post) => (
                  <div
                    key={post.id}
                    className="overflow-hidden rounded-3xl bg-white shadow-lg"
                  >
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="max-h-[680px] w-full bg-gray-100 object-contain"
                      />
                    )}

                    <div className="p-6 md:p-8">
                      <span
                        className={`mb-5 inline-flex rounded-full px-4 py-2 text-sm font-bold ${
                          post.approved
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {post.approved ? "승인 완료" : "승인 대기"}
                      </span>

                      <p className="mb-2 text-sm text-gray-500">
                        {post.memory_date || "시기 미상"}
                      </p>

                      <h3 className="mb-4 text-3xl font-bold">
                        {post.title}
                      </h3>

                      {post.location && (
                        <p className="mb-3 font-semibold text-gray-600">
                          장소: {post.location}
                        </p>
                      )}

                      {post.person_name && (
                        <p className="mb-5 text-sm text-gray-500">
                          제공: {post.person_name}
                        </p>
                      )}

                      <p className="mb-8 whitespace-pre-line leading-relaxed text-gray-700">
                        {post.description}
                      </p>

                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        {!post.approved ? (
                          <button
                            onClick={() => approveMemory(post.id)}
                            className="rounded-2xl bg-black px-6 py-4 font-bold text-white"
                          >
                            승인하기
                          </button>
                        ) : (
                          <button
                            onClick={() => cancelApproveMemory(post.id)}
                            className="rounded-2xl bg-orange-500 px-6 py-4 font-bold text-white"
                          >
                            승인취소
                          </button>
                        )}

                        <button
                          onClick={() => deleteMemory(post)}
                          className="rounded-2xl bg-red-600 px-6 py-4 font-bold text-white"
                        >
                          삭제하기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "notices" && (
          <section>
            <h2 className="mb-6 text-3xl font-black">공지사항 관리</h2>

            <div className="mb-8 rounded-3xl bg-white p-6 shadow md:p-8">
              <h3 className="mb-5 text-2xl font-black">
                {editingNoticeId ? "공지사항 수정" : "새 공지사항 등록"}
              </h3>

              <div className="grid gap-4">
                <input
                  className="rounded-2xl border border-gray-300 p-4"
                  placeholder="공지 제목"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                />

                <input
                  className="rounded-2xl border border-gray-300 p-4"
                  placeholder="공지 날짜 예: 2026.05.26"
                  value={noticeDate}
                  onChange={(e) => setNoticeDate(e.target.value)}
                />

                <textarea
                  className="min-h-40 rounded-2xl border border-gray-300 p-4"
                  placeholder="공지 내용"
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                />

                <label className="flex items-center gap-3 font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={noticePublished}
                    onChange={(e) => setNoticePublished(e.target.checked)}
                  />
                  공개 상태로 게시
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={saveNotice}
                    className="rounded-2xl bg-black px-6 py-4 font-bold text-white"
                  >
                    {editingNoticeId ? "공지 수정 저장" : "공지 등록"}
                  </button>

                  <button
                    onClick={resetNoticeForm}
                    className="rounded-2xl bg-gray-200 px-6 py-4 font-bold text-gray-700"
                  >
                    입력 초기화
                  </button>
                </div>
              </div>
            </div>

            {notices.length === 0 ? (
              <div className="rounded-3xl bg-white p-8 text-gray-500 shadow">
                등록된 공지사항이 없습니다.
              </div>
            ) : (
              <div className="grid gap-6">
                {notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="rounded-3xl bg-white p-6 shadow md:p-8"
                  >
                    <span
                      className={`mb-5 inline-flex rounded-full px-4 py-2 text-sm font-bold ${
                        notice.published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {notice.published ? "공개" : "비공개"}
                    </span>

                    <p className="mb-2 text-sm text-gray-500">
                      {notice.notice_date || "공지"}
                    </p>

                    <h3 className="mb-4 text-3xl font-bold">
                      {notice.title}
                    </h3>

                    <p className="mb-8 whitespace-pre-line leading-relaxed text-gray-700">
                      {notice.content}
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <button
                        onClick={() => startEditNotice(notice)}
                        className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white"
                      >
                        수정하기
                      </button>

                      <button
                        onClick={() => toggleNoticePublished(notice)}
                        className="rounded-2xl bg-orange-500 px-6 py-4 font-bold text-white"
                      >
                        {notice.published ? "비공개로 전환" : "공개로 전환"}
                      </button>

                      <button
                        onClick={() => deleteNotice(notice)}
                        className="rounded-2xl bg-red-600 px-6 py-4 font-bold text-white"
                      >
                        삭제하기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}