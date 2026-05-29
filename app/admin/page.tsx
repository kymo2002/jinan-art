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

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [currentAdminEmail, setCurrentAdminEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventTitle, setEditEventTitle] = useState("");
  const [editEventDate, setEditEventDate] = useState("");
  const [editEventLocation, setEditEventLocation] = useState("");
  const [editEventAuthor, setEditEventAuthor] = useState("");
  const [editEventDescription, setEditEventDescription] = useState("");
  const [editEventUploadType, setEditEventUploadType] = useState<
    "image" | "video"
  >("image");
  const [editEventVideoUrl, setEditEventVideoUrl] = useState("");
  const [editEventImageFile, setEditEventImageFile] = useState<File | null>(
    null
  );

  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [editMemoryTitle, setEditMemoryTitle] = useState("");
  const [editMemoryDate, setEditMemoryDate] = useState("");
  const [editMemoryLocation, setEditMemoryLocation] = useState("");
  const [editMemoryPersonName, setEditMemoryPersonName] = useState("");
  const [editMemoryDescription, setEditMemoryDescription] = useState("");
  const [editMemoryImageFile, setEditMemoryImageFile] = useState<File | null>(
    null
  );

  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDate, setNoticeDate] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticePublished, setNoticePublished] = useState(true);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const { data } = await supabase.auth.getSession();

    if (data.session?.user?.email) {
      await checkAdminAccess(data.session.user.email);
    }
  };

  const checkAdminAccess = async (email: string) => {
    const { data, error } = await supabase.rpc("is_admin");

    if (error) {
      console.log(error);
      setIsAdmin(false);
      setLoginError("관리자 권한 확인 중 오류가 발생했습니다.");
      return;
    }

    if (data === true) {
      setIsAdmin(true);
      setCurrentAdminEmail(email);
      setLoginError("");
      fetchAllData();
      return;
    }

    await supabase.auth.signOut();
    setIsAdmin(false);
    setCurrentAdminEmail("");
    setLoginError("관리자 권한이 없는 계정입니다.");
  };

  const handleLogin = async () => {
    if (!adminEmail || !adminPassword) {
      setLoginError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (error) {
      console.log(error);
      setLoginError("로그인 실패. 이메일 또는 비밀번호를 확인해주세요.");
      return;
    }

    if (data.user.email) {
      await checkAdminAccess(data.user.email);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setCurrentAdminEmail("");
    setAdminEmail("");
    setAdminPassword("");
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

  const uploadImageToStorage = async (file: File, bucket: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (uploadError) {
      console.log(uploadError);
      alert("이미지 업로드 실패");
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

    return data.publicUrl;
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

  const startEditEvent = (event: EventItem) => {
    setEditingEventId(event.id);
    setEditEventTitle(event.title || "");
    setEditEventDate(event.event_date || "");
    setEditEventLocation(event.location || "");
    setEditEventAuthor(event.author || "");
    setEditEventDescription(event.description || "");
    setEditEventUploadType(event.upload_type === "video" ? "video" : "image");
    setEditEventVideoUrl(event.video_url || "");
    setEditEventImageFile(null);
  };

  const cancelEditEvent = () => {
    setEditingEventId(null);
    setEditEventTitle("");
    setEditEventDate("");
    setEditEventLocation("");
    setEditEventAuthor("");
    setEditEventDescription("");
    setEditEventUploadType("image");
    setEditEventVideoUrl("");
    setEditEventImageFile(null);
  };

  const saveEditEvent = async (event: EventItem) => {
    if (
      !editEventTitle ||
      !editEventDate ||
      !editEventLocation ||
      !editEventDescription
    ) {
      alert("행사명, 날짜, 장소, 소개 내용을 입력해주세요.");
      return;
    }

    const updateData: Partial<EventItem> = {
      title: editEventTitle,
      event_date: editEventDate,
      location: editEventLocation,
      author: editEventAuthor,
      description: editEventDescription,
      upload_type: editEventUploadType,
      video_url: editEventUploadType === "video" ? editEventVideoUrl : "",
    };

    if (editEventUploadType === "video") {
      if (event.image_url) {
        const imageDeleted = await deleteImageFromStorage(
          event.image_url,
          "event-images"
        );

        if (!imageDeleted) {
          alert("기존 이미지 삭제 실패. 수정을 중단합니다.");
          return;
        }
      }

      updateData.image_url = "";
    }

    if (editEventUploadType === "image" && editEventImageFile) {
      const newImageUrl = await uploadImageToStorage(
        editEventImageFile,
        "event-images"
      );

      if (!newImageUrl) {
        return;
      }

      if (event.image_url) {
        await deleteImageFromStorage(event.image_url, "event-images");
      }

      updateData.image_url = newImageUrl;
    }

    const { error } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", event.id);

    if (error) {
      console.log(error);
      alert("행사 수정 실패");
      return;
    }

    alert("행사 수정 완료");
    cancelEditEvent();
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

    const { error } = await supabase.from("events").delete().eq("id", event.id);

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

  const startEditMemory = (post: MemoryPost) => {
    setEditingMemoryId(post.id);
    setEditMemoryTitle(post.title || "");
    setEditMemoryDate(post.memory_date || "");
    setEditMemoryLocation(post.location || "");
    setEditMemoryPersonName(post.person_name || "");
    setEditMemoryDescription(post.description || "");
    setEditMemoryImageFile(null);
  };

  const cancelEditMemory = () => {
    setEditingMemoryId(null);
    setEditMemoryTitle("");
    setEditMemoryDate("");
    setEditMemoryLocation("");
    setEditMemoryPersonName("");
    setEditMemoryDescription("");
    setEditMemoryImageFile(null);
  };

  const saveEditMemory = async (post: MemoryPost) => {
    if (!editMemoryTitle || !editMemoryDescription) {
      alert("제목과 설명을 입력해주세요.");
      return;
    }

    const updateData: Partial<MemoryPost> = {
      title: editMemoryTitle,
      memory_date: editMemoryDate,
      location: editMemoryLocation,
      person_name: editMemoryPersonName,
      description: editMemoryDescription,
    };

    if (editMemoryImageFile) {
      const newImageUrl = await uploadImageToStorage(
        editMemoryImageFile,
        "memory-images"
      );

      if (!newImageUrl) {
        return;
      }

      if (post.image_url) {
        await deleteImageFromStorage(post.image_url, "memory-images");
      }

      updateData.image_url = newImageUrl;
    }

    const { error } = await supabase
      .from("memory_posts")
      .update(updateData)
      .eq("id", post.id);

    if (error) {
      console.log(error);
      alert("진안의 시간 수정 실패");
      return;
    }

    alert("진안의 시간 수정 완료");
    cancelEditMemory();
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
            Supabase 관리자 계정으로 로그인해주세요.
          </p>

          <input
            type="email"
            className="mb-4 w-full rounded-2xl border border-gray-300 p-4"
            placeholder="관리자 이메일"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
          />

          <input
            type="password"
            className="mb-4 w-full rounded-2xl border border-gray-300 p-4"
            placeholder="관리자 비밀번호"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
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
            관리자 로그인
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

              <p className="mt-3 text-sm font-semibold text-gray-500">
                로그인 계정: {currentAdminEmail}
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
                    {editingEventId === event.id ? (
                      <div className="p-6 md:p-8">
                        <h3 className="mb-5 text-2xl font-black">
                          문화행사 수정
                        </h3>

                        <div className="grid gap-4">
                          <select
                            className="rounded-2xl border border-gray-300 bg-white p-4"
                            value={editEventUploadType}
                            onChange={(e) =>
                              setEditEventUploadType(
                                e.target.value as "image" | "video"
                              )
                            }
                          >
                            <option value="image">이미지 행사</option>
                            <option value="video">영상 행사</option>
                          </select>

                          <input
                            className="rounded-2xl border border-gray-300 p-4"
                            placeholder="행사명"
                            value={editEventTitle}
                            onChange={(e) => setEditEventTitle(e.target.value)}
                          />

                          <input
                            className="rounded-2xl border border-gray-300 p-4"
                            placeholder="행사 날짜"
                            value={editEventDate}
                            onChange={(e) => setEditEventDate(e.target.value)}
                          />

                          <input
                            className="rounded-2xl border border-gray-300 p-4"
                            placeholder="행사 장소"
                            value={editEventLocation}
                            onChange={(e) =>
                              setEditEventLocation(e.target.value)
                            }
                          />

                          <input
                            className="rounded-2xl border border-gray-300 p-4"
                            placeholder="작성자"
                            value={editEventAuthor}
                            onChange={(e) =>
                              setEditEventAuthor(e.target.value)
                            }
                          />

                          <textarea
                            className="min-h-40 rounded-2xl border border-gray-300 p-4"
                            placeholder="행사 소개"
                            value={editEventDescription}
                            onChange={(e) =>
                              setEditEventDescription(e.target.value)
                            }
                          />

                          {editEventUploadType === "video" ? (
                            <input
                              className="rounded-2xl border border-gray-300 p-4"
                              placeholder="유튜브 영상 주소"
                              value={editEventVideoUrl}
                              onChange={(e) =>
                                setEditEventVideoUrl(e.target.value)
                              }
                            />
                          ) : (
                            <input
                              type="file"
                              accept="image/*"
                              className="rounded-2xl border border-gray-300 bg-white p-4"
                              onChange={(e) =>
                                setEditEventImageFile(
                                  e.target.files?.[0] || null
                                )
                              }
                            />
                          )}

                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                              onClick={() => saveEditEvent(event)}
                              className="rounded-2xl bg-black px-6 py-4 font-bold text-white"
                            >
                              수정 저장
                            </button>

                            <button
                              onClick={cancelEditEvent}
                              className="rounded-2xl bg-gray-200 px-6 py-4 font-bold text-gray-700"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
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
                              onClick={() => startEditEvent(event)}
                              className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white"
                            >
                              수정하기
                            </button>

                            <button
                              onClick={() => deleteEvent(event)}
                              className="rounded-2xl bg-red-600 px-6 py-4 font-bold text-white"
                            >
                              삭제하기
                            </button>
                          </div>
                        </div>
                      </>
                    )}
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
                    {editingMemoryId === post.id ? (
                      <div className="p-6 md:p-8">
                        <h3 className="mb-5 text-2xl font-black">
                          진안의 시간 수정
                        </h3>

                        <div className="grid gap-4">
                          <input
                            className="rounded-2xl border border-gray-300 p-4"
                            placeholder="제목"
                            value={editMemoryTitle}
                            onChange={(e) =>
                              setEditMemoryTitle(e.target.value)
                            }
                          />

                          <input
                            className="rounded-2xl border border-gray-300 p-4"
                            placeholder="시기 예: 1970년대"
                            value={editMemoryDate}
                            onChange={(e) => setEditMemoryDate(e.target.value)}
                          />

                          <input
                            className="rounded-2xl border border-gray-300 p-4"
                            placeholder="장소"
                            value={editMemoryLocation}
                            onChange={(e) =>
                              setEditMemoryLocation(e.target.value)
                            }
                          />

                          <input
                            className="rounded-2xl border border-gray-300 p-4"
                            placeholder="제공자"
                            value={editMemoryPersonName}
                            onChange={(e) =>
                              setEditMemoryPersonName(e.target.value)
                            }
                          />

                          <textarea
                            className="min-h-40 rounded-2xl border border-gray-300 p-4"
                            placeholder="설명"
                            value={editMemoryDescription}
                            onChange={(e) =>
                              setEditMemoryDescription(e.target.value)
                            }
                          />

                          <input
                            type="file"
                            accept="image/*"
                            className="rounded-2xl border border-gray-300 bg-white p-4"
                            onChange={(e) =>
                              setEditMemoryImageFile(
                                e.target.files?.[0] || null
                              )
                            }
                          />

                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                              onClick={() => saveEditMemory(post)}
                              className="rounded-2xl bg-black px-6 py-4 font-bold text-white"
                            >
                              수정 저장
                            </button>

                            <button
                              onClick={cancelEditMemory}
                              className="rounded-2xl bg-gray-200 px-6 py-4 font-bold text-gray-700"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
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
                              onClick={() => startEditMemory(post)}
                              className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white"
                            >
                              수정하기
                            </button>

                            <button
                              onClick={() => deleteMemory(post)}
                              className="rounded-2xl bg-red-600 px-6 py-4 font-bold text-white"
                            >
                              삭제하기
                            </button>
                          </div>
                        </div>
                      </>
                    )}
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