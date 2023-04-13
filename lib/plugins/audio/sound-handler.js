ig.module(
        'plugins.audio.sound-handler'
    )
    .requires(
        'plugins.audio.howler-player',
        'plugins.audio.sound-info'
    )
    .defines(function () {
        ig.SoundHandler = ig.Class.extend({
            bgmPlayer: null,
            sfxPlayer: null,
            soundInfo: new SoundInfo(),

            init: function () {
                Howler.autoSuspend = false;
                this.sfxPlayer = new HowlerPlayer(this.soundInfo.sfx);
                this.bgmPlayer = new HowlerPlayer(this.soundInfo.bgm);
            },

            unlockWebAudio: function () {
                if (Howler) {
                    if (Howler.ctx && Howler.ctx.state !== "running") {
                        Howler.ctx.resume();
                    }

                    if (!Howler._audioUnlocked) {
                        if (typeof (Howler._unlockAudio) === "function") {
                            Howler._unlockAudio();
                        }
                    }
                }
            },

            onSystemPause: function() {
                if (this.sfxPlayer) {
                    this.sfxPlayer.onSystemPause();
                }
                if (this.bgmPlayer) {
                    this.bgmPlayer.onSystemPause();
                }
            },

            onSystemResume: function() {
                this.unlockWebAudio();
                if (this.sfxPlayer) {
                    this.sfxPlayer.onSystemResume();
                }
                if (this.bgmPlayer) {
                    this.bgmPlayer.onSystemResume();
                }
            },

            muteSFX: function (bool) {
                if (this.sfxPlayer) {
                    this.sfxPlayer.mute(bool);
                }
            },

            muteBGM: function (bool) {
                if (this.bgmPlayer) {
                    this.bgmPlayer.mute(bool);
                }
            },

            unmuteSFX: function (bool) {
                if (this.sfxPlayer) {
                    this.sfxPlayer.unmute(bool);
                }
            },

            unmuteBGM: function (bool) {
                if (this.bgmPlayer) {
                    this.bgmPlayer.unmute(bool);
                }
            },

            muteAll: function (bool) {
                this.muteSFX(bool);
                this.muteBGM(bool);
            },

            unmuteAll: function (bool) {
                this.unlockWebAudio();
                this.unmuteSFX(bool);
                this.unmuteBGM(bool);
            },

            forceMuteAll: function () {
                this.muteAll(true);
            },

            forceUnMuteAll: function () {
                this.unmuteAll(true);
            },

            forceLoopBGM: function () {}
        });
    });