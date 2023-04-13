ig.module(
	'plugins.audio.howler-player'
).defines(function () {
	HowlerPlayer = ig.Class.extend({
		tagName: "HowlerPlayer",

		isMuted: false,

		soundList: {},

		activeSoundList: {},

		init: function (list) {
			var player = this;
			var folder = "media/audio/";

			for (var soundName in list) {
				var soundPath = list[soundName].path;
				var soundLoopable = !!list[soundName].loop;
				var pathMp3 = folder + soundPath + ".mp3";

				this.soundList[soundName] = new Howl({
					src: [pathMp3],
					loop: soundLoopable,
					onend: function(soundId) {
						if (!this._loop) {
							player.unregisterActiveSound(this, soundId);
						}
					}
				});
			}
		},

		onSystemPause: function() {
			for (var soundId in this.activeSoundList) {
				var audio = this.activeSoundList[soundId];
				this.pause(audio, soundId);
			}
		},

		onSystemResume: function() {
			for (var soundId in this.activeSoundList) {
				var audio = this.activeSoundList[soundId];
				this.resume(audio, soundId);
			}
		},

		play: function (soundName) {
			if (!this.isMuted) {
				var audio = typeof (soundName) === "string" ? this.soundList[soundName] : soundName;
				audio.mute(false);
				var soundId = audio.play();
				this.registerActiveSound(audio, soundId);
			}
		},

		pause: function (soundName, soundId) {
			var audio = typeof (soundName) === "string" ? this.soundList[soundName] : soundName;
			soundId = parseInt(soundId);
			if (audio.playing(soundId)) audio.pause(soundId);
		},

		resume: function (soundName, soundId) {
			if (!this.isMuted) {
				var audio = typeof (soundName) === "string" ? this.soundList[soundName] : soundName;
				soundId = parseInt(soundId);
				if (!audio.playing(soundId)) audio.play(soundId);
			}
		},

		stop: function (soundName, soundId) {
			var audio = typeof (soundName) === "string" ? this.soundList[soundName] : soundName;
			soundId = parseInt(soundId);
			if (audio.playing(soundId)) audio.stop(soundId);
		},

		seek: function (soundName) {
			var audio = typeof (soundName) === "string" ? this.soundList[soundName] : soundName;
			return audio.seek();
		},

		mute: function (fromFocusBlur) {
			if (!fromFocusBlur) this.isMuted = true;
			for (var soundName in this.soundList) {
				var audio = this.soundList[soundName];
				audio.mute(true);
			}
		},

		unmute: function (fromFocusBlur) {
			if (!fromFocusBlur) this.isMuted = false;
			if (!this.isMuted) {
				for (var soundName in this.soundList) {
					var audio = this.soundList[soundName];
					audio.mute(false);
				}
			}
		},

		volume: function (value) {
			if (typeof value !== "number") {
				console.warn("Argument needs to be a number!");
				return;
			}
			value = value.limit(0, 1);
			for (var soundName in this.soundList) {
				var audio = this.soundList[soundName];
				audio.volume(value);
			}
		},

		getVolume: function (soundName) {
			var audio = typeof (soundName) === "string" ? this.soundList[soundName] : soundName;
			return audio.volume();
		},

		registerActiveSound: function(audio, soundId) {
			if (this.activeSoundList === null || typeof(this.activeSoundList) === "undefined") this.activeSoundList = {};
			if (audio === null || typeof(audio) === "undefined") return;

			this.activeSoundList[soundId] = audio;
		},

		unregisterActiveSound: function(audio, soundId) {
			if (this.activeSoundList === null || typeof(this.activeSoundList) === "undefined") this.activeSoundList = [];
			if (audio === null || typeof(audio) === "undefined") return;

			this.activeSoundList[soundId] = null;
			delete this.activeSoundList[soundId];
		}
	});
});