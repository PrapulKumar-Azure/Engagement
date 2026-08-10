$(function () {
    'use strict';

    var FALLBACK = {
        occasion: 'Engagement',
        groom: 'Dongari Prapul Kumar',
        bride: 'Pokala Sreeja',
        dateLabel: '14th August 2026',
        dateIso: '2026-08-14T10:30:00',
        timeLabel: '10:30 AM',
        venue: 'Vedika Banquet Hall',
        address: 'Boduppal, Near Mangalya Shopping Mall',
        mapsUrl: 'https://maps.app.goo.gl/ohNhv6QscpYCt11t6?g_st=aw',
        blessings: ['|| శ్రీ రస్తు ||', '|| శుభమస్తు ||'],
        hosts: ['Smt. Sri Dongari Vijayasri', 'Narender'],
        contacts: ['9885114423', '9000557312'],
        inviteText:
            'With the graceful blessings of our families and elders, we joyfully invite you to share in our happiness as we take the first step towards a lifetime of love, laughter, and togetherness. Your presence and good wishes will make our special day truly memorable.'
    };

    initPetals();
    initBootSequence();
    initHeroParallax();
    initCountdown(FALLBACK.dateIso);

    $.ajax({
        url: 'data/invite.json',
        method: 'GET',
        dataType: 'json',
        cache: false,
        timeout: 4000
    })
        .done(function (data) {
            applyInviteData($.extend({}, FALLBACK, data || {}));
            if (data && data.dateIso) {
                initCountdown(data.dateIso);
            }
        })
        .fail(function () {
            applyInviteData(FALLBACK);
        });

    function applyInviteData(data) {
        $('[data-bind="groom"]').text(data.groom);
        $('[data-bind="bride"]').text(data.bride);
        $('[data-bind="dateLabel"]').text(data.dateLabel);
        $('[data-bind="dateHero"]').text(formatHeroDate(data.dateLabel));
        $('[data-bind="timeLabel"]').text('Muhurtham: ' + data.timeLabel);
        $('[data-bind="venue"]').text(data.venue);
        $('[data-bind="address"]').text(data.address);
        $('[data-bind="inviteText"]').text(data.inviteText);

        if (Array.isArray(data.blessings) && data.blessings.length) {
            if (data.blessings[0]) {
                $('[data-bind="blessingLeft"]').text(data.blessings[0]);
            }
            if (data.blessings[1]) {
                $('[data-bind="blessingRight"]').text(data.blessings[1]);
            }
        }

        if (Array.isArray(data.hosts) && data.hosts.length) {
            var hostsHtml = data.hosts
                .map(function (name) {
                    return $('<span>').text(name).prop('outerHTML');
                })
                .join(' <span class="amp">&</span> ');
            $('[data-bind="hosts"]').html(hostsHtml);
        }

        $('[data-bind="maps"]').attr('href', data.mapsUrl);

        var $contacts = $('[data-bind="contacts"]').empty();
        (data.contacts || []).forEach(function (phone) {
            var digits = String(phone).replace(/\D/g, '');
            var wa = digits.length === 10 ? '91' + digits : digits;
            var display = digits.length === 10
                ? '+91 ' + digits
                : '+' + digits;

            $contacts.append(
                $('<a>', {
                    href: 'https://wa.me/' + wa,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    class: 'btn-invite whatsapp',
                    html: '<i class="bi bi-whatsapp" aria-hidden="true"></i> ' + display
                })
            );
        });

        var calUrl = buildGoogleCalendarUrl(data);
        $('[data-bind="calendar"]').attr('href', calUrl);
    }

    function formatHeroDate(label) {
        if (!label) return 'AUGUST 14, 2026';
        return label
            .replace(/(\d+)(st|nd|rd|th)/i, '$1')
            .replace(/\s+/g, ' ')
            .trim()
            .toUpperCase();
    }

    function buildGoogleCalendarUrl(data) {
        // Local wall-clock format (YYYYMMDDTHHMMSS) + ctz keeps Muhurtham at 10:30 IST
        var startLocal = (data.dateIso || '2026-08-14T10:30:00').replace(/[-:]/g, '').slice(0, 15);
        var endDate = new Date((data.dateIso || '2026-08-14T10:30:00').replace('T', ' '));
        if (isNaN(endDate.getTime())) {
            endDate = new Date(2026, 7, 14, 10, 30, 0);
        }
        endDate = new Date(endDate.getTime() + 3 * 60 * 60 * 1000);
        var endLocal =
            endDate.getFullYear() +
            pad(endDate.getMonth() + 1) +
            pad(endDate.getDate()) +
            'T' +
            pad(endDate.getHours()) +
            pad(endDate.getMinutes()) +
            pad(endDate.getSeconds());

        var params = $.param({
            action: 'TEMPLATE',
            text: (data.groom || 'Prapul') + ' & ' + (data.bride || 'Sreeja') + ' — Engagement',
            dates: startLocal + '/' + endLocal,
            details: (data.inviteText || '') + '\n\nVenue: ' + (data.venue || '') + '\n' + (data.address || ''),
            location: (data.venue || '') + ', ' + (data.address || ''),
            ctz: 'Asia/Kolkata'
        });

        return 'https://calendar.google.com/calendar/render?' + params;
    }

    var countdownTimer = null;

    function initCountdown(dateIso) {
        if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
        }

        var target = new Date(dateIso).getTime();
        if (isNaN(target)) {
            target = new Date('2026-08-14T10:30:00').getTime();
        }

        function tick() {
            var distance = target - Date.now();

            if (distance < 0) {
                clearInterval(countdownTimer);
                $('#countdown').html(
                    '<div class="countdown-ended hover-lift">The celebration has begun!</div>'
                );
                return;
            }

            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            $('#days').text(pad(days));
            $('#hours').text(pad(hours));
            $('#minutes').text(pad(minutes));
            $('#seconds').text(pad(seconds));
        }

        tick();
        countdownTimer = setInterval(tick, 1000);
    }

    function pad(n) {
        return n < 10 ? '0' + n : String(n);
    }

    function initBootSequence() {
        var $body = $('body');
        var $header = $('.blessing-header');
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function unlockPage() {
            $body.removeClass('is-booting');
            initReveal();
        }

        if (reduceMotion) {
            $header.addClass('is-in');
            unlockPage();
            return;
        }

        // Header blessings first, then hero / rest of the page
        window.requestAnimationFrame(function () {
            $header.addClass('is-in');
        });

        window.setTimeout(unlockPage, 1200);
    }

    function initReveal() {
        function check() {
            var bottom = $(window).scrollTop() + $(window).height();
            $('.reveal').each(function () {
                var $el = $(this);
                if ($el.hasClass('visible')) return;
                if ($el.offset().top < bottom - 40) {
                    $el.addClass('visible');
                }
            });
        }

        $(window).on('scroll resize', check);
        check();
        setTimeout(check, 120);
    }

    function initHeroParallax() {
        var $hero = $('.hero');
        var $bg = $('.hero-bg');
        if (!$hero.length || !$bg.length) return;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        var ticking = false;
        var factor = 0.38;

        function update() {
            ticking = false;
            var rect = $hero[0].getBoundingClientRect();
            var viewH = window.innerHeight || 1;
            // Skip work once hero has fully left the viewport
            if (rect.bottom < 0 || rect.top > viewH) return;

            var offset = -rect.top * factor;
            $bg.css('transform', 'translate3d(0, ' + offset.toFixed(2) + 'px, 0)');
        }

        function onScroll() {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        }

        $(window).on('scroll resize', onScroll);
        update();
    }

    function initPetals() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        var gradients = [
            'linear-gradient(135deg, #a81c1c 0%, #601010 100%)',
            'linear-gradient(135deg, #d4af37 0%, #C5A059 100%)',
            'linear-gradient(135deg, #cc3333 0%, #8a1717 100%)'
        ];

        function createPetal() {
            var size = Math.random() * 10 + 11;
            var fallDuration = Math.random() * 4 + 4;
            var tumbleDuration = Math.random() * 2 + 2;
            var $petal = $('<div class="petal" aria-hidden="true"></div>').css({
                width: size + 'px',
                height: size + 'px',
                background: gradients[Math.floor(Math.random() * gradients.length)],
                left: Math.random() * 100 + 'vw',
                animationDuration: fallDuration + 's, ' + tumbleDuration + 's',
                transform: 'rotate(' + Math.random() * 360 + 'deg)'
            });

            $('body').append($petal);
            setTimeout(function () {
                $petal.remove();
            }, fallDuration * 1000 + 400);
        }

        var interval = setInterval(createPetal, 140);
        setTimeout(function () {
            clearInterval(interval);
        }, 4500);
    }
});
