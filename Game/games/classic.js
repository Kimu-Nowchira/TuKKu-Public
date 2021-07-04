/**
 * Rule the words! KKuTu Online
 * Copyright (C) 2017 JJoriping(op@jjo.kr)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

 var Const = require('../../const');
 var Lizard = require('../../sub/lizard');
 var DB;
 var DIC;
 
 // 봇 난이도 별 특성
 const ROBOT_START_DELAY = [ 1200, 800, 400, 200, 0, 0, 0, 0, 0 ];
 const ROBOT_TYPE_COEF = [ 1250, 750, 500, 250, 0, 0, 0, 0, 0 ];
 const ROBOT_THINK_COEF = [ 4, 2, 1, 0, 0, 0, 0, 0, 0 ];
 const ROBOT_HIT_LIMIT = [ 8, 4, 2, 1, 0, 0, 0, 0, 0 ];
 const ROBOT_LENGTH_LIMIT = [ 3, 4, 9, 99, 99, 150, 999, 999, 999, 999 ];
 const RIEUL_TO_NIEUN = [4449, 4450, 4457, 4460, 4462, 4467, 4467, 4467];
 const RIEUL_TO_IEUNG = [4451, 4455, 4456, 4461, 4466, 4469, 4469, 4469, 4469];
 const NIEUN_TO_IEUNG = [4455, 4461, 4466, 4469, 4469, 4469, 4469, 4469, 4469];
 const DUBANG_LETTERS = ["컥", "좍", "퀑", "컁", "컹", "렁", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
 
 exports.init = function(_DB, _DIC){
	 DB = _DB;
	 DIC = _DIC;
 };
 exports.getTitle = function(){
	 var R = new Lizard.Tail();
	 var my = this;
	 var l = my.rule;
	 var EXAMPLE;
	 var eng, ja;
	 
	 if(!l){
		 R.go("undefinedd");
		 return R;
	 }
	 if(!l.lang){
		 R.go("undefinedd");
		 return R;
	 }
	 EXAMPLE = Const.EXAMPLE_TITLE[l.lang];
	 my.game.dic = {};
	 
	 switch(Const.GAME_TYPE[my.mode]){
		 case 'EKT':
		 case 'ESH':
			 eng = "^" + String.fromCharCode(97 + Math.floor(Math.random() * 26));
			 break;
		 case 'KKT':
			 my.game.wordLength = 3;
		 case 'KSH':
			 ja = 44032 + 588 * Math.floor(Math.random() * 18);
			 eng = "^[\\u" + ja.toString(16) + "-\\u" + (ja + 587).toString(16) + "]";
			 break;
		 case 'KAP':
			 ja = 44032 + 588 * Math.floor(Math.random() * 18);
			 eng = "[\\u" + ja.toString(16) + "-\\u" + (ja + 587).toString(16) + "]$";
			 break;
	 }
	 function tryTitle(h){
		 if(h > 50){
			 R.go(EXAMPLE);
			 return;
		 }
		 DB.kkutu[l.lang].find(
			 [ '_id', new RegExp(eng + ".{" + Math.max(1, my.round - 1) + "}$") ],
			 // [ 'hit', { '$lte': h } ],
			 (l.lang == "ko") ? [ 'type', Const.KOR_GROUP ] : [ '_id', Const.ENG_ID ]
			 // '$where', eng+"this._id.length == " + Math.max(2, my.round) + " && this.hit <= " + h
		 ).limit(20).on(function($md){
			 var list;
			 
			 if($md.length){
				 list = shuffle($md);
				 checkTitle(list.shift()._id).then(onChecked);
			 
				 function onChecked(v){
					 if(v) R.go(v);
					 else if(list.length) checkTitle(list.shift()._id).then(onChecked);
					 else R.go(EXAMPLE);
				 }
			 }else{
				 tryTitle(h + 10);
			 }
		 });
	 }
	 function checkTitle(title){
		 var R = new Lizard.Tail();
		 var i, list = [];
		 var len;
		 
		 /* 부하가 너무 걸린다면 주석을 풀자.
		 R.go(true);
		 return R;
		 */
		 if(title == null){
			 R.go(EXAMPLE);
		 }else{
			 len = title.length;
			 for(i=0; i<len; i++) list.push(getAuto.call(my, title[i], getSubChar.call(my, title[i]), 1));
			 
			 Lizard.all(list).then(function(res){
				 for(i in res) if(!res[i]) return R.go(EXAMPLE);
				 
				 return R.go(title);
			 });
		 }
		 return R;
	 }
	 tryTitle(10);
	 
	 return R;
 };
 exports.roundReady = function(){
	 var my = this;
	 if(!my.game.title) return;
	 
	 clearTimeout(my.game.turnTimer);
	 my.game.round++;
	 my.game.roundTime = my.time * 1000;
	 if(my.game.round <= my.round){
		 my.game.char = my.game.title[my.game.round - 1];
		 my.game.subChar = getSubChar.call(my, my.game.char);
		 my.game.chain = [];

		 // 미션 특수규칙일 경우 미션 글자를 지정
		 if(my.opts.mission) my.game.mission = getMission(my.rule.lang);
		 if(my.opts.missionplus) my.game.mission = getMissionplus()
	     if(my.opts.thememission) my.game.mission = getThemeMission();

		 if(my.opts.sami) my.game.wordLength = 2;
		 
		 my.byMaster('roundReady', {
			 round: my.game.round,
			 char: my.game.char,
			 subChar: my.game.subChar,
			 mission: my.game.mission
		 }, true);
		 my.game.turnTimer = setTimeout(my.turnStart, 2400);
	 }else{
		 my.roundEnd();
	 }
 };
 exports.turnStart = function(force){
	 var my = this;
	 var speed;
	 var si;
	 
	 if(!my.game.chain) return;
	 my.game.roundTime = Math.min(my.game.roundTime, Math.max(10000, 150000 - my.game.chain.length * 1500));
	 speed = my.getTurnSpeed(my.game.roundTime);
	 clearTimeout(my.game.turnTimer);
	 clearTimeout(my.game.robotTimer);
	 my.game.late = false;
	 my.game.turnTime = 15000 - 1400 * speed;
	 my.game.turnAt = (new Date()).getTime();
	 if(my.opts.sami) my.game.wordLength = (my.game.wordLength == 3) ? 2 : 3;
	 
	 my.byMaster('turnStart', {
		 turn: my.game.turn,
		 char: my.game.char,
		 subChar: my.game.subChar,
		 speed: speed,
		 roundTime: my.game.roundTime,
		 turnTime: my.game.turnTime,
		 mission: my.game.mission,
		 wordLength: my.game.wordLength,
		 seq: force ? my.game.seq : undefined
	 }, true);
	 my.game.turnTimer = setTimeout(my.turnEnd, Math.min(my.game.roundTime, my.game.turnTime + 100));

	 // 로봇 차례일 경우
	 if(si = my.game.seq[my.game.turn]) if(si.robot){
		 si._done = [];
		 my.readyRobot(si);
	 }
 };
 exports.turnEnd = function(){
	 var my = this;
	 var target;
	 var score;
	 
	 if(!my.game.seq) return;
	 target = DIC[my.game.seq[my.game.turn]] || my.game.seq[my.game.turn];
	 
	 if(my.game.loading){
		 my.game.turnTimer = setTimeout(my.turnEnd, 100);
		 return;
	 }
	 my.game.late = true;
	 if(target) if(target.game){
		 score = Const.getPenalty(my.game.chain, target.game.score);
		 target.game.score += score;
	 }
	 getAuto.call(my, my.game.char, my.game.subChar, 0).then(function(w){
		 my.byMaster('turnEnd', {
			 ok: false,
			 target: target ? target.id : null,
			 score: score,
			 hint: w
		 }, true);
		 my.game._rrt = setTimeout(my.roundReady, 3000);
	 });
	 clearTimeout(my.game.robotTimer);
 };
 exports.submit = function(client, text){
	 var score, l, t;
	 var my = this;
	 var tv = (new Date()).getTime();
	 var mgt = my.game.seq[my.game.turn];
	 
	 if(!mgt) return;
	 if(!mgt.robot) if(mgt != client.id) return;
	 if(!my.game.char) return;
	 
	 if(!isChainable(text, my.mode, my.game.char, my.game.subChar)) return client.chat(text);
	 if(my.game.chain.indexOf(text) != -1){
		client.publish('turnError', { code: 409, value: text }, true);
		if(client.robot){
		   my.readyRobot(client, true);
		};
		return;
	};
	 
	 l = my.rule.lang;
	 my.game.loading = true;
	 function onDB($doc){
		 if(!my.game.chain) return;
		 var preChar = getChar.call(my, text);
		 var preSubChar = getSubChar.call(my, preChar);
		 var firstMove = my.game.chain.length < 1;
		 
		 function preApproved(){
			 function approved(){
				 if(my.game.late) return;
				 if(!my.game.chain) return;
				 if(!my.game.dic) return;
				 
				 my.game.loading = false;
				 my.game.late = true;
				 clearTimeout(my.game.turnTimer);
				 t = tv - my.game.turnAt;
				 score = my.getScore(text, t, $doc.theme);
				 my.game.dic[text] = (my.game.dic[text] || 0) + 1;
				 my.game.chain.push(text);
				 my.game.roundTime -= t;
				 my.game.char = preChar;
				 my.game.subChar = preSubChar;
				 var wordtype = undefined
				 if($doc.relay < 150){wordtype = 'attack'}
				 client.game.score += score;
				 client.publish('turnEnd', {
					 ok: true,
					 value: text,
					 wordtype: wordtype,
					 mean: $doc.mean,
					 theme: $doc.theme,
					 wc: $doc.type,
					 score: score,
					 bonus: (my.game.mission === true) ? score - my.getScore(text, t) : 0,
					 baby: $doc.baby
				 }, true);
				 if(my.game.mission === true){
					 if(my.opts.thememission){
						my.game.mission = getThemeMission();
					 }else if(my.opts.missionplus){
						my.game.mission = getMissionplus();
					 }else{
						my.game.mission = getMission(my.rule.lang);
					 }
				 }
				 setTimeout(my.turnNext, my.game.turnTime / 6);
				 if(!client.robot){
					 client.invokeWordPiece(text, 1);
					 DB.kkutu[l].update([ '_id', text ]).set([ 'hit', $doc.hit + 1 ]).on();
				 }
			 }
			 my.game.feedback = false
			 // 두방 단어 또는 금지 단어인지 확인
			 /*
			 if(my.opts.manner && (DUBANG_LETTERS.indexOf(preChar) != -1)){getAuto.call(my, preChar, preSubChar, 1).then(function(w){
				client.publish('turnError', { code: 411, value: text }, true);
				my.game.feedback = true
				if(client.robot) my.readyRobot(client);
				return;
			 })
			};
			*/
			 // 매너 확인
			if(firstMove || my.opts.manner){getAuto.call(my, preChar, preSubChar, 1).then(function(w){
				 if(w){
					 approved();
				 }
				 else{
					 my.game.loading = false;
					 // 402 : 첫 턴 한방단어 금지
					 // 403 : 매너에서 한방단어 사용
					 client.publish('turnError', { code: firstMove ? 402 : 403, value: text }, true);
					 my.game.feedback = true
					 if(client.robot) my.readyRobot(client);
				 }
			 });}
			 else approved();
		 }
		 function denied(code){
			 my.game.loading = false;
			 client.publish('turnError', { code: code || 404, value: text }, true);
			 if(client.robot){
				 my.readyRobot(client);
			 }
		 }
		 // 지금 사전에서는 쓸 수 없는 
		 if($doc){
			 if(my.dictsize < $doc.range) denied(410);
			 // if(!my.opts.injeong && ($doc.flag & Const.KOR_FLAG.INJEONG)) denied();
			 // else if(my.opts.strict && (!$doc.type.match(Const.KOR_STRICT) || $doc.flag >= 4)) denied(406);
			 // else if(my.opts.loanword && ($doc.flag & Const.KOR_FLAG.LOANWORD)) denied(405);
			 else preApproved();
		 }else{
			 denied();
		 }
	 }
	 function isChainable(){
		 var type = Const.GAME_TYPE[my.mode];
		 var char = my.game.char, subChar = my.game.subChar;
		 var l = char.length;
		 
		 if(!text) return false;
		 if(text.length <= l) return false;
		 if(my.game.wordLength && text.length != my.game.wordLength) return false;
		 if(type == "KAP") return (text.slice(-1) == char) || (text.slice(-1) == subChar);
		 switch(l){
			 case 1: return (text[0] == char) || (text[0] == subChar);
			 case 2: return (text.substr(0, 2) == char);
			 case 3: return (text.substr(0, 3) == char) || (text.substr(0, 2) == char.slice(1));
			 default: return false;
		 }
	 }
	 DB.kkutu[l].findOne([ '_id', text ],
		 (l == "ko") ? [ 'type', Const.KOR_GROUP ] : [ '_id', Const.ENG_ID ]
	 ).on(onDB);
 };
 exports.getScore = function(text, delay, theme){
	var my = this;
	var tr = 1 - delay / my.game.turnTime;
	var score, arr;
	var ignoreMission = !theme
	
	if(!text || !my.game.chain || !my.game.dic) return 0;
	score = Const.getPreScore(text, my.game.chain, tr);
	
	if(my.game.dic[text]) score *= 15 / (my.game.dic[text] + 15);
	if(ignoreMission) return Math.round(score);

	if(my.opts.thememission){
		// 테마 미션인 경우
		if(theme.indexOf(my.game.mission) != -1){
			score += score * 2;
			my.game.mission = true;
		}
	}else if(arr = text.match(new RegExp(my.game.mission, "g"))){
		// 일반 미션인 경우
		if(my.opts.missionplus){
			score += score * arr.length;
		}else{
			score += score * 0.5 * arr.length;
		}
		my.game.mission = true;
	}
	return Math.round(score);
 };
 
 // 끝말잇기 봇 생각 알고리즘
 exports.readyRobot = function(robot, feedback){
	 if(feedback === undefined) feedback = false;

	// 변수 정의
	 var my = this;
	 var level = robot.level;
	 var delay = ROBOT_START_DELAY[level];
	 var ended = {};
	 var w, text, i;
	 var lmax;
	 var isRev = Const.GAME_TYPE[my.mode] == "KAP";
	 
	 getAuto.call(my, my.game.char, my.game.subChar, 2).then(function(list){
		var tukku_think = function(a, b){
			// 트꾸 봇의 정렬 기준
			if(level == 5){
				var longword = Math.floor(Math.random() * 9) + 1
				return (a.relay - (a._id.length / longword)) - (b.relay - (b._id.length / longword));
			// 장문 트꾸 봇의 정렬 기준
			}else if(level == 6){
				return b._id.length - a._id.length;
			}else if(level == 7){
				var bplus = 0
				var aplus = 0
				if(b._id.charAt(b._id.length - 1) == "역") bplus += 100;
				if(a._id.charAt(a._id.length - 1) == "역") aplus += 100;
				if(b._id.charAt(b._id.length - 1) == "력") bplus += 50;
				if(a._id.charAt(a._id.length - 1) == "력") aplus += 50;
				if(b._id.charAt(b._id.length - 1) == "녁") bplus += 50;
				if(a._id.charAt(a._id.length - 1) == "녁") aplus += 50;
				return (bplus + b._id.length) - (aplus + a._id.length);
			}else if(level == 8){
				var bplus = 0
				var aplus = 0
				console.log(a.theme)
				if(a.theme.indexOf('POK') != -1) aplus += 100
				if(b.theme.indexOf('POK') != -1) bplus += 100
				return (bplus + b._id.length) - (aplus + a._id.length);
			}else{
				console.log('데이터에 없는 봇 사용')
				return b._id.length - a._id.length;
			}
		};

		// 이을 수 있는 단어가 없는 경우 포기
		if(!list.length) {
			text = "한방 단어는 너무 하잖아... ㅠㅠ";
			return after();
		}

		// 트꾸 봇인 경우
		if(level > 4) {
			list.sort(tukku_think);  // 단어를 공격적인 순서대로 정렬
			for(i in list){
				// 쓸 수 없는 단어는 자동으로 패스
				if(list[i].range > my.dictsize || (my.opts.manner && (list[i].relay == 0))) continue;

				// 이미 사용한 단어도 자동으로 패스
				try{
					if(my.game.chain.indexOf(list[i]._id) != -1) continue;
				} catch { console.log('봇 작동 중 방폭 발생') }

				// 두 방 단어 또는 금지 단어면 패스
				if(my.opts.manner && (DUBANG_LETTERS.indexOf(list[i]._id.charAt(list[i]._id.length - 1)) != -1)) continue;

				// 입력에서 실패하여 다시 분석하는 경우 일정 확률로 패스
				if(my.game.feedback && Math.random() > 0.5) continue;
				text = list[i]._id
				return after();
			};
			console.log('스택 사용');
			text = "스택킬 나빠아아아아! 흐아앙";
			return after();
		}
		// 끄투봇의 경우
		else{
			list.sort(function(a, b){ return b.hit - a.hit; }); // 사용량 기준 리스트 정렬
			if(ROBOT_HIT_LIMIT[level] > list[0].hit) denied(); // 레벨보다 수준 높은 단어면 거부

			// 고수, 사기 끄투 봇
			if(level >= 3 && !robot._done.length){
				if(Math.random() < 0.5) list.sort(function(a, b){ return b._id.length - a._id.length; }); // 일정 확률로 장문 기준으로 정렬
				if(list[0]._id.length < 8 && my.game.turnTime >= 2300){
					for(i in list){
						w = list[i]._id.charAt(isRev ? 0 : (list[i]._id.length - 1));
						if(!ended.hasOwnProperty(w)) ended[w] = [];
						ended[w].push(list[i]);
					}
					getWishList(Object.keys(ended)).then(function(key){
						var v = ended[key];
						
						if(!v) denied();
						else pickList(v);
					});
				}else pickList(list);

			// 그 외 끄투 봇은 아무 거나 뽑아 씀
			}else pickList(list);
		}
	 });
	 function denied(){
		 text = '...어라 모르겠어요... ㅠㅠ';
		 after();
	 }
	 // 리스트에서
	 function pickList(list){
		 if(list) do{
			 if(!(w = list.shift())) break;
		 }while(w._id.length > ROBOT_LENGTH_LIMIT[level] || robot._done.includes(w._id));
		 if(w){
			 text = w._id;
			 delay += 500 * ROBOT_THINK_COEF[level] * Math.random() / Math.log(1.1 + w.hit);
			 after();
		 }else denied();
	 }
	 function after(){
		 delay += text.length * ROBOT_TYPE_COEF[level];
		 robot._done.push(text);
		 setTimeout(my.turnRobot, delay, robot, text);
	 }
	 function getWishList(list){
		 var R = new Lizard.Tail();
		 var wz = [];
		 var res;
		 
		 for(i in list) wz.push(getWish(list[i]));
		 Lizard.all(wz).then(function($res){
			 if(!my.game.chain) return;
			 $res.sort(function(a, b){ return a.length - b.length; });
			 
			 if(my.opts.manner || !my.game.chain.length){
				 while(res = $res.shift()) if(res.length) break;
			 }else res = $res.shift();
			 R.go(res ? res.char : null);
		 });
		 return R;
	 }
	 function getWish(char){
		 var R = new Lizard.Tail();
		 
		 DB.kkutu[my.rule.lang].find([ '_id', new RegExp(isRev ? `.${char}$` : `^${char}.`) ]).limit(10).on(function($res){
			 R.go({ char: char, length: $res.length });
		 });
		 return R;
	 }
 };

 // const.js의 미션 글자 리스트에서 랜덤으로 글자를 뽑아 주는 함수 
 function getMission(l){
	 var arr = (l == "ko") ? Const.MISSION_ko : Const.MISSION_en;
	 
	 if(!arr) return "-";
	 return arr[Math.floor(Math.random() * arr.length)];
 }

 // ★ 미션 플러스 글자를 뽑아주는 함수
 function getMissionplus(){
	 var arr = Const.MISSIONPLUS_ko;
	 
	 if(!arr) return "-";
	 return arr[Math.floor(Math.random() * arr.length)];
 }

 // ★ 미션 플러스 글자를 뽑아주는 함수
 function getThemeMission(){
	 var arr = Const.KO_THEMEMISSION;
	 
	 if(!arr) return "-";
	 return arr[Math.floor(Math.random() * arr.length)];
 }

 function getAuto(char, subc, type){
	 /* type
		 0 무작위 단어 하나
		 1 존재 여부
		 2 단어 목록
	 */
	 var my = this;
	 var R = new Lizard.Tail();
	 var gameType = Const.GAME_TYPE[my.mode];
	 var adv, adc;
	 var key = gameType + "_" + keyByOptions(my.dictsize);
	 var MAN = DB.kkutu_manner[my.rule.lang];  // 주목!
	 var bool = type == 1;
	 
	 adc = char + (subc ? ("|"+subc) : "");

	 // 규칙 별로 단어 룰을 받아 옴
	 switch(gameType){
		 case 'EKT':  // 영끄투
			 adv = `^(${adc})..`;
			 break;
		 case 'KSH': // 한국어 끝말잇기
			 adv = `^(${adc}).`;
			 break;
		 case 'ESH': // 영어 끝말잇기
			 adv = `^(${adc})...`;
			 break;
		 case 'KKT':  // 쿵쿵따
			 adv = `^(${adc}).{${my.game.wordLength-1}}$`;
			 break;
		 case 'KAP':
			 adv = `.(${adc})$`;
			 break;
	 }
	 if(!char){
		 console.log(`Undefined char detected! key=${key} type=${type} adc=${adc}`);
	 }
	 MAN.findOne([ '_id', char || "★" ]).on(function($mn){
		 if($mn && bool){
			 if($mn[key] === null) produce();
			 else R.go($mn[key]);
		 }else{
			 produce();
		 }
	 });
	 function produce(){
		 var aqs = [[ '_id', new RegExp(adv) ]];
		 var aft;
		 var lst;
		 aqs.push([ 'range', { $lte: my.dictsize } ]);
		 if(my.rule.lang == "ko"){
			 aqs.push([ 'type', Const.KOR_GROUP ]);
		 }else{
			 aqs.push([ '_id', Const.ENG_ID ]);
		 }
		 /*
		 if(!my.opts.injeong) aqs.push([ 'flag', { '$nand': Const.KOR_FLAG.INJEONG } ]);
		 if(!my.opts.choinjeong) aqs.push([ 'flag', { '$nand': Const.KOR_FLAG.CHOINJEONG } ]);
		 if(my.rule.lang == "ko"){
			 if(my.opts.loanword) aqs.push([ 'flag', { '$nand': Const.KOR_FLAG.LOANWORD } ]);
			 if(my.opts.strict) aqs.push([ 'type', Const.KOR_STRICT ], [ 'flag', { $lte: 3 } ]);
			 else aqs.push([ 'type', Const.KOR_GROUP ]);
		 }else{
			 aqs.push([ '_id', Const.ENG_ID ]);
		 }
		 */
		 switch(type){
			 case 0:
			 default:
				 aft = function($md){
					 R.go($md[Math.floor(Math.random() * $md.length)]);
				 };
				 break;
			 case 1:
				 aft = function($md){
					 R.go($md.length ? true : false);
				 };
				 break;
			 case 2:
				 aft = function($md){
					 R.go($md);
				 };
				 break;
		 }
		 // 랙이 걸리면 숫자를 줄이자
		 DB.kkutu[my.rule.lang].find.apply(this, aqs).limit(bool ? 1 : 10000).on(function($md){
			 forManner($md);
			 if(my.game.chain) aft($md.filter(function(item){ return !my.game.chain.includes(item); }));
			 else aft($md);
		 });
		 function forManner(list){
			 lst = list;
			 MAN.upsert([ '_id', char ]).set([ key, lst.length ? true : false ]).on(null, null, onFail);
		 }
		 function onFail(){
			 MAN.createColumn(key, "boolean").on(function(){
				 forManner(lst);
			 });
		 }
	 }
	 return R;
 }
 // 특수 규칙
 function keyByOptions(dictsize){
	 var arr = [];
	 arr.push(dictsize);
	 // 어인정
	 // if(opts.injeong) arr.push('X');
	 // 우리말
	 // if(opts.loanword) arr.push('L');
	 // 깐깐
	 // if(opts.strict) arr.push('S');
	 return arr.join('');
 }
 function shuffle(arr){
	 var i, r = [];
	 
	 for(i in arr) r.push(arr[i]);
	 r.sort(function(a, b){ return Math.random() - 0.5; });
	 
	 return r;
 }
 function getChar(text){
	 var my = this;
	 
	 switch(Const.GAME_TYPE[my.mode]){
		 case 'EKT': return text.slice(text.length - 3);
		 case 'ESH':
		 case 'KKT':
		 case 'KSH': return text.slice(-1);
		 case 'KAP': return text.charAt(0);
	 }
 };
 // 두음법칙 적용된 글자 얻는 함수
 function getSubChar(char){
	 var my = this;
	 var r;
	 var c = char.charCodeAt();
	 var k;
	 var ca, cb, cc;
	 
	 switch(Const.GAME_TYPE[my.mode]){
		 case "EKT":
			 if(char.length > 2) r = char.slice(1);
			 break;
		 case "KKT": case "KSH": case "KAP":
			 k = c - 0xAC00;
			 if(k < 0 || k > 11171) break;
			 ca = [ Math.floor(k/28/21), Math.floor(k/28)%21, k%28 ];
			 cb = [ ca[0] + 0x1100, ca[1] + 0x1161, ca[2] + 0x11A7 ];
			 cc = false;
			 if(cb[0] == 4357){ // ㄹ에서 ㄴ, ㅇ
				 cc = true;
				 if(RIEUL_TO_NIEUN.includes(cb[1])) cb[0] = 4354;
				 else if(RIEUL_TO_IEUNG.includes(cb[1])) cb[0] = 4363;
				 else cc = false;
			 }else if(cb[0] == 4354){ // ㄴ에서 ㅇ
				 if(NIEUN_TO_IEUNG.indexOf(cb[1]) != -1){
					 cb[0] = 4363;
					 cc = true;
				 }
			 }
			 if(cc){
				 cb[0] -= 0x1100; cb[1] -= 0x1161; cb[2] -= 0x11A7;
				 r = String.fromCharCode(((cb[0] * 21) + cb[1]) * 28 + cb[2] + 0xAC00);
			 }
			 break;
		 case "ESH": default:
			 break;
	 }
	 return r;
 }