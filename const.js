var GLOBAL = require("./sub/global.json");

exports.KKUTU_MAX = 100; // 서버 당 인원 제한
exports.MAIN_PORTS = GLOBAL.MAIN_PORTS;
exports.TEST_PORT = 4040;

// 스팸 처리 관련
exports.SPAM_CLEAR_DELAY = 1600;
exports.SPAM_ADD_DELAY = 750;
exports.SPAM_LIMIT = 7;
exports.BLOCKED_LENGTH = 10000;
exports.KICK_BY_SPAM = 9;
exports.MAX_OBSERVER = 4;
exports.TESTER = GLOBAL.ADMIN.concat([
	"Input tester id here"
]);
exports.IS_SECURED = GLOBAL.IS_SECURED;
exports.HTTPS_PROXIED = GLOBAL.HTTPS_PROXIED;
exports.SSL_OPTIONS = GLOBAL.SSL_OPTIONS;

// 특수 규칙
exports.OPTIONS = {
	'str': { name: "Strict" },
	'loa': { name: "Loanword" },
	'man': { name: "Manner" },
	'mis': { name: "Mission" },
	'misp': { name: "Missionplus" },
	'tmis' : { name: "ThemeMission" },
	'prv': { name: "Proverb" },
	'k32': { name: "Sami" },
	'no2': { name: "No2" }
};

exports.MOREMI_PART = [ 'back', 'eye', 'mouth', 'shoes', 'clothes', 'head', 'lhand', 'rhand', 'front' ];
exports.CATEGORIES = [ "all", "spec", "skin", "badge", "head", "eye", "mouth", "clothes", "hs", "back" ];
exports.AVAIL_EQUIP = [
	"NIK", "BDG1", "BDG2", "BDG3", "BDG4",
	"Mhead", "Meye", "Mmouth", "Mhand", "Mclothes", "Mshoes", "Mback"
];

// 모레미 의상 분류
exports.GROUPS = {
	'spec': [ "PIX", "PIY", "PIZ", "CNS" ],
	'skin': [ "NIK" ],
	'badge': [ "BDG1", "BDG2", "BDG3", "BDG4" ],
	'head': [ "Mhead" ],
	'eye': [ "Meye" ],
	'mouth': [ "Mmouth" ],
	'clothes': [ "Mclothes" ],
	'hs': [ "Mhand", "Mshoes" ],
	'back': [ "Mback", "Mfront" ]
};

// 게임 유형
exports.RULE = {
/*
	유형: { lang: 언어,
		rule: 이름,
		opts: [ 추가 규칙 ],
		time: 시간 상수,
		ai: AI 가능?,
		big: 큰 화면?,
		ewq: 현재 턴 나가면 라운드 종료?
	}
	<특수 규칙>
	man : 매너
	ext : 어인정
	mis : 미션
	misp : 미션+
	loa : 우리말
	str : 깐깐
*/
	// 영어 끄투
	'EKT': { lang: "en",
		rule: "Classic",
		opts: [ "man", "ext", "mis" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	// 영어 끝말잇기
	'ESH': { lang: "en",
		rule: "Classic",
		opts: [ "ext", "mis" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	// 한국어 쿵쿵따
	'KKT': { lang: "ko",
		rule: "Classic",
		opts: [ "man", "ext", "mis", "loa", "str", "k32" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	// 한국어 끝말잇기
	'KSH': { lang: "ko",
		rule: "Classic",
		opts: [ "man", "ext", "mis", "misp", "tmis", "ext1", "ext2" ],
		// opts: [ "man", "ext", "ext2", "mis", "loa", "str", "misp" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'CSQ': { lang: "ko",
		rule: "Jaqwi",
		opts: [ "ijp" ],
		time: 1,
		ai: true,
		big: false,
		ewq: false
	},
	// 한국어 십자말풀이
	'KCW': { lang: "ko",
		rule: "Crossword",
		opts: [],
		time: 2,
		ai: false,
		big: true,
		ewq: false
	},
	// 한국어 타자대결
	'KTY': { lang: "ko",
		rule: "Typing",
		opts: [ "prv" ],
		time: 1,
		ai: false,
		big: false,
		ewq: false
	},
	// 영어 타자대결
	'ETY': { lang: "en",
		rule: "Typing",
		opts: [ "prv" ],
		time: 1,
		ai: false,
		big: false,
		ewq: false
	},
	// 한국어 앞말잇기
	'KAP': { lang: "ko",
		rule: "Classic",
		opts: [ "man", "ext", "mis", "loa", "str" ],
		time: 1,
		ai: true,
		big: false,
		_back: true,
		ewq: true
	},
	// 훈민정음
	'HUN': { lang: "ko",
		rule: "Hunmin",
		opts: [ "ext", "mis", "loa", "str" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	// 한국어 단어대결
	'KDA': { lang: "ko",
		rule: "Daneo",
		opts: [ "ijp", "mis" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	// 영어 단어대결
	'EDA': { lang: "en",
		rule: "Daneo",
		opts: [ "ijp", "mis" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	// 한국어 솎솎
	'KSS': { lang: "ko",
		rule: "Sock",
		opts: [ "no2" ],
		time: 1,
		ai: false,
		big: true,
		ewq: false
	},
	// 영어 솎솎
	'ESS': { lang: "en",
		rule: "Sock",
		opts: [ "no2" ],
		time: 1,
		ai: false,
		big: true,
		ewq: false
	}
};
exports.getPreScore = function(text, chain, tr){
	return 2 * (Math.pow(5 + 7 * (text || "").length, 0.74) + 0.88 * (chain || []).length) * ( 0.5 + 0.5 * tr );
};
exports.getPenalty = function(chain, score){
	return -1 * Math.round(Math.min(10 + (chain || []).length * 2.1 + score * 0.15, score));
};
exports.GAME_TYPE = Object.keys(exports.RULE);
exports.EXAMPLE_TITLE = {
	'ko': "가나다라마바사아자차",
	'en': "abcdefghij"
};
exports.INIT_SOUNDS = [ "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ" ];
exports.MISSION_ko = [ "가", "나", "다", "라", "마", "바", "사", "아", "자", "차", "카", "타", "파", "하" ];

// 한자 음인 글자 중 메이저 하며, 두음법칙에 걸리지 않는 단어를 모음 
exports.MISSIONPLUS_ko = [
	"가", "각", "간", "갈", "감", "강", "개", "객",
	"거", "건", "검", "겁", "게", "격", "견", "결", "겸", "경", "계",
	"고", "곡", "곤", "골", "공", "과", "관", "괄", "광", "괴", "교",
	"구", "국", "군", "굴", "궁", "권", "궐", "궤", "귀", "규", "균",
	"극", "근", "금", "급", "긍", "기", "김",
	"나", "낙", "난", "남", "납", "낭", "내",
	"노", "농", "뇌", "누",
	"다", "단", "담", "답", "당", "대", "덕", "덩", "도", "독", "동", "두", "둔", "등",
	"마", "만", "망", "매", "맹", "면", "멸", "명", "모", "목", "몰", "몽", "묘", "무", "묵", "문", "물", "미", "민", "밀",
	"바", "박", "반", "발", "방", "배"
];
exports.MISSION_en = [ "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z" ];

// 넓은 사전 주제
exports.KO_INJEONG = [
	"FOD",  // 식품+
	"RUL",  // 법률+
	"DRM",  // 도로명
	"SCH",  // 학교
	"MOV",  // 영화
	"BUS",  // 버스 정류장
	"COP",  // 기업
	// "DSG",  // 도서관
	"MHU",  // 문화유적
	"PAK",  // 공원
	"FIS",  // 물고기
	"HAN",  // 한자
	"HANC",  // 자음퀴즈용 한자 주제
	"JQW",  // 자음퀴즈
	"SGS"  // 사자성어
];
// 매우 넓은 사전 주제 1
exports.KO_CHOINJEONG  = [
	"TVP",  // TV 프로그램
	"GAM",  // 게임
	"LNV",  // 라이트 노벨
	"MNG",  // 만화
	"ANI",  // 애니메이션
	"WBT",  // 웹툰
	"SIG",  // 음악+
	"PSN",  // 인명+
	"STR",  // 인터넷 방송인
	"MTR",  // 철도역
	"WMT",  // 세계 철도역
	"PRO"  // 프로그래밍
];
// 매우 넓은 사전 주제 2 (개별 작품 주제)
exports.KO_CHOINJEONG2 = [
	"POK",  // 포켓몬스터
	"LOL",  // 리그 오브 레전드
	"IMA",  // 아이돌 마스터
	"TOU",  // 동방 프로젝트
	"COK",  // 쿠키런
	"KAN",  // 함대 콜렉션
	// "DIG",  // 디지몬
	"MAR",  // 마리오 시리즈
	"MNC",  // 마인크래프트
	"MNM",  // 마인크래프트 모드
	// "KAB"  // 별의 커비
];
exports.EN_INJEONG = [
];
exports.KO_THEME = [
	"군사", "불교", "지구", "문학", "생명", "음악", "역사",
	"미술", "의학", "화학", "동물", "사회 일반", "심리", "식물", "정보·통신", "정치",
	"약학", "천문", "행정", "경제", "환경", "교통", "농업", "기계", "체육", "언어", "경영",
	"수학", "교육", "전기·전자", "물리", "민속", "임업", "인명", "법률", "공학 일반", "건설",
	"지명", "자연 일반", "영상", "책명", "서비스업", "광업", "한의", "종교 일반", "복식", "공예",
	"공업", "수의", "보건 일반", "식품", "복지", "가톨릭", "산업 일반", "매체", "재료", "예체능 일반",
	"해양", "기독교", "수산업", "연기", "무용", "철학", "지리", "천연자원", "인문 일반", "고유명 일반"
];
exports.KO_THEMEMISSION = [
	"화학", "동물", "식물", "언어", "수학", "지명",
	"GMN", "ANI", "PSN", "MTR",
	"FOD", "ROD", "SCH", "MOV", "COP"
]
exports.EN_THEME = [
	"e05", "e08", "e12", "e13", "e15",
	"e18", "e20", "e43"
];
// 주제 선택창에서 제외할 주제
exports.IJP_EXCEPT = [
	"OIJ"
];
exports.KO_IJP = exports.KO_INJEONG.concat(exports.KO_THEME).concat(exports.KO_CHOINJEONG).concat(exports.KO_CHOINJEONG2).filter(function(item){ return !exports.IJP_EXCEPT.includes(item); });
exports.EN_IJP = exports.EN_INJEONG.concat(exports.EN_THEME).filter(function(item){ return !exports.IJP_EXCEPT.includes(item); });
exports.REGION = {
	'en': "en",
	'ko': "kr"
};
exports.KOR_STRICT = /(^|,)(1|INJEONG)($|,)/;
exports.KOR_GROUP = new RegExp("(,|^)(" + [
	"0", "1", "3", "7", "8", "11", "9",
	"16", "15", "17", "2", "18", "20", "26", "19",
	"INJEONG"
].join('|') + ")(,|$)");
exports.ENG_ID = /^[a-z]+$/i;
exports.KOR_FLAG = {
	LOANWORD: 1, // 외래어
	INJEONG: 2,	// 어인정
	SPACED: 4, // 띄어쓰기를 해야 하는 어휘
	SATURI: 8, // 방언
	OLD: 16, // 옛말
	MUNHWA: 32, // 문화어
	CHOINJEONG: 64 // 초인정
};
exports.WP_REWARD = function(){
	return 10 + Math.floor(Math.random() * 91);
};
exports.getRule = function(mode){
	return exports.RULE[exports.GAME_TYPE[mode]];
};
