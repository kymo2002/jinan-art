"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

export default function MemoryPage() {
  const [posts, setPosts] = useState<MemoryPost[]>([]);
  const [searchText, setSearchText] = useState("");

  const [title, setTitle] = useState("");
  const [memoryDate, setMemoryDate] = useState("");
  const [location, setLocation] = useState("");
  const [personName, setPersonName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState("");

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("memory_posts")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setPosts(data || []);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) {
      return true;
    }

    return (
      post.title.toLowerCase().includes(keyword) ||
      (post.memory_date || "").toLowerCase().includes(keyword) ||
      (post.location || "").toLowerCase().includes(keyword) ||
      (post.person_name || "").toLowerCase().includes(keyword) ||
      post.description.toLowerCase().includes(keyword)
    );
  });

  const openImageModal = (imageUrl: string, imageTitle: string) => {
    setSelectedImageUrl(imageUrl);
    setSelectedImageTitle(imageTitle);
  };

  const closeImageModal = () => {
    setSelectedImageUrl(null);
    setSelectedImageTitle("");
  };

  const handleImageChange = (file: File | null) => {
    if (!file) {
      setImageFile(null);
      return;
    }

    setImageFile(file);
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      alert("제목과 설명은 반드시 입력해주세요.");
      return;
    }

    let imageUrl = "";

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("memory-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        console.log(uploadError);
        alert("이미지 업로드 실패");
        return;
      }

      const { data } = supabase.storage
        .from("memory-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("memory_posts").insert([
      {
        title,
        memory_date: memoryDate,
        location,
        person_name: personName,
        description,
        image_url: imageUrl,
        approved: false,
      },
    ]);

    if (error) {
      console.log(error);
      alert("저장 실패");
      return;
    }

    alert("사진 기록 등록 완료. 관리자 승인 후 게시됩니다.");

    setTitle("");
    setMemoryDate("");
    setLocation("");
    setPersonName("");
    setDescription("");
    setImageFile(null);

    const fileInput = document.getElementById(
      "memory-image-input"
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 text-black">
      {/* HERO */}
      <section className="relative flex min-h-[620px] items-center justify-center overflow-hidden bg-white px-6 text-white">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center opacity-60 blur-md"
          style={{ backgroundImage: "url('/images/old-jinan.jpg')" }}
        />

        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/old-jinan.jpg')" }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/35" />

        <div className="relative z-10 max-w-4xl text-center drop-shadow-[0_3px_8px_rgba(0,0,0,0.45)]">
          <p className="mb-5 text-xs tracking-[0.45em] text-white/90">
            JINAN MEMORY ARCHIVE
          </p>

          <h1 className="mb-8 text-5xl font-black leading-tight md:text-8xl">
            진안의 시간
          </h1>

          <p className="text-lg leading-relaxed text-white md:text-2xl">
            오래된 풍경과 사람의 기억을 모아
            <br />
            진안의 문화 이야기를 기록합니다
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="rounded-full bg-white px-6 py-3 font-bold text-black shadow-lg transition hover:bg-gray-100"
            >
              메인으로 돌아가기
            </Link>

            <a
              href="#memory-upload"
              className="rounded-full border border-white bg-white/20 px-6 py-3 font-bold text-white shadow-lg backdrop-blur-sm transition hover:bg-white/30"
            >
              사진 기록 올리기
            </a>
          </div>
        </div>
      </section>

      <section className="px-3 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-7xl rounded-3xl bg-white p-4 shadow-xl md:p-10">
          <div className="mb-14 text-center">
            <p className="mb-4 text-xs tracking-[0.4em] text-gray-500">
              MEMORY OF JINAN
            </p>

            <h2 className="mb-6 text-3xl font-black leading-tight md:text-6xl">
              사진 한 장이
              <br />
              진안의 이야기가 됩니다
            </h2>

            <p className="text-base leading-relaxed text-gray-600 md:text-lg">
              옛 마을 풍경, 오래된 행사, 사람들의 삶과 기억을 함께 모아
              <br className="hidden md:block" />
              다음 세대에 남기는 진안문화아트의 기록 공간입니다.
            </p>
          </div>

          {/* 안내 카드 */}
          <div className="mb-16 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl bg-gray-50 p-6 shadow">
              <p className="mb-3 text-xs tracking-[0.3em] text-gray-400">
                OLD PHOTO
              </p>

              <h3 className="mb-4 text-2xl font-black">옛사진</h3>

              <p className="leading-relaxed text-gray-600">
                오래된 가족사진, 마을사진, 학교사진, 행사사진을 진안의
                문화기록으로 남깁니다.
              </p>
            </div>

            <div className="rounded-3xl bg-gray-50 p-6 shadow">
              <p className="mb-3 text-xs tracking-[0.3em] text-gray-400">
                VILLAGE MEMORY
              </p>

              <h3 className="mb-4 text-2xl font-black">마을의 기억</h3>

              <p className="leading-relaxed text-gray-600">
                마을길, 장터, 축제, 공동체 활동처럼 시간이 쌓인 진안의
                생활문화를 기록합니다.
              </p>
            </div>

            <div className="rounded-3xl bg-gray-50 p-6 shadow">
              <p className="mb-3 text-xs tracking-[0.3em] text-gray-400">
                CULTURE STORY
              </p>

              <h3 className="mb-4 text-2xl font-black">문화이야기</h3>

              <p className="leading-relaxed text-gray-600">
                사진과 함께 그 시절의 이야기, 장소, 사람, 기억을 함께
                남깁니다.
              </p>
            </div>
          </div>

          {/* 승인된 기록 목록 */}
          <div className="mb-16">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-3 text-xs tracking-[0.35em] text-gray-500">
                  MEMORY ARCHIVE
                </p>

                <h2 className="text-3xl font-black md:text-4xl">
                  등록된 사진 기록
                </h2>
              </div>

              <p className="text-sm text-gray-500">
                이미지를 누르면 크게 볼 수 있습니다.
              </p>
            </div>

            <div className="mb-8 rounded-3xl bg-gray-50 p-5 md:p-6">
              <label className="mb-3 block font-bold text-gray-700">
                사진 기록 검색
              </label>

              <input
                className="w-full rounded-2xl border border-gray-300 bg-white p-4"
                placeholder="제목, 장소, 시기, 제공자, 설명으로 검색하세요"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />

              <div className="mt-3 flex flex-col gap-2 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
                <p>
                  전체 {posts.length}개 중 {filteredPosts.length}개 기록이
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

            {posts.length === 0 ? (
              <div className="rounded-3xl bg-gray-50 p-8 text-gray-500">
                아직 승인된 사진 기록이 없습니다.
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="rounded-3xl bg-gray-50 p-8 text-gray-500">
                검색 결과가 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 md:gap-6">
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md"
                  >
                    {post.image_url && (
                      <div className="bg-gray-100 p-2">
                        <button
                          type="button"
                          onClick={() =>
                            openImageModal(post.image_url || "", post.title)
                          }
                          className="group flex w-full cursor-zoom-in items-center justify-center"
                        >
                          <img
                            src={post.image_url}
                            alt={post.title}
                            className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.01] md:h-64 lg:h-72"
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openImageModal(post.image_url || "", post.title)
                          }
                          className="mt-2 w-full rounded-xl bg-black px-3 py-2.5 text-sm font-bold text-white transition hover:bg-gray-800"
                        >
                          크게 보기
                        </button>
                      </div>
                    )}

                    <div className="p-3 md:p-4">
                      <p className="mb-2 text-xs text-gray-500 md:text-sm">
                        {post.memory_date || "시기 미상"}
                      </p>

                      <h3 className="mb-3 line-clamp-2 text-base font-black leading-tight md:text-lg">
                        {post.title}
                      </h3>

                      {post.location && (
                        <p className="mb-2 line-clamp-1 text-sm font-semibold text-gray-600 md:text-base">
                          장소: {post.location}
                        </p>
                      )}

                      {post.person_name && (
                        <p className="mb-3 line-clamp-1 text-xs text-gray-500 md:text-sm">
                          제공: {post.person_name}
                        </p>
                      )}

                      <p className="hidden whitespace-pre-line text-sm leading-relaxed text-gray-700 lg:line-clamp-4 lg:block">
                        {post.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* 등록 폼 */}
          <div
            id="memory-upload"
            className="scroll-mt-10 rounded-3xl bg-gray-100 p-5 md:p-10"
          >
            <p className="mb-3 text-xs tracking-[0.35em] text-gray-500">
              MEMORY PARTICIPATION
            </p>

            <h2 className="mb-4 text-3xl font-black md:text-4xl">
              사진 기록 올리기
            </h2>

            <p className="mb-8 text-gray-600">
              진안의 옛사진, 마을 풍경, 오래된 행사 사진과 이야기를 올릴 수
              있습니다. 등록된 내용은 관리자 승인 후 게시됩니다.
            </p>

            <div className="grid gap-4">
              <input
                className="rounded-2xl border border-gray-300 p-4"
                placeholder="제목 예: 1980년대 진안 장날 풍경"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                className="rounded-2xl border border-gray-300 p-4"
                placeholder="시기 예: 1980년대, 1995년 봄, 시기 미상"
                value={memoryDate}
                onChange={(e) => setMemoryDate(e.target.value)}
              />

              <input
                className="rounded-2xl border border-gray-300 p-4"
                placeholder="장소 예: 진안읍, 마령면, 백운면"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              <input
                className="rounded-2xl border border-gray-300 p-4"
                placeholder="제공자 이름 또는 단체명"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
              />

              <textarea
                className="min-h-40 rounded-2xl border border-gray-300 p-4"
                placeholder="사진에 담긴 이야기, 기억나는 사람, 장소, 당시 상황을 적어주세요."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="rounded-2xl border border-gray-300 bg-white p-4">
                <label className="mb-2 block font-bold text-gray-700">
                  사진 이미지
                </label>

                <p className="mb-3 text-sm leading-relaxed text-gray-500">
                  옛사진은 가로·세로 비율과 관계없이 전체가 보이도록
                  표시됩니다. 큰 이미지는 업로드 시간이 오래 걸릴 수 있습니다.
                </p>

                <input
                  id="memory-image-input"
                  type="file"
                  accept="image/*"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3"
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

              <button
                onClick={handleSubmit}
                className="rounded-2xl bg-black py-4 text-lg font-bold text-white transition hover:bg-gray-800"
              >
                관리자 승인 요청하기
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white px-4 py-10 text-center">
        <p className="mb-2 text-lg font-black">진안문화아트</p>

        <p className="mb-6 text-sm text-gray-500">
          진안의 오래된 시간과 문화 이야기를 기록합니다.
        </p>

        <div className="flex flex-col items-center gap-3 text-xs font-semibold text-gray-400 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="underline-offset-4 transition hover:text-gray-700 hover:underline"
          >
            메인으로 돌아가기
          </Link>

          <Link
            href="/admin"
            className="underline-offset-4 transition hover:text-gray-700 hover:underline"
          >
            관리자
          </Link>
        </div>
      </footer>

      {/* 이미지 크게 보기 모달 */}
      {selectedImageUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={closeImageModal}
        >
          <div
            className="relative max-h-[95vh] w-full max-w-7xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-4 md:p-6">
              <h2 className="text-lg font-black md:text-2xl">
                {selectedImageTitle}
              </h2>

              <button
                type="button"
                onClick={closeImageModal}
                className="rounded-full bg-gray-100 px-4 py-2 font-bold text-gray-700 transition hover:bg-gray-200"
              >
                닫기
              </button>
            </div>

            <div className="max-h-[82vh] overflow-auto bg-gray-100 p-4">
              <img
                src={selectedImageUrl}
                alt={selectedImageTitle}
                className="mx-auto h-auto max-h-none w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}