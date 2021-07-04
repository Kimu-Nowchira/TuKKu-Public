/**
 * 끝말잇기 관련 게임 진행 관련 코드
 * 아마 한끝, 영끝, 한앞말, 영끄투 전부 여기에서 관리하는 듯
 */

// 게임이 시작할 때
$lib.Classic.roundReady = function(data){
	var i, len = $data.room.game.title.length;
	var $l;
	
	// 화면 리셋하고 게임 규칙이나 유형에 따라 보이는 것 조정 
	clearBoard();
	$data.is_defence = false
	$data._roundTime = $data.room.time * 1000;
	$stage.game.display.html(getCharText(data.char, data.subChar));
	$stage.game.chain.show().html($data.chain = 0);
	if($data.room.opts.mission === true){
		$stage.game.items.show().css('opacity', 1).html($data.mission = data.mission);
	}
	if($data.room.opts.missionplus === true){
		$stage.game.items.show().css('opacity', 1).html($data.mission = data.mission);
	}
	if($data.room.opts.thememission === true){
		$data.mission = data.mission
		$stage.game.items.show().css('opacity', 1).html(L['theme_' + $data.mission]);
	}
	if(MODE[$data.room.mode] == "KAP"){
		$(".jjoDisplayBar .graph-bar").css({ 'float': "right", 'text-align': "left" });
	}
	drawRound(data.round);
	playSound('round_start');
	recordEvent('roundReady', { data: data });
};


// 턴 시작
$lib.Classic.turnStart = function(data){
	$data.room.game.turn = data.turn;
	if(data.seq) $data.room.game.seq = data.seq;
	if(!($data._tid = $data.room.game.seq[data.turn])) return;
	if($data._tid.robot) $data._tid = $data._tid.id;
	data.id = $data._tid;
	
	$stage.game.display.html($data._char = getCharText(data.char, data.subChar, data.wordLength));
	$("#game-user-"+data.id).addClass("game-user-current");
	if(!$data._replay){
		$stage.game.here.css('display', (data.id == $data.id) ? "block" : "none");
		if(data.id == $data.id){
			if(mobile) $stage.game.hereText.val("").focus();
			else $stage.talk.focus();
		}
	}
	if($data.room.opts.thememission){
		$data.mission = data.mission
		$stage.game.items.html(L['theme_' + $data.mission]);
	}else{
		$stage.game.items.html($data.mission = data.mission);
	}
	
	ws.onmessage = _onMessage;
	clearInterval($data._tTime);
	clearTrespasses();
	$data._chars = [ data.char, data.subChar ];
	$data._speed = data.speed;
	$data._tTime = addInterval(turnGoing, TICK);
	$data.turnTime = data.turnTime;
	$data._turnTime = data.turnTime;
	$data._roundTime = data.roundTime;
	$data._turnSound = playSound("T"+data.speed);
	recordEvent('turnStart', {
		data: data
	});
};


// 턴 진행 중
$lib.Classic.turnGoing = function(){
	if(!$data.room) clearInterval($data._tTime);
	$data._turnTime -= TICK;
	$data._roundTime -= TICK;
	
	$stage.game.turnBar
		.width($data._timePercent())
		.html(($data._turnTime*0.001).toFixed(1) + L['SECOND']);
	$stage.game.roundBar
		.width($data._roundTime/$data.room.time*0.1 + "%")
		.html(($data._roundTime*0.001).toFixed(1) + L['SECOND']);
	
	if(!$stage.game.roundBar.hasClass("round-extreme")) if($data._roundTime <= 5000) $stage.game.roundBar.addClass("round-extreme");
};


// 턴 종료
$lib.Classic.turnEnd = function(id, data){
	var $sc = $("<div>")
		.addClass("deltaScore")
		.html((data.score > 0) ? ("+" + (data.score - data.bonus)) : data.score);
	var $uc = $(".game-user-current");
	var hi;
	
	if($data._turnSound) $data._turnSound.stop();
	addScore(id, data.score);
	clearInterval($data._tTime);
	if(data.ok){
		checkFailCombo();
		clearTimeout($data._fail);
		$stage.game.here.hide();
		$stage.game.chain.html(++$data.chain);
		pushDisplay(data.value, data.mean, data.theme, data.wc);
	}else{
		checkFailCombo(id);
		$sc.addClass("lost");
		$(".game-user-current").addClass("game-user-bomb");
		$stage.game.here.hide();
		playSound('timeout');
	}
	if(data.hint){
		data.hint = data.hint._id;
		hi = data.hint.indexOf($data._chars[0]);
		if(hi == -1) hi = data.hint.indexOf($data._chars[1]);
		
		if(MODE[$data.room.mode] == "KAP") $stage.game.display.empty()
			.append($("<label>").css('color', "#AAAAAA").html(data.hint.slice(0, hi)))
			.append($("<label>").html(data.hint.slice(hi)));
		else $stage.game.display.empty()
			.append($("<label>").html(data.hint.slice(0, hi + 1)))
			.append($("<label>").css('color', "#AAAAAA").html(data.hint.slice(hi + 1)));
	}
	$data.is_defence = $data.wordtype == 'attack'
	$data.wordtype = data.wordtype
	if(data.bonus){
		if($data.room.opts.thememission) playSound('mission');
		mobile ? $sc.html("+" + (b.score - b.bonus) + "+" + b.bonus) : addTimeout(function(){
			var $bc = $("<div>")
				.addClass("deltaScore bonus")
				.html("+" + data.bonus);
			
			drawObtainedScore($uc, $bc);
		}, 500);
	}
	drawObtainedScore($uc, $sc).removeClass("game-user-current");
	updateScore(id, getScore(id));
};
