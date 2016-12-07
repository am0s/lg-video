(function() {

    'use strict';

    var defaults = {
        videoMaxWidth: '855px',
        youtubePlayerParams: false,
        vimeoPlayerParams: false,
        dailymotionPlayerParams: false,
        vkPlayerParams: false,
        videojs: false,
        videojsOptions: {}
    };

    var Video = function(element) {

        this.core = $(element).data('lightGallery');

        this.$el = $(element);
        this.core.s = $.extend({}, defaults, this.core.s);
        this.videoLoaded = false;

        this.init();

        return this;
    };

    Video.prototype.init = function() {
        var _this = this;

        // Event triggered when video url found without poster
        _this.core.$el.on('hasVideo.lg.tm', function(event, index, src, html) {
            var handler = _this.core.$slide.eq(index).data('handler');
            if (handler.name != 'lg-video') {
                return;
            }

            _this.loadVideo(src, 'lg-object', true, index, html, _this.core.$slide.eq(index).find('.lg-video'));
            if (html) {
                if (_this.core.s.videojs) {
                    try {
                        videojs(_this.core.$slide.eq(index).find('.lg-html5').get(0), _this.core.s.videojsOptions, function() {
                            if (!_this.videoLoaded) {
                                this.play();
                            }
                        });
                    } catch (e) {
                        console.error('Make sure you have included videojs');
                    }
                } else {
                    _this.core.$slide.eq(index).find('.lg-html5').get(0).play();
                }
            }
        });

        // Set max width for video
        _this.core.$el.on('onAferAppendSlide.lg.tm', function(event, index) {
            var handler = _this.core.$slide.eq(index).data('handler');
            if (handler.name != 'lg-video') {
                return;
            }
            _this.core.$slide.eq(index).find('.lg-video-cont').css('max-width', _this.core.s.videoMaxWidth);
            _this.videoLoaded = true;
        });

        var loadOnClick = function($el) {
            // check slide has poster
            if ($el.find('.lg-object').hasClass('lg-has-poster') && $el.find('.lg-object').is(':visible')) {

                // check already video element present
                if (!$el.hasClass('lg-has-video')) {

                    $el.addClass('lg-video-playing lg-has-video');

                    var _src;
                    var _html;
                    var _loadVideo = function(_src, _html) {

                        _this.loadVideo(_src, '', false, _this.core.index, _html, $el.find('.lg-video'));

                        if (_html) {
                            if (_this.core.s.videojs) {
                                try {
                                    videojs(_this.core.$slide.eq(_this.core.index).find('.lg-html5').get(0), _this.core.s.videojsOptions, function() {
                                        this.play();
                                    });
                                } catch (e) {
                                    console.error('Make sure you have included videojs');
                                }
                            } else {
                                _this.core.$slide.eq(_this.core.index).find('.lg-html5').get(0).play();
                            }
                        }

                    };

                    if (_this.core.s.dynamic) {

                        _src = _this.core.s.dynamicEl[_this.core.index].src;
                        _html = _this.core.s.dynamicEl[_this.core.index].html;

                        _loadVideo(_src, _html);

                    } else {

                        _src = _this.core.$items.eq(_this.core.index).attr('href') || _this.core.$items.eq(_this.core.index).attr('data-src');
                        _html = _this.core.$items.eq(_this.core.index).attr('data-html');

                        _loadVideo(_src, _html);

                    }

                    var $tempImg = $el.find('.lg-object');
                    $el.find('.lg-video').append($tempImg);

                    // @todo loading icon for html5 videos also
                    // for showing the loading indicator while loading video
                    if (!$el.find('.lg-video-object').hasClass('lg-html5')) {
                        $el.removeClass('lg-complete');
                        $el.find('.lg-video-object').on('load.lg error.lg', function() {
                            $el.addClass('lg-complete');
                        });
                    }

                } else {

                    var youtubePlayer = $el.find('.lg-youtube').get(0);
                    var vimeoPlayer = $el.find('.lg-vimeo').get(0);
                    var dailymotionPlayer = $el.find('.lg-dailymotion').get(0);
                    var html5Player = $el.find('.lg-html5').get(0);
                    if (youtubePlayer) {
                        youtubePlayer.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                    } else if (vimeoPlayer) {
                        try {
                            $f(vimeoPlayer).api('play');
                        } catch (e) {
                            console.error('Make sure you have included froogaloop2 js');
                        }
                    } else if (dailymotionPlayer) {
                        dailymotionPlayer.contentWindow.postMessage('play', '*');

                    } else if (html5Player) {
                        if (_this.core.s.videojs) {
                            try {
                                videojs(html5Player).play();
                            } catch (e) {
                                console.error('Make sure you have included videojs');
                            }
                        } else {
                            html5Player.play();
                        }
                    }

                    $el.addClass('lg-video-playing');

                }
            }
        };

        if (_this.core.doCss() && _this.core.$items.length > 1 && ((_this.core.s.enableSwipe && _this.core.isTouch) || (_this.core.s.enableDrag && !_this.core.isTouch))) {
            _this.core.$el.on('onSlideClick.lg.tm', function() {
                var handler = _this.core.$slide.eq(_this.core.index).data('handler');
                if (handler.name != 'lg-video') {
                    return;
                }
                var $el = _this.core.$slide.eq(_this.core.index);
                loadOnClick($el);
            });
        } else {

            // For IE 9 and bellow
            _this.core.$slide.on('click.lg', function() {
                loadOnClick($(this));
            });
        }

        _this.core.$el.on('onBeforeSlide.lg.tm', function(event, prevIndex, index) {
            var $videoSlide = _this.core.$slide.eq(prevIndex);
            var youtubePlayer = $videoSlide.find('.lg-youtube').get(0);
            var vimeoPlayer = $videoSlide.find('.lg-vimeo').get(0);
            var dailymotionPlayer = $videoSlide.find('.lg-dailymotion').get(0);
            var vkPlayer = $videoSlide.find('.lg-vk').get(0);
            var html5Player = $videoSlide.find('.lg-html5').get(0);
            if (youtubePlayer) {
                youtubePlayer.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            } else if (vimeoPlayer) {
                try {
                    $f(vimeoPlayer).api('pause');
                } catch (e) {
                    console.error('Make sure you have included froogaloop2 js');
                }
            } else if (dailymotionPlayer) {
                dailymotionPlayer.contentWindow.postMessage('pause', '*');

            } else if (html5Player) {
                if (_this.core.s.videojs) {
                    try {
                        videojs(html5Player).pause();
                    } catch (e) {
                        console.error('Make sure you have included videojs');
                    }
                } else {
                    html5Player.pause();
                }
            } if (vkPlayer) {
                $(vkPlayer).attr('src', $(vkPlayer).attr('src').replace('&autoplay', '&noplay'));
            }

            var _src;
            if (_this.core.s.dynamic) {
                _src = _this.core.s.dynamicEl[index].src;
            } else {
                _src = _this.core.$items.eq(index).attr('href') || _this.core.$items.eq(index).attr('data-src');

            }

            var _isVideo = _this.core.isVideo(_src, index) || {};
            if (_isVideo.youtube || _isVideo.vimeo || _isVideo.dailymotion || _isVideo.vk) {
                _this.core.$outer.addClass('lg-hide-download');
            }

            //$videoSlide.addClass('lg-complete');

        });

        _this.core.$el.on('onAfterSlide.lg.tm', function(event, prevIndex) {
            _this.core.$slide.eq(prevIndex).removeClass('lg-video-playing');
        });
    };

    Video.prototype.loadVideo = function(src, addClass, noposter, index, html, $target) {
        var video = '';
        var autoplay = 1;
        var a = '';

        // Enable autoplay for first video if poster doesn't exist
        if (noposter) {
            if (this.videoLoaded) {
                autoplay = 0;
            } else {
                autoplay = 1;
            }
        }

        var handler = this.core.$slide.eq(index).data('handler');
        if (handler.embed) {
            var promise = $.Deferred();
            handler.embed(promise, {
                target: $target,
                autoplay: autoplay
            });
            promise.done(function ($player) {
                $player.addClass(addClass);
            }).fail(function () {
                if (console) {
                    console.error("Failed embedding " + handler.type + "video player");
                }
            });
        }
        return video;
    };

    Video.prototype.destroy = function() {
        this.videoLoaded = false;
    };

    $.fn.lightGallery.modules.video = Video;

    var MediaHandler = $.fn.lightGallery.MediaHandler;

    /**
     * Media handler for the video formats:
     * - youtube
     * - vimeo
     * - dailymotion
     * - vk
     * - html5
     *
     * The handler does most of the heavy lifting by figuring out
     * the video type, creating thumbnail urls and embedded the player.
     *
     * TODO: Move more of the code from Video to VideoHandler
     */
    function VideoHandler(core, index, $element, $slide, type) {
        MediaHandler.call(this, core, index, $element, $slide, type);
        this.name = 'lg-video';
    }
    VideoHandler.prototype = new MediaHandler();
    VideoHandler.prototype.constructor = VideoHandler;

    VideoHandler.prototype.thumbnail = function (promise) {
        var thumbImg = this.defaultThumbnail();
        // If there is no explicitly set thumbnail we load one from the video source
        if (!thumbImg) {
            if (this.type == 'youtube') {
                if (this.core.s.loadYoutubeThumbnail) {
                    thumbImg = '//img.youtube.com/vi/' + this.videoId + '/' + this.core.s.youtubeThumbSize + '.jpg';
                }
            } else if (this.type == 'vimeo') {
                var vimeoErrorThumbSize = '';
                switch (this.core.s.vimeoThumbSize) {
                    case 'thumbnail_large':
                        vimeoErrorThumbSize = '640';
                        break;
                    case 'thumbnail_medium':
                        vimeoErrorThumbSize = '200x150';
                        break;
                    case 'thumbnail_small':
                        vimeoErrorThumbSize = '100x75';
                }
                if (this.core.s.loadVimeoThumbnail) {
                    thumbImg = '//i.vimeocdn.com/video/error_' + vimeoErrorThumbSize + '.jpg';
                }
            } else if (this.type == 'dailymotion') {
                if (this.core.s.loadDailymotionThumbnail) {
                    thumbImg = '//www.dailymotion.com/thumbnail/video/' + this.videoId;
                }
            }
        }

        if (!thumbImg) {
            // Use default image thumbnail if none could be determined
            return MediaHandler.prototype.thumbnail.call(this, promise);
        }

        return promise.resolve(thumbImg);
    }

    /**
     * Embeds the video player on the target element.
     *
     * promise: A promise object which is resolved once element is embedded.
     * options: Options
     *   - autoplay - Whether element should be autoplayed or not.
     *   - target - The element where the player should be embedded.
     */
    VideoHandler.prototype.embed = function (promise, options) {
        var video = '';
        var autoplay = options.autoplay;
        var $target = options.target;
        var a = '';
        var addClass = '';

        if (this.type == 'youtube') {

            a = '?wmode=opaque&autoplay=' + autoplay + '&enablejsapi=1';
            if (this.core.s.youtubePlayerParams) {
                a = a + '&' + $.param(this.core.s.youtubePlayerParams);
            }

            video = '<iframe class="lg-video-object lg-youtube ' + addClass + '" width="560" height="315" src="//www.youtube.com/embed/' + this.videoId + a + '" frameborder="0" allowfullscreen></iframe>';

        } else if (this.type == 'vimeo') {

            a = '?autoplay=' + autoplay + '&api=1';
            if (this.core.s.vimeoPlayerParams) {
                a = a + '&' + $.param(this.core.s.vimeoPlayerParams);
            }

            video = '<iframe class="lg-video-object lg-vimeo ' + addClass + '" width="560" height="315"  src="//player.vimeo.com/video/' + this.videoId + a + '" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';

        } else if (this.type == 'dailymotion') {

            a = '?wmode=opaque&autoplay=' + autoplay + '&api=postMessage';
            if (this.core.s.dailymotionPlayerParams) {
                a = a + '&' + $.param(this.core.s.dailymotionPlayerParams);
            }

            video = '<iframe class="lg-video-object lg-dailymotion ' + addClass + '" width="560" height="315" src="//www.dailymotion.com/embed/video/' + this.videoId + a + '" frameborder="0" allowfullscreen></iframe>';

        } else if (this.type == 'html5') {
            var fL = html.substring(0, 1);
            if (fL === '.' || fL === '#') {
                html = $(html).html();
            }

            video = html;

        } else if (this.type == 'vk') {

            a = '&autoplay=' + autoplay;
            if (this.core.s.vkPlayerParams) {
                a = a + '&' + $.param(this.core.s.vkPlayerParams);
            }

            video = '<iframe class="lg-video-object lg-vk ' + addClass + '" width="560" height="315" src="http://vk.com/video_ext.php?' + this.videoId + a + '" frameborder="0" allowfullscreen></iframe>';

        }

        if (video) {
            var $player = $(video);
            $target.append($player);
            promise.resolve($player);
        } else {
            promise.reject();
        }
    }

    /**
     * Builds the primary markup for the slide.
     *
     * promise: Promise which is resolved once the markup has been added.
     */
    VideoHandler.prototype.loadContent = function (promise) {
        var _this = this,
            iframe = false,
            _hasPoster = false,
            _html;
        if (this.core.s.dynamic) {
            if (this.element.iframe) {
                iframe = true;
            }

            if (this.element.poster) {
                _hasPoster = true;
                _poster = this.element.poster;
            }

            _html = this.element.html;
        } else {
            if (this.element.attr('data-iframe') === 'true') {
                iframe = true;
            }

            if (this.element.attr('data-poster')) {
                _hasPoster = true;
                _poster = this.element.attr('data-poster');
            }

            _html = this.element.attr('data-html');
        }

        if (iframe) {
            this.$slide.prepend('<div class="lg-video-cont" style="max-width:' + this.core.s.iframeMaxWidth + '"><div class="lg-video"><iframe class="lg-object" frameborder="0" src="' + _src + '"  allowfullscreen="true"></iframe></div></div>');
        } else if (_hasPoster) {
            var videoClass = '';
            if (_isVideo && _isVideo.youtube) {
                videoClass = 'lg-has-youtube';
            } else if (_isVideo && _isVideo.vimeo) {
                videoClass = 'lg-has-vimeo';
            } else {
                videoClass = 'lg-has-html5';
            }

            this.$slide.prepend('<div class="lg-video-cont ' + videoClass + ' "><div class="lg-video"><span class="lg-video-play"></span><img class="lg-object lg-has-poster" src="' + _poster + '" /></div></div>');

        } else {
            this.$slide.prepend('<div class="lg-video-cont "><div class="lg-video"></div></div>');
            promise.done(function () {
                _this.core.$el.trigger('hasVideo.lg', [_this.index, _this.src, _html]);
            })
        }

        return promise.resolve();
    }

    /**
     * Detects known video formats from the src url.
     */
    VideoHandler.match = function (core, src, index, $element, $slide) {
        var html, handler;
        if (core.s.dynamic) {
            html = $element.html;
        } else {
            html = $element.attr('data-html');
        }

        if (!src && html) {
            handler = new VideoHandler(core, index, $element, $slide, 'html5');
            handler.html = html;
            return handler;
        }

        var youtube = src.match(/\/\/(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch\?v=|embed\/)?([a-z0-9\-\_\%]+)/i);
        var vimeo = src.match(/\/\/(?:www\.)?vimeo.com\/([0-9a-z\-_]+)/i);
        var dailymotion = src.match(/\/\/(?:www\.)?dai.ly\/([0-9a-z\-_]+)/i);
        var vk = src.match(/\/\/(?:www\.)?(?:vk\.com|vkontakte\.ru)\/(?:video_ext\.php\?)(.*)/i);
        var type, videoId;

        if (youtube) {
            type = 'youtube';
            videoId = youtube[1];
        } else if (vimeo) {
            type = 'vimeo';
            videoId = vimeo[1];
        } else if (dailymotion) {
            type = 'dailymotion';
            videoId = dailymotion[1];
        } else if (vk) {
            type = 'vk';
            videoId = vk[1];
        }
        if (type) {
            handler = new VideoHandler(core, index, $element, $slide, type);
            handler.src = src;
            handler.videoId = videoId;
            return handler;
        }
    }

    $.fn.lightGallery.mediaHandlers.video = VideoHandler;
    $.fn.lightGallery.mediaHandlersActive.push('video');

})();
