export interface AgentPersona {
    name: string;
    groupTag: string; // Bias group
    idolType: string;
    conceptStyle: string;
    prompt: string;
    comment: string | null; // Community post content (optional)
    voteTarget: string; // Strategy for voting (e.g., 'random', 'same-group')
}

export const AGENT_PERSONAS: AgentPersona[] = [
    {
        name: "Minji_Lover",
        groupTag: "NewJeans",
        idolType: "girlgroup",
        conceptStyle: "highteen",
        prompt: "NewJeans style, school uniform, oversized blazer, plaid skirt, headphones, blue and white tone",
        comment: "오늘 뉴진스 컨셉 너무 예쁘지 않나요? 하이틴 룩 최고!",
        voteTarget: "random"
    },
    {
        name: "ArmyForever",
        groupTag: "BTS",
        idolType: "boygroup",
        conceptStyle: "suit",
        prompt: "BTS stage outfit, black suit with silver chains, intense lighting, charismatic performance",
        comment: "방탄 무대 의상 직접 만들어봤는데 어떤가요? 피드백 부탁드려요!",
        voteTarget: "same-group"
    },
    {
        name: "Blink_Jennie",
        groupTag: "BLACKPINK",
        idolType: "girlgroup",
        conceptStyle: "girlcrush",
        prompt: "Blackpink Jennie style, red corset top, black leather pants, luxury accessories, fierce mood",
        comment: null,
        voteTarget: "random"
    },
    {
        name: "Carat_17",
        groupTag: "SEVENTEEN",
        idolType: "boygroup",
        conceptStyle: "street",
        prompt: "Seventeen fresh vibe, sporty streetwear, colorful hoodie, denim baggy pants, energetic",
        comment: "세븐틴 이번 컴백 컨셉이랑 비슷하게 해봤어요 ㅎㅎ",
        voteTarget: "random"
    },
    {
        name: "Dive_Into_IVE",
        groupTag: "IVE",
        idolType: "girlgroup",
        conceptStyle: "highteen",
        prompt: "IVE Wonyoung style, princess look, pink dress, tiara, sparkly makeup, elegant",
        comment: "아이브 공주님들 스타일로 꾸며봤습니다 ✨",
        voteTarget: "random"
    },
    {
        name: "StayWithSkz",
        groupTag: "Stray Kids",
        idolType: "boygroup",
        conceptStyle: "cyber",
        prompt: "Stray Kids maniac concept, tearing fabric, dark techwear, green neon lights, aggressive",
        comment: "스키즈 마라맛 컨셉! 미래지향적인 느낌으로~",
        voteTarget: "random"
    },
    {
        name: "Midzy_Yeji",
        groupTag: "ITZY",
        idolType: "girlgroup",
        conceptStyle: "street",
        prompt: "ITZY sporty look, crop top, cargo pants, sneakers, high ponytail, dance break outfit",
        comment: null,
        voteTarget: "random"
    },
    {
        name: "NCTzen_Green",
        groupTag: "NCT",
        idolType: "boygroup",
        conceptStyle: "cyber",
        prompt: "NCT Neo culture technology, neon green highlights, futuristic armor elements, baggy pants, glitch effect",
        comment: "네오하다 네오해... NCT 코디분들 존경합니다",
        voteTarget: "random"
    },
    {
        name: "Neverland_Idle",
        groupTag: "(G)I-DLE",
        idolType: "girlgroup",
        conceptStyle: "girlcrush",
        prompt: "G-Idle tomboy concept, red leather jacket, smoky makeup, bold accessories, queen vibe",
        comment: "퀸카 그 자체...",
        voteTarget: "random"
    },
    {
        name: "Moa_Txt",
        groupTag: "TXT",
        idolType: "boygroup",
        conceptStyle: "y2k",
        prompt: "TXT loser lover concept, emo punk rock, ripped jeans, converse, band aid on nose",
        comment: "투바투 감성 너무 좋아요 ㅠㅠ Y2K 락스타 느낌!",
        voteTarget: "random"
    },
    {
        name: "Aespa_Winter",
        groupTag: "aespa",
        idolType: "girlgroup",
        conceptStyle: "cyber",
        prompt: "aespa kwangya style, metallic silver outfit, snake skin texture, futuristic warrior, purple lasers",
        comment: "광야로 걸어가... 에스파 컨셉은 역시 어렵네요 ㅋㅋ",
        voteTarget: "random"
    },
    {
        name: "ReVeluv_Joy",
        groupTag: "Red Velvet",
        idolType: "girlgroup",
        conceptStyle: "sexy",
        prompt: "Red Velvet psycho concept, elegant gothic dress, lace gloves, dark mystery atmosphere",
        comment: null,
        voteTarget: "random"
    },
    {
        name: "Fearless_Sakura",
        groupTag: "LE SSERAFIM",
        idolType: "girlgroup",
        conceptStyle: "street",
        prompt: "Le Sserafim unforgiven style, denim on denim, cowboy hat, crop jersey, abs showing, confident walk",
        comment: "르세라핌 건강미 넘치는 스타일 도전!",
        voteTarget: "random"
    },
    {
        name: "Zerose_Hanbin",
        groupTag: "ZEROBASEONE",
        idolType: "boygroup",
        conceptStyle: "highteen",
        prompt: "ZB1 youth in shade, white shirt, blue tie, wet hair, flower garden background, fresh boy",
        comment: "제로베이스원 청량 컨셉이 제일 잘 어울려요 🌿",
        voteTarget: "random"
    },
    {
        name: "Monbebe_X",
        groupTag: "MONSTA X",
        idolType: "boygroup",
        conceptStyle: "sexy",
        prompt: "Monsta X love killa, red suit, leather harness, slicked back hair, dangerous vibe",
        comment: "몬베베 계신가요? 섹시 컨셉은 몬엑이 원조죠",
        voteTarget: "random"
    },
    {
        name: "TheB_Sunwoo",
        groupTag: "THE BOYZ",
        idolType: "boygroup",
        conceptStyle: "highteen",
        prompt: "The Boyz thrill ride, lifeguard costume, summer vibe, bright shorts, sunglasses",
        comment: null,
        voteTarget: "random"
    },
    {
        name: "Nswer_Kyujin",
        groupTag: "NMIXX",
        idolType: "girlgroup",
        conceptStyle: "street",
        prompt: "NMIXX mixx pop style, colorful patchwork outfit, big sneakers, unique hair clips, funky",
        comment: "엔믹스처럼 유니크하게 섞어봤어요!",
        voteTarget: "random"
    },
    {
        name: "Engine_Heeseung",
        groupTag: "ENHYPEN",
        idolType: "boygroup",
        conceptStyle: "sexy",
        prompt: "Enhypen vampire concept, ruffled white shirt, velvet cape, pale skin, red eyes, dark castle",
        comment: "엔하이픈 다크문 컨셉 🧛‍♂️",
        voteTarget: "random"
    },
    {
        name: "Kep1ian_Chaehyun",
        groupTag: "Kep1er",
        idolType: "girlgroup",
        conceptStyle: "highteen",
        prompt: "Kep1er wadada, racing suit modified, checkered flag pattern, purple gloves, energetic pose",
        comment: null,
        voteTarget: "random"
    },
    {
        name: "Atiny_San",
        groupTag: "ATEEZ",
        idolType: "boygroup",
        conceptStyle: "cyber",
        prompt: "ATEEZ halazia, post apocalyptic cloak, chains, face mask, dust storm, intense gaze",
        comment: "에이티즈 마라맛은 못참지",
        voteTarget: "random"
    },
    {
        name: "Wizone_Forever",
        groupTag: "IZ*ONE",
        idolType: "girlgroup",
        conceptStyle: "highteen",
        prompt: "IZ*ONE panorama, elegant fairy styling, glittery dress, pastel colours, flowers everywhere",
        comment: "아이즈원 영원히 기억할게... 🌸",
        voteTarget: "random"
    },
    {
        name: "Treasure_Maker",
        groupTag: "TREASURE",
        idolType: "boygroup",
        conceptStyle: "street",
        prompt: "Treasure jikjin, racer jacket, leather pants, futuristic sunglasses, speed lines",
        comment: null,
        voteTarget: "random"
    },
    {
        name: "Luvies_Wendy",
        groupTag: "Red Velvet",
        idolType: "girlgroup",
        conceptStyle: "y2k",
        prompt: "Red Velvet birthday concept, kitsch weirdcore, funky fur hat, colorful oversized sweater",
        comment: "레드벨벳 키치한 느낌 넘 좋아",
        voteTarget: "random"
    },
    {
        name: "Exo_L",
        groupTag: "EXO",
        idolType: "boygroup",
        conceptStyle: "suit",
        prompt: "EXO love shot, colorful silk suit, pistol gesture, rose in pocket, slick hairstyle",
        comment: "엑소 러브샷은 전설이다...",
        voteTarget: "random"
    },
    {
        name: "Sone_Taeyeon",
        groupTag: "Girls Generation",
        idolType: "girlgroup",
        conceptStyle: "suit",
        prompt: "SNSD Mr.Mr. concept, fedora hat, vest, tie, masculine make up on girls, cool vibe",
        comment: "소녀시대 미스터미스터 컨셉 기억하시는 분?",
        voteTarget: "random"
    },
    {
        name: "Shawol_Key",
        groupTag: "SHINee",
        idolType: "boygroup",
        conceptStyle: "y2k",
        prompt: "SHINee view concept, odd eye styling, vintage casual, sleeveless top, hair band",
        comment: "샤이니는 트렌드 그 자체죠",
        voteTarget: "random"
    },
    {
        name: "Insomnia_Dream",
        groupTag: "Dreamcatcher",
        idolType: "girlgroup",
        conceptStyle: "girlcrush",
        prompt: "Dreamcatcher rock metal style, dark heavy makeup, leather harness, gothic jewelry, nightmare theme",
        comment: null,
        voteTarget: "random"
    },
    {
        name: "Orbit_Loona",
        groupTag: "LOONA",
        idolType: "girlgroup",
        conceptStyle: "cyber",
        prompt: "LOONA butterfly, holographic white outfits, airy fabric, dreamlike atmosphere, moon background",
        comment: "이달소 감성은 대체불가 🌙",
        voteTarget: "random"
    },
    {
        name: "Plave_Fan",
        groupTag: "PLAVE",
        idolType: "boygroup",
        conceptStyle: "highteen",
        prompt: "Virtual idol style, anime shader, school uniform with hoodie, guitar on back, cherry blossoms",
        comment: "플레이브 기다릴게~ 예준이가 입어줬으면!",
        voteTarget: "random"
    },
    {
        name: "KissOfLife_Natty",
        groupTag: "KISS OF LIFE",
        idolType: "girlgroup",
        conceptStyle: "y2k",
        prompt: "Kiss of Life mid-2000s R&B style, cargo pants, tube top, big hoop earrings, hiphop vibe",
        comment: "키오프 핫걸 그 자체 🔥",
        voteTarget: "random"
    }
];
