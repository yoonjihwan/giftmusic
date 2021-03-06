var groupseq = 1;
var cart = [];
var tracks = [];
var toastView = function(scope, timeout, message){
  scope.toast_message = message;
  scope.toast = true;
  timeout(function(){
    scope.toast = false;
  }, 3000);
}
const user = "test";
angular.module('starter.controllers', ['ionic'])
  .controller('usCtrl', ['$scope', '$state','TrackList', function ($scope, $state, TrackList) {
    $scope.trackSearch = function(){
      $state.go('search', { 'keyword': $scope.search });
    };    // 목록 담기

  }])
  .controller('editCtrl', ['$scope','$stateParams', '$state', 'TrackList', function ($scope, $stateParams, $state, TrackList) {
    $scope.selection = [];
      var edit = [];
	  /*
      angular.forEach(d.data.album, function (t) {
        var track = {seq: t.SEQ, url: t.TRACK_STREAM, artist: t.ARTIST, title: t.TITLE, thumb: t.ALBUM_THUMB, number: t.TRACK_NUMBER};
        edit.push(track);
      });
	  */
	  angular.forEach(tracks, function(t){
		edit.push(t);
	  });
      $scope.searchTracks = edit;
	  console.log(edit);

    $scope.goAlbum = function(){
      TrackList.pushPlayGroup(groupseq, $scope.selection, "PLAYLIST");
      $state.go('player', { 'group': null });
    };

    $scope.doTheBack = function() {
      window.history.back();
    };

    // 토클된 트랙
    $scope.checkedItem = function(i){
      var idx = $scope.selection.indexOf(i);
      // is currently selected
      if (idx > -1) {
        return true;
      } else return false;
    };

    // 토글 처리
    $scope.toggleSelection = function(index) {
      var idx = $scope.selection.indexOf(index);
      // is currently selected
      if (idx > -1) {
        $scope.selection.splice(idx, 1);
      }
      // is newly selected
      else {
        $scope.selection.push(index);
      }
      cart = $scope.selection;
    };

    $scope.setChangePost = function(){
      $state.go('send', { 'cnt' : cart.length });
    };
  }])

  .controller('searchCtrl', ['$scope','$stateParams', 'TrackList', '$state', '$timeout', function ($scope, $stateParams, TrackList, $state, $timeout) {
      var search = [];
      $scope.selection = [];
      $scope.tab = true;
      $scope.keyword = "";

      $scope.viewMenu = function(seqno){
        $scope.menu = true;
        $scope.selectAlbum = seqno;
      };

      // 검색 내용 출력
      var printList = function (d){
        TrackList.getSearchTrack(d).then(function(d){
          search = [];
          angular.forEach(d.data.album, function (t) {
            var track = {seq: t.SEQ, url: t.TRACK_STREAM, artist: t.ARTIST, title: t.TITLE, thumb: t.ALBUM_THUMB, album: t.ALBUM, number: t.TRACK_NUMBER};
            search.push(track);
          });
          $scope.searchTracks = search;
        });
      };

      // 음악 검색
      $scope.trackSearch = function(t){
        printList(t.keyword);
      };
      if(typeof $stateParams.keyword != 'undefined'){
        printList($stateParams.keyword);
      }

      // 토클된 트랙
      $scope.checkedItem = function(i){
        var idx = $scope.selection.indexOf(i);
        // is currently selected
        if (idx > -1) {
          return true;
        } else return false;
      };

      // 토글 처리
      $scope.toggleSelection = function(index) {
        var idx = $scope.selection.indexOf(index);
          // is currently selected
        if (idx > -1) {
          $scope.selection.splice(idx, 1);
        }
          // is newly selected
        else {
          $scope.viewMenu();
          $scope.selection.push(index);
        }
      };

      $scope.goAlbum = function(){
        $scope.pushList();
        $state.go('player', { 'group': -1 });
      };

      $scope.pushList = function(){
        //TrackList.pushPlayGroup(groupseq, $scope.selection, "PLAYLIST");
        var pack = [];
        angular.forEach(search, function(t){
          angular.forEach($scope.selection, function(s) {
            if(t.number == s) pack.push(t);
          });
        });
        tracks = pack;
        toastView($scope, $timeout, "선택한 음악이 담겼습니다.");
      };

      $scope.gift = function(){
        $scope.pushList();
        $state.go('send', { 'cnt' : cart });
      }
  }])

  // Index Page
  .controller('topCtrl', ['$scope', 'TrackList', '$state', '$timeout',function ($scope, TrackList, $state, $timeout) {
    //TrackList.init(); // 초기화
    var albums = [{'PLAYGROUP' : -1, 'POST_TITLE' : '내가 담은 음악', 'POST_TOKEN' : null, 'thumb': 'http://masterplayer.net/track/image/thumb_000000.jpg'}];
    TrackList.getAlbum(user).then(function(d){
      angular.forEach(d.data[0], function(a){
        albums.push(a);
      });
      $scope.albums = albums;
    });

    $scope.pushAlbum = function(seqno){
      TrackList.getTracks(seqno, user).then(function(d){
        //var result = TrackList.setPlayGroup(d.data.album);
		//tracks = tracks.concat(result);
		  angular.forEach(d.data.album, function(r){
			  var chk = false;
			  angular.forEach(tracks, function(t){
				if(t.seq == r.SEQ) chk = true;
			  });
			  if(!chk){
				  var track = {seq: r.SEQ, url: r.TRACK_STREAM, artist: r.ARTIST, title: r.TITLE, thumb: r.ALBUM_THUMB, album: r.ALBUM, number: r.TRACK_NUMBER};  
				  tracks.push(track);
			  }
		  });
        toastView($scope, $timeout, "선택한 음악이 담겼습니다.");
      });
    };

    $scope.viewMenu = function(seqno){
      $scope.menu = true;
      $scope.selectAlbum = seqno;
    };

    $scope.gift = function(seqno){
      TrackList.getTracks(seqno, user).then(function(d){
        angular.forEach(d.data.album, function (t) {
          cart.push(t.TRACK_NUMBER);
        });
        $state.go('send', { 'cnt' : cart.length });
      });
    };

    $scope.goAlbum = function(group){
      $state.go('player', { 'group': group });
    };
  }])

  // Myalbum
  .controller('myalbumCtrl', ['$scope', 'TrackList', '$state', '$timeout', function ($scope, TrackList, $state, $timeout) {
    TrackList.init(); // 초기화
    var albums = [];
    TrackList.getAlbum(user).then(function(d){
      angular.forEach(d.data[0], function(a){
        albums.push(a);
      });
      $scope.albums = albums;
    });

    $scope.pushAlbum = function(seqno){
      TrackList.getTracks(seqno, user).then(function(d){
		//var result = TrackList.setPlayGroup(d.data.album);
		  angular.forEach(d.data.album, function(r){
			  var chk = false;
			  angular.forEach(tracks, function(t){
				if(t.seq == r.SEQ) chk = true;
			  });
			  if(!chk){
				  var track = {seq: r.SEQ, url: r.TRACK_STREAM, artist: r.ARTIST, title: r.TITLE, thumb: r.ALBUM_THUMB, album: r.ALBUM, number: r.TRACK_NUMBER};  
				  tracks.push(track);
			  }
		  });
		  console.log(tracks);
        toastView($scope, $timeout, "선택한 음악이 담겼습니다.");
      });
    };

    $scope.viewMenu = function(seqno){
      $scope.menu = true;
      $scope.selectAlbum = seqno;
    };

    $scope.gift = function(seqno){
      TrackList.getTracks(seqno, user).then(function(d){
        angular.forEach(d.data.album, function (t) {
          cart.push(t.TRACK_NUMBER);
        });
        $state.go('send', { 'cnt' : cart });
      });
    };

    $scope.goAlbum = function(group){
      $state.go('player', { 'group': group });
    };
  }])

  // Send
  .controller('sendCtrl', ['$rootScope' ,'$scope', 'TrackList', '$stateParams', '$httpParamSerializerJQLike', function ($rootScope, $scope, TrackList, $stateParams, $httpParamSerializerJQLike) {
	  var token = "test";
    $scope.albumcnt = 0;
    $scope.tracks = [];
    $scope.sendfrm = [];

	console.log($stateParams);

	if(typeof $stateParams.cnt != 'undefined' && $stateParams.cnt != "") $scope.albumcnt = $stateParams.cnt;
	else $scope.albumcnt = 0;
	/*
    $rootScope.$on('$stateChangeStart',
      function(event, toState, toParams, fromState, fromParams){
        // do something
        $scope.albumcnt = cart.length;
    });
	*/

	  $scope.sender = function(){
      var formData = $scope.sendfrm;
      //var formfile = formData.file;
      formData.group = groupseq;
      formData.type = "POST";
      formData.sender = user;
      TrackList.sendPost(formData, cart).then(function(d){
        var p = d.data.data.token;
        window.open('http://masterplayer.net/main/message?token=' + encodeURI(p) + '&message=' + encodeURIComponent(formData.description), '_system', 'location=yes');
      });
	  };
  }])
  // Player
  .controller('playerCtrl', ['$scope', 'TrackList', '$timeout', '$interval', 'PlayerService', '$stateParams', function ($scope, TrackList, $timeout, $interval, PlayerService, $stateParams) {
	var current = -1;
	$scope.title = "No Track";
	$scope.artist = "No Artist";
  $scope.album = "No Album";
	$scope.thumb = ""
  $scope.seek = 0;
  $scope.progress = function(t){
    var duration = PlayerService.duration();
    var seek = Math.floor(duration*(t/100));
    PlayerService.toSeek(seek);
  };
	$scope.playerPrev = function(){
		PlayerService.previous();
		$scope.seek = 0;
	};
	$scope.playerNext = function(){
		PlayerService.next();
		$scope.seek = 0;
	};
	$scope.playerStop = function(){
		PlayerService.pause();
	};
    $scope.playerToPlay = function (i) {
      PlayerService.currentIndex = i;
      PlayerService.play();
    };
    $scope.formatDate = function (date) {
      var dateOut = new Date(date);
      return dateOut;
    };
	var setPlayer = function () {
	  // Async
	  $timeout(function () {
		if (TrackList.all().length > 0) {
		  $scope.tracks = [];
		  $scope.tracks = TrackList.all();
		  PlayerService.trackList = [];
		  angular.forEach($scope.tracks, function (t) {
				var chk = false;
				angular.forEach(PlayerService.trackList, function (p){
				  if(p.seq == t.seq) chk = true;
				});
			  if(!chk) PlayerService.trackList.push(t);
		  });
		  PlayerService.play();
		} else {
		  setPlayer();
		}
	  });
	}
	$interval(function() {
    $scope.paused = PlayerService.isPaused;
		var index = PlayerService.currentIndex;
		if(PlayerService.trackList.length > 0 && PlayerService.isPaused == false ) {
		  if (current != index) {
			$scope.title = PlayerService.trackList[index].title;
			$scope.artist = PlayerService.trackList[index].artist;
			$scope.thumb = PlayerService.trackList[index].thumb;
			$scope.album = PlayerService.trackList[index].album;
			$scope.indexer = index;
			current = index;
		  }
		  var duration = PlayerService.duration();
		  var time = PlayerService.time();
		  var seek = document.getElementById("seek");
		  seek.value = Math.floor(100 * (time / duration));
		  $scope.playtime = Math.floor(time * 1000);
		  $scope.endtime = Math.floor(duration * 1000);
		}
	}, 500);
    // init
    if($stateParams.group != -1){
      groupseq = $stateParams.group;
      TrackList.getMyPlaylist($stateParams.group, user);
    } else {
      TrackList.clear();
      TrackList.setTracks(tracks);
    }
    setPlayer();
  }])
.directive('customOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.customOnChange);
      element.bind('change', onChangeHandler);
    }
  };
})
.directive('file', function () {
  return {
    scope: {
      file: '='
    },
    link: function (scope, el, attrs) {
      el.bind('change', function (event) {
        var file = event.target.files[0];
        scope.file = file ? file : undefined;

        var reader = new FileReader();
        reader.onload = function(event) {
          //scope.file = event.target.result;
        }
        scope.$apply();
        //reader.readAsDataURL(file);
        reader.readAsBinaryString(file);
      });
    }
  };
})
