export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO SECTION */}
      <section
        className="relative h-screen bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/main-hero.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
          <p className="mb-4 text-sm tracking-[0.3em] text-gray-300">
            JINAN CULTURE ART
          </p>

          <h1 className="mb-6 text-5xl md:text-7xl font-bold leading-tight">
            문화가 머무는
            <br />
            진안고원
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-gray-200 leading-relaxed">
            시간과 사람이 머무는
            <br />
            진안 문화이야기
          </p>

          <div className="mt-10 flex gap-4">
            <button className="rounded-full bg-white px-6 py-3 text-black font-semibold hover:bg-gray-200 transition">
              문화행사 보기
            </button>

            <button className="rounded-full border border-white px-6 py-3 hover:bg-white hover:text-black transition">
              행사 등록하기
            </button>
          </div>
        </div>
      </section>

      {/* TODAY CULTURE */}
      <section className="bg-white text-black py-24 px-6">
        <div className="max-w-7xl mx-auto">

          <div className="mb-16 text-center">
            <p className="text-sm tracking-[0.3em] text-gray-500 mb-3">
              TODAY CULTURE
            </p>

            <h2 className="text-4xl md:text-5xl font-bold">
              오늘의 문화
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="overflow-hidden rounded-3xl shadow-lg bg-white">
              <img
                src="/images/archive-maisan.jpg"
              />

              <div className="p-6">
                <p className="text-sm text-gray-500 mb-2">
                  2026
                </p>

                <h3 className="text-2xl font-bold mb-3">
                  문화가 있는 날
                </h3>

                <p className="text-gray-600">
                  진안고원의 밤을 수놓는 야외 공연
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl shadow-lg bg-white">
              <img
                src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop"
                className="h-72 w-full object-cover"
              />

              <div className="p-6">
                <p className="text-sm text-gray-500 mb-2">
                  2026.06.03
                </p>

                <h3 className="text-2xl font-bold mb-3">
                  진안 예술전
                </h3>

                <p className="text-gray-600">
                  지역 예술가와 시민이 함께하는 전시
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl shadow-lg bg-white">
              <img
                src="/images/festival.jpg"
              />

              <div className="p-6">
                <p className="text-sm text-gray-500 mb-2">
                  2026.06.15
                </p>

                <h3 className="text-2xl font-bold mb-3">
                  고원문화축제
                </h3>

                <p className="text-gray-600">
                  자연과 문화가 어우러지는 진안 대표 축제
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ARCHIVE SECTION */}
      <section className="bg-black text-white py-24 px-6">

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          <div>
            <p className="text-sm tracking-[0.3em] text-gray-400 mb-4">
              ARCHIVE
            </p>

            <h2 className="text-5xl font-bold leading-tight mb-8">
              시간 속의 진안
            </h2>

            <p className="text-lg text-gray-300 leading-relaxed">
              옛 마이산과 진안의 기억을 기록하고
              시민과 함께 이어가는 디지털 문화아카이브
            </p>
          </div>

          <div>
            <img
              src="/images/old-jinan.jpg"
            />
          </div>

        </div>
      </section>

    </main>
  );
}
