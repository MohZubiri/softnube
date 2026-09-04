(() => {
    const root = document.documentElement;
    const isArabic = root.lang === 'ar';
    const whatsappNumber = '967782558484';
    const message = isArabic
        ? 'مرحبًا، أرغب في حجز عرض توضيحي لنظام ProDentic.\n\nعدد الأطباء: \nأهم جزء أريد تنظيمه: '
        : 'Hello, I would like to book a ProDentic demo.\n\nNumber of dentists: \nThe workflow I want to improve first: ';
    const makeWhatsAppUrl = (text) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    const whatsappUrl = makeWhatsAppUrl(message);

    document.querySelectorAll('.js-whatsapp').forEach((link) => {
        link.href = whatsappUrl;
    });

    const menuButton = document.querySelector('.menu-toggle');
    const nav = document.getElementById('main-nav');
    const closeMenu = () => {
        if (!menuButton || !nav) return;
        nav.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', isArabic ? 'فتح قائمة التنقل' : 'Open navigation menu');
        document.body.classList.remove('menu-open');
    };

    if (menuButton && nav) {
        menuButton.addEventListener('click', () => {
            const willOpen = !nav.classList.contains('is-open');
            nav.classList.toggle('is-open', willOpen);
            menuButton.setAttribute('aria-expanded', String(willOpen));
            menuButton.setAttribute('aria-label', willOpen
                ? (isArabic ? 'إغلاق قائمة التنقل' : 'Close navigation menu')
                : (isArabic ? 'فتح قائمة التنقل' : 'Open navigation menu'));
            document.body.classList.toggle('menu-open', willOpen);
        });
        nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
        document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
    }

    const tourImage = document.getElementById('tour-image');
    const tourTitle = document.getElementById('tour-title');
    const tourCaption = document.getElementById('tour-caption');
    document.querySelectorAll('.tour-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            if (!tourImage || tab.getAttribute('aria-selected') === 'true') return;
            document.querySelectorAll('.tour-tab').forEach((item) => item.setAttribute('aria-selected', 'false'));
            tab.setAttribute('aria-selected', 'true');
            tourImage.classList.add('is-switching');
            const preload = new Image();
            preload.onload = () => {
                tourImage.src = tab.dataset.src;
                tourImage.alt = tab.dataset.alt || tab.textContent.trim();
                if (tourTitle) tourTitle.textContent = tab.dataset.title || tab.textContent.trim();
                if (tourCaption) tourCaption.textContent = tab.dataset.caption || '';
                requestAnimationFrame(() => tourImage.classList.remove('is-switching'));
            };
            preload.onerror = () => tourImage.classList.remove('is-switching');
            preload.src = tab.dataset.src;
        });
    });

    const leadForm = document.getElementById('lead-form');
    const clinicName = document.getElementById('clinic-name');
    const dentistCount = document.getElementById('dentist-count');
    const roomCount = document.getElementById('room-count');
    const selectedPlan = document.getElementById('selected-plan');
    const priority = document.getElementById('priority');
    const formNote = document.getElementById('form-note');
    const planButtons = document.querySelectorAll('.plan-select');

    const syncPlanButtons = () => {
        planButtons.forEach((button) => {
            const selected = selectedPlan && button.dataset.plan === selectedPlan.value;
            button.classList.toggle('is-selected', Boolean(selected));
            button.setAttribute('aria-pressed', String(Boolean(selected)));
        });
    };

    planButtons.forEach((button) => {
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => {
            if (!selectedPlan) return;
            selectedPlan.value = button.dataset.plan || '';
            syncPlanButtons();
            document.getElementById('contact-guide')?.scrollIntoView({
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                block: 'center'
            });
            window.setTimeout(() => clinicName?.focus({ preventScroll: true }), 450);
        });
    });
    selectedPlan?.addEventListener('change', syncPlanButtons);

    leadForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!leadForm.reportValidity()) return;

        const preparedMessage = isArabic
            ? [
                'مرحبًا، أرغب في حجز عرض توضيحي لنظام ProDentic.',
                '',
                `اسم العيادة: ${clinicName.value.trim()}`,
                `عدد الأطباء: ${dentistCount.value}`,
                `عدد غرف العيادة: ${roomCount.value}`,
                `الباقة المطلوبة: ${selectedPlan.value}`,
                `أول جزء أريد تنظيمه: ${priority.value}`
            ].join('\n')
            : [
                'Hello, I would like to book a ProDentic demo.',
                '',
                `Clinic name: ${clinicName.value.trim()}`,
                `Number of dentists: ${dentistCount.value}`,
                `Number of clinic rooms: ${roomCount.value}`,
                `Preferred plan: ${selectedPlan.value}`,
                `First workflow to improve: ${priority.value}`
            ].join('\n');

        if (formNote) {
            formNote.textContent = isArabic
                ? 'تم تجهيز الرسالة. يمكنك مراجعتها في واتساب قبل الإرسال.'
                : 'Your message is ready. You can review it in WhatsApp before sending.';
        }
        window.open(makeWhatsAppUrl(preparedMessage), '_blank', 'noopener,noreferrer');
    });

    const imageDialog = document.getElementById('image-dialog');
    const dialogImage = document.getElementById('dialog-image');
    const dialogTitle = document.getElementById('dialog-title');
    const dialogClose = document.querySelector('.dialog-close');
    const zoomTargets = document.querySelectorAll('.visual-card img, .screen-frame img, .tour-stage > img');

    const openImage = (target) => {
        const source = target.currentSrc || target.src;
        if (!imageDialog || !dialogImage || typeof imageDialog.showModal !== 'function') {
            window.open(source, '_blank', 'noopener,noreferrer');
            return;
        }
        dialogImage.src = source;
        dialogImage.alt = target.alt || '';
        if (dialogTitle) dialogTitle.textContent = target.alt || (isArabic ? 'عرض الصورة بالحجم الكامل' : 'Full-size screenshot');
        imageDialog.showModal();
    };

    zoomTargets.forEach((target) => {
        target.classList.add('zoom-ready');
        target.tabIndex = 0;
        target.setAttribute('role', 'button');
        target.setAttribute('aria-label', isArabic ? `تكبير الصورة: ${target.alt}` : `Enlarge screenshot: ${target.alt}`);
        target.addEventListener('click', () => openImage(target));
        target.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openImage(target);
            }
        });
    });
    dialogClose?.addEventListener('click', () => imageDialog?.close());
    imageDialog?.addEventListener('click', (event) => {
        if (event.target === imageDialog) imageDialog.close();
    });

    const revealItems = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: .1, rootMargin: '0px 0px -40px' });
        revealItems.forEach((item) => observer.observe(item));
    } else {
        revealItems.forEach((item) => item.classList.add('is-visible'));
    }

    const mobileCta = document.querySelector('.mobile-whatsapp');
    const heroActions = document.querySelector('.hero-actions');
    if (mobileCta && heroActions && 'IntersectionObserver' in window) {
        let heroActionsVisible = true;
        let formVisible = false;
        const updateMobileCta = () => {
            mobileCta.classList.toggle('is-active', !heroActionsVisible && !formVisible);
        };
        const ctaObserver = new IntersectionObserver(([entry]) => {
            heroActionsVisible = entry.isIntersecting;
            updateMobileCta();
        }, { threshold: .05 });
        ctaObserver.observe(heroActions);

        const contactGuide = document.getElementById('contact-guide');
        if (contactGuide) {
            const formObserver = new IntersectionObserver(([entry]) => {
                formVisible = entry.isIntersecting;
                updateMobileCta();
            }, { threshold: .08 });
            formObserver.observe(contactGuide);
        }
    }

    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
})();
