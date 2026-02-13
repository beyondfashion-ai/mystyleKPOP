import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col pb-24 bg-white font-display text-black">
            <Header />

            <main className="max-w-md mx-auto w-full pt-14">
                <section className="px-6 py-16 text-center bg-white relative">
                    <div className="relative z-10">
                        <div className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-[10px] font-black mb-6 tracking-widest uppercase">
                            ● Season 4 Active
                        </div>
                        <h1 className="text-4xl font-black tracking-tight mb-4 leading-tight font-display text-black">
                            당신의 <span className="text-primary">팬심</span>이<br />현실이 되는 곳
                        </h1>
                        <p className="text-sm text-gray-600 mb-10 max-w-[280px] mx-auto leading-relaxed">
                            내 최애를 위한 무대 의상을 디자인해보세요.<br />이번 달 투표 1위 디자인은 실제로 제작됩니다!
                        </p>
                        <Link href="/studio" className="w-full bg-black text-white py-4 px-6 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-transform active:scale-95">
                            <span className="material-symbols-outlined text-lg">edit</span>
                            지금 바로 디자인하기
                        </Link>
                    </div>
                </section>

                <section className="py-12 bg-white border-y border-gray-50">
                    <div className="px-6 flex justify-between items-end mb-6">
                        <h2 className="text-xl font-black font-display flex items-center gap-2 uppercase">
                            BEST PICKS
                        </h2>
                        <Link href="/gallery" className="text-xs text-gray-400 font-bold border-b border-gray-200">View All</Link>
                    </div>
                    <div className="px-6">
                        <div className="relative w-full aspect-[4/3] bg-white rounded-xl overflow-hidden mb-6 border border-gray-100 shadow-sm">
                            {/* Placeholder Image */}
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                <span className="material-symbols-outlined text-4xl">image</span>
                            </div>
                            <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 text-[11px] font-black rounded-full">1st</div>
                            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent text-white">
                                <h3 className="font-bold text-lg">네온 사이버펑크 스테이지</h3>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-300 font-medium">By @KpopFan99</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-sm text-white fill-current">favorite</span>
                                        <span className="text-xs font-bold">2.4k</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                            <div className="min-w-[160px] flex-shrink-0">
                                <div className="relative aspect-square bg-white rounded-lg overflow-hidden border border-gray-100 mb-2">
                                    <div className="w-full h-full bg-gray-200"></div>
                                    <div className="absolute top-2 left-2 bg-gray-100 text-black px-2 py-0.5 text-[10px] font-bold rounded-full">2nd</div>
                                </div>
                                <p className="text-xs font-bold truncate">로열 가드 컨셉</p>
                                <p className="text-[10px] text-gray-500">SEVENTEEN</p>
                            </div>
                            <div className="min-w-[160px] flex-shrink-0">
                                <div className="relative aspect-square bg-white rounded-lg overflow-hidden border border-gray-100 mb-2">
                                    <div className="w-full h-full bg-gray-200"></div>
                                    <div className="absolute top-2 left-2 bg-gray-100 text-black px-2 py-0.5 text-[10px] font-bold rounded-full">3rd</div>
                                </div>
                                <p className="text-xs font-bold truncate">청량 패션</p>
                                <p className="text-[10px] text-gray-500">NEWJEANS</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 px-6 bg-white">
                    <h2 className="text-xl font-black mb-14 text-center font-display uppercase tracking-wider">어떻게 진행되나요?</h2>
                    <div className="max-w-[320px] mx-auto flex flex-col items-center">
                        {/* Step 1 */}
                        <div className="w-full bg-gray-50 rounded-2xl p-5 flex items-center gap-4 border border-gray-100">
                            <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[24px]">edit_note</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-[13px] text-black leading-tight font-korean">프롬프트 입력</h3>
                                <p className="text-[11px] text-gray-400 leading-relaxed mt-1">원하는 스타일을 자유롭게 설명해주세요.</p>
                            </div>
                        </div>
                        {/* Arrow */}
                        <div className="py-2 text-gray-300">
                            <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
                        </div>
                        {/* Step 2 */}
                        <div className="w-full bg-gray-50 rounded-2xl p-5 flex items-center gap-4 border border-gray-100">
                            <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-[13px] text-black leading-tight font-korean">AI 의상 생성</h3>
                                <p className="text-[11px] text-gray-400 leading-relaxed mt-1">패션 전문 AI가 10초만에 의상을 제안합니다.</p>
                            </div>
                        </div>
                        {/* Arrow */}
                        <div className="py-2 text-gray-300">
                            <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
                        </div>
                        {/* Step 3 */}
                        <div className="w-full bg-gray-50 rounded-2xl p-5 flex items-center gap-4 border border-gray-100">
                            <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[24px]">how_to_vote</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-[13px] text-black leading-tight font-korean">커뮤니티 투표</h3>
                                <p className="text-[11px] text-gray-400 leading-relaxed mt-1">최고의 룩을 공유하고 팬 투표로 랭킹이 결정됩니다.</p>
                            </div>
                        </div>
                        {/* Arrow */}
                        <div className="py-2 text-vibrant-cyan">
                            <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
                        </div>
                        {/* Step 4 - Highlighted */}
                        <div className="w-full bg-gradient-to-br from-vibrant-cyan/10 to-vibrant-cyan/5 rounded-2xl p-5 flex items-center gap-4 border border-vibrant-cyan/20">
                            <div className="w-12 h-12 rounded-xl bg-vibrant-cyan text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(0,229,255,0.3)]">
                                <span className="material-symbols-outlined text-[24px]">emoji_events</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-[13px] text-vibrant-cyan leading-tight font-korean">실제 의상 제작</h3>
                                <p className="text-[11px] text-gray-400 leading-relaxed mt-1">1위 디자인은 실제로 제작되어 전달됩니다.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-12 px-6 bg-white">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-black font-display uppercase italic">Trending Styles</h2>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-900"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-100"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                            <div className="w-full h-full bg-gray-200"></div>
                        </div>
                        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                            <div className="w-full h-full bg-gray-200"></div>
                        </div>
                    </div>
                </section>

                <footer className="py-12 px-6 border-t border-gray-100 text-center bg-white mb-10">
                    <p className="text-xs text-black mb-6 font-display font-black uppercase tracking-[0.3em] italic">MY-STYLE.AI</p>
                    <div className="flex justify-center gap-6 mb-8">
                        <Link href="#" className="text-[10px] text-gray-400 font-bold uppercase hover:text-black">About</Link>
                        <Link href="/gallery" className="text-[10px] text-gray-400 font-bold uppercase hover:text-black">Gallery</Link>
                        <Link href="#" className="text-[10px] text-gray-400 font-bold uppercase hover:text-black">Social</Link>
                    </div>
                    <p className="text-[9px] text-gray-300 font-medium">© 2024 MY-STYLE.AI. All rights reserved.</p>
                </footer>
            </main>

            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe-bottom hidden">
                {/* This is intentionally hidden to be replaced by the global BottomNav if we decide to use it globally, 
              but for now I will replace it with the import */}
            </nav>
            <BottomNav />
        </div>
    );
}
