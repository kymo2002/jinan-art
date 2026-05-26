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

type EventEditForm = {
  title: string;
  event_date: string;
  location: string;
  description: string;
};

type MemoryEditForm = {
  title: string;
  memory_date: string;
  location: string;
  person_name: string;
  description: string;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"events" | "memory">("events");

  const [events, setEvents] = useState<EventItem[]>([]);
  const [memoryPosts, setMemoryPosts] = useState<MemoryPost[]>([]);
  const [loading, setLoading] = useState(false);

  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventEditForm, setEventEditForm] = useState<EventEditForm>({
    title: "",
    event_date: "",
    location: "",
    description: "",
  });

  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [memoryEditForm, setMemoryEditForm] = useState<MemoryEditForm>({
    title: "",
    memory_date: "",
    location: "",
    person_name: "",
    description: "",
  });

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
      setLoginError(".env.local에 관리자 비밀번호가 설정되지 않았습니다.");
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
    setEvents([]);
    setMemoryPosts([]);
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchEvents(), fetchMemoryPosts()]);
    setLoading(false);
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
      alert("진안의 시간 목록을 불러오지 못했습니다.");
      return;
    }

    setMemoryPosts(data || []);
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
    const confirmApprove = window.confirm("이 행사를 승인하시겠습니까?");

    if (!confirmApprove) {
      return;
    }

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
    const confirmCancel = window.confirm(
      "이 행사의 승인을 취소하시겠습니까?\n승인 취소 후에는 메인페이지에서 보이지 않습니다."
    );

    if (!confirmCancel) {
      return;
    }

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

  const startEditEvent = (event: EventItem) => {
    setEditingEventId(event.id);
    setEventEditForm({
      title: event.title,
      event_date: event.event_date,
      location: event.location,
      description: event.description,
    });
  };

  const cancelEditEvent = () => {
    setEditingEventId(null);
    setEventEditForm({
      title: "",
      event_date: "",
      location: "",
      description: "",
    });
  };

  const saveEditEvent = async (id: string) => {
    if (
      !eventEditForm.title ||
      !eventEditForm.event_date ||
      !eventEditForm.location ||
      !eventEditForm.description
    ) {
      alert("수정할 내용을 모두 입력해주세요.");
      return;
    }

    const confirmSave = window.confirm("수정한 내용을 저장하시겠습니까?");

    if (!confirmSave) {
      return;
    }

    const { error } = await supabase
      .from("events")
      .update({
        title: eventEditForm.title,
        event_date: eventEditForm.event_date,
        location: eventEditForm.location,
        description: eventEditForm.description,
      })
      .eq("id", id);

    if (error) {
      console.log(error);
      alert("수정 실패");
      return;
    }

    alert("수정 완료");
    cancelEditEvent();
    fetchEvents();
  };

  const deleteEvent = async (event: EventItem) => {
    const confirmDelete = window.confirm(
      `"${event.title}" 행사를 삭제하시겠습니까?\n행사 내용과 업로드된 이미지가 함께 삭제됩니다.\n삭제한 내용은 복구할 수 없습니다.`
    );

    if (!confirmDelete) {
      return;
    }

    const imageDeleted = await deleteImageFromStorage(
      event.image_url,
      "event-images"
    );

    if (!imageDeleted) {
      alert(
        "이미지 삭제에 실패했습니다.\n행사 글 삭제를 중단합니다.\nSupabase Storage 권한을 확인해주세요."
      );
      return;
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

    alert("행사와 이미지가 함께 삭제되었습니다.");
    fetchEvents();
  };

  const approveMemory = async (id: string) => {
    const confirmApprove = window.confirm(
      "이 사진 기록을 승인하시겠습니까?"
    );

    if (!confirmApprove) {
      return;
    }

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
    const confirmCancel = window.confirm(
      "이 사진 기록의 승인을 취소하시겠습니까?\n승인 취소 후에는 진안의 시간 페이지에서 보이지 않습니다."
    );

    if (!confirmCancel) {
      return;
    }

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

  const startEditMemory = (post: MemoryPost) => {
    setEditingMemoryId(post.id);
    setMemoryEditForm({
      title: post.title,
      memory_date: post.memory_date || "",
      location: post.location || "",
      person_name: post.person_name || "",
      description: post.description,
    });
  };

  const cancelEditMemory = () => {
    setEditingMemoryId(null);
    setMemoryEditForm({
      title: "",
      memory_date: "",
      location: "",
      person_name: "",
      description: "",
    });
  };

  const saveEditMemory = async (id: string) => {
    if (!memoryEditForm.title || !memoryEditForm.description) {
      alert("제목과 설명은 반드시 입력해주세요.");
      return;
    }

    const confirmSave = window.confirm("수정한 내용을 저장하시겠습니까?");

    if (!confirmSave) {
      return;
    }

    const { error } = await supabase
      .from("memory_posts")
      .update({
        title: memoryEditForm.title,
        memory_date: memoryEditForm.memory_date,
        location: memoryEditForm.location,
        person_name: memoryEditForm.person_name,
        description: memoryEditForm.description,
      })
      .eq("id", id);

    if (error) {
      console.log(error);
      alert("수정 실패");
      return;
    }

    alert("수정 완료");
    cancelEditMemory();
    fetchMemoryPosts();
  };

  const deleteMemory = async (post: MemoryPost) => {
    const confirmDelete = window.confirm(
      `"${post.title}" 사진 기록을 삭제하시겠습니까?\n사진 기록과 업로드된 이미지가 함께 삭제됩니다.\n삭제한 내용은 복구할 수 없습니다.`
    );

    if (!confirmDelete) {
      return;
    }

    const imageDeleted = await deleteImageFromStorage(
      post.image_url,
      "memory-images"
    );

    if (!imageDeleted) {
      alert(
        "이미지 삭제에 실패했습니다.\n사진 기록 삭제를 중단합니다.\nSupabase Storage 권한을 확인해주세요."
      );
      return;
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

    alert("사진 기록과 이미지가 함께 삭제되었습니다.");
    fetchMemoryPosts();
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
            행사와 진안의 시간 기록을 관리하려면 관리자 비밀번호를
            입력해주세요.
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
  const approvedEvents = events.filter((event) => event.approved);
  const waitingMemory = memoryPosts.filter((post) => !post.approved);
  const approvedMemory = memoryPosts.filter((post) => post.approved);

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 text-black md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 rounded-3xl bg-white p-6 shadow-lg md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="mb-3 text-xs tracking-[0.35em] text-gray-500">
                JINAN CULTURE ART ADMIN
              </p>

              <h1 className="mb-4 text-4xl font-black md:text-5xl">
                관리자 페이지
              </h1>

              <p className="leading-relaxed text-gray-600">
                문화행사와 진안의 시간 사진 기록을 승인, 수정, 삭제할 수
                있습니다.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-2xl border border-gray-300 px-5 py-3 font-bold text-gray-700 transition hover:bg-gray-100"
            >
              관리자 로그아웃
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
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
            <p className="mb-2 text-sm text-gray-500">전체 사진 기록</p>
            <p className="text-4xl font-black">{memoryPosts.length}</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow">
            <p className="mb-2 text-sm text-gray-500">사진 승인 대기</p>
            <p className="text-4xl font-black text-orange-600">
              {waitingMemory.length}
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
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-8 text-gray-500 shadow">
            불러오는 중입니다...
          </div>
        ) : activeTab === "events" ? (
          <section>
            <div className="mb-6">
              <h2 className="text-3xl font-black">문화행사 관리</h2>
              <p className="mt-2 text-gray-500">
                승인 완료 {approvedEvents.length}개 · 승인 대기{" "}
                {waitingEvents.length}개
              </p>
            </div>

            {events.length === 0 ? (
              <div className="rounded-3xl bg-white p-8 text-gray-500 shadow">
                등록된 행사가 없습니다.
              </div>
            ) : (
              <div className="grid gap-6">
                {events.map((event) => {
                  const isEditing = editingEventId === event.id;

                  return (
                    <div
                      key={event.id}
                      className="overflow-hidden rounded-3xl bg-white shadow-lg"
                    >
                      {event.image_url && (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="max-h-[680px] w-full bg-gray-100 object-contain"
                        />
                      )}

                      <div className="p-6 md:p-8">
                        <div className="mb-5">
                          <span
                            className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-bold ${
                              event.approved
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {event.approved ? "승인 완료" : "승인 대기"}
                          </span>
                        </div>

                        {isEditing ? (
                          <div className="grid gap-4">
                            <input
                              className="rounded-2xl border border-gray-300 p-4"
                              placeholder="행사명"
                              value={eventEditForm.title}
                              onChange={(e) =>
                                setEventEditForm({
                                  ...eventEditForm,
                                  title: e.target.value,
                                })
                              }
                            />

                            <input
                              className="rounded-2xl border border-gray-300 p-4"
                              placeholder="행사 날짜"
                              value={eventEditForm.event_date}
                              onChange={(e) =>
                                setEventEditForm({
                                  ...eventEditForm,
                                  event_date: e.target.value,
                                })
                              }
                            />

                            <input
                              className="rounded-2xl border border-gray-300 p-4"
                              placeholder="행사 장소"
                              value={eventEditForm.location}
                              onChange={(e) =>
                                setEventEditForm({
                                  ...eventEditForm,
                                  location: e.target.value,
                                })
                              }
                            />

                            <textarea
                              className="min-h-40 rounded-2xl border border-gray-300 p-4"
                              placeholder="행사 소개"
                              value={eventEditForm.description}
                              onChange={(e) =>
                                setEventEditForm({
                                  ...eventEditForm,
                                  description: e.target.value,
                                })
                              }
                            />

                            <div className="flex flex-col gap-3 sm:flex-row">
                              <button
                                onClick={() => saveEditEvent(event.id)}
                                className="rounded-2xl bg-black px-6 py-4 font-bold text-white transition hover:bg-gray-800"
                              >
                                수정 저장
                              </button>

                              <button
                                onClick={cancelEditEvent}
                                className="rounded-2xl border border-gray-300 px-6 py-4 font-bold text-gray-700 transition hover:bg-gray-100"
                              >
                                수정 취소
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="mb-2 text-sm text-gray-500">
                              {event.event_date}
                            </p>

                            <h3 className="mb-4 text-3xl font-bold">
                              {event.title}
                            </h3>

                            <p className="mb-4 font-semibold text-gray-600">
                              {event.location}
                            </p>

                            <p className="mb-8 whitespace-pre-line leading-relaxed text-gray-700">
                              {event.description}
                            </p>

                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                              {!event.approved ? (
                                <button
                                  onClick={() => approveEvent(event.id)}
                                  className="rounded-2xl bg-black px-6 py-4 font-bold text-white transition hover:bg-gray-800"
                                >
                                  승인하기
                                </button>
                              ) : (
                                <button
                                  onClick={() => cancelApproveEvent(event.id)}
                                  className="rounded-2xl bg-orange-500 px-6 py-4 font-bold text-white transition hover:bg-orange-600"
                                >
                                  승인취소
                                </button>
                              )}

                              <button
                                onClick={() => startEditEvent(event)}
                                className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700"
                              >
                                수정하기
                              </button>

                              <button
                                onClick={() => deleteEvent(event)}
                                className="rounded-2xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700"
                              >
                                삭제하기
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <section>
            <div className="mb-6">
              <h2 className="text-3xl font-black">진안의 시간 관리</h2>
              <p className="mt-2 text-gray-500">
                승인 완료 {approvedMemory.length}개 · 승인 대기{" "}
                {waitingMemory.length}개
              </p>
            </div>

            {memoryPosts.length === 0 ? (
              <div className="rounded-3xl bg-white p-8 text-gray-500 shadow">
                등록된 사진 기록이 없습니다.
              </div>
            ) : (
              <div className="grid gap-6">
                {memoryPosts.map((post) => {
                  const isEditing = editingMemoryId === post.id;

                  return (
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
                        <div className="mb-5">
                          <span
                            className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-bold ${
                              post.approved
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {post.approved ? "승인 완료" : "승인 대기"}
                          </span>
                        </div>

                        {isEditing ? (
                          <div className="grid gap-4">
                            <input
                              className="rounded-2xl border border-gray-300 p-4"
                              placeholder="제목"
                              value={memoryEditForm.title}
                              onChange={(e) =>
                                setMemoryEditForm({
                                  ...memoryEditForm,
                                  title: e.target.value,
                                })
                              }
                            />

                            <input
                              className="rounded-2xl border border-gray-300 p-4"
                              placeholder="시기"
                              value={memoryEditForm.memory_date}
                              onChange={(e) =>
                                setMemoryEditForm({
                                  ...memoryEditForm,
                                  memory_date: e.target.value,
                                })
                              }
                            />

                            <input
                              className="rounded-2xl border border-gray-300 p-4"
                              placeholder="장소"
                              value={memoryEditForm.location}
                              onChange={(e) =>
                                setMemoryEditForm({
                                  ...memoryEditForm,
                                  location: e.target.value,
                                })
                              }
                            />

                            <input
                              className="rounded-2xl border border-gray-300 p-4"
                              placeholder="제공자"
                              value={memoryEditForm.person_name}
                              onChange={(e) =>
                                setMemoryEditForm({
                                  ...memoryEditForm,
                                  person_name: e.target.value,
                                })
                              }
                            />

                            <textarea
                              className="min-h-40 rounded-2xl border border-gray-300 p-4"
                              placeholder="설명"
                              value={memoryEditForm.description}
                              onChange={(e) =>
                                setMemoryEditForm({
                                  ...memoryEditForm,
                                  description: e.target.value,
                                })
                              }
                            />

                            <div className="flex flex-col gap-3 sm:flex-row">
                              <button
                                onClick={() => saveEditMemory(post.id)}
                                className="rounded-2xl bg-black px-6 py-4 font-bold text-white transition hover:bg-gray-800"
                              >
                                수정 저장
                              </button>

                              <button
                                onClick={cancelEditMemory}
                                className="rounded-2xl border border-gray-300 px-6 py-4 font-bold text-gray-700 transition hover:bg-gray-100"
                              >
                                수정 취소
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
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
                                  className="rounded-2xl bg-black px-6 py-4 font-bold text-white transition hover:bg-gray-800"
                                >
                                  승인하기
                                </button>
                              ) : (
                                <button
                                  onClick={() => cancelApproveMemory(post.id)}
                                  className="rounded-2xl bg-orange-500 px-6 py-4 font-bold text-white transition hover:bg-orange-600"
                                >
                                  승인취소
                                </button>
                              )}

                              <button
                                onClick={() => startEditMemory(post)}
                                className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700"
                              >
                                수정하기
                              </button>

                              <button
                                onClick={() => deleteMemory(post)}
                                className="rounded-2xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700"
                              >
                                삭제하기
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}