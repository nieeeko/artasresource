(function () {
	'use strict';

	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* Mobile menu: close on link click */
	var navToggle = document.getElementById('nav-toggle');
	document.querySelectorAll('#top-menu a').forEach(function (link) {
		link.addEventListener('click', function () {
			if (navToggle) navToggle.checked = false;
		});
	});

	/* Sticky nav shadow on scroll */
	var navBar = document.querySelector('.navigation-top');
	function updateNavShadow() {
		if (!navBar) return;
		if (window.scrollY > 20) navBar.classList.add('is-scrolled');
		else navBar.classList.remove('is-scrolled');
	}
	updateNavShadow();
	window.addEventListener('scroll', updateNavShadow, { passive: true });

	/* Scroll reveal */
	var revealTargets = document.querySelectorAll('.panel-content, .page-content, .services-grid, .trust-bar');
	revealTargets.forEach(function (el) { el.classList.add('reveal'); });

	if (reduceMotion || !('IntersectionObserver' in window)) {
		revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
	} else {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					io.unobserve(entry.target);
				}
			});
		}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
		revealTargets.forEach(function (el) { io.observe(el); });
	}

	/* Floating buttons: back-to-top + contact */
	var floatWrap = document.createElement('div');
	floatWrap.className = 'floating-buttons';

	var isContactPage = /contact\.html$/.test(location.pathname) || location.hash === '#contact';
	if (!isContactPage) {
		var contactHref = document.querySelector('#top-menu a[href$="contact.html"]');
		var fabContact = document.createElement('a');
		fabContact.href = contactHref ? contactHref.getAttribute('href') : 'contact.html';
		fabContact.className = 'fab fab-contact';
		fabContact.setAttribute('aria-label', 'Contact');
		fabContact.title = 'Contact';
		fabContact.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4h16v13H7l-3 3V4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
		floatWrap.appendChild(fabContact);
	}

	var fabTop = document.createElement('button');
	fabTop.type = 'button';
	fabTop.className = 'fab fab-top';
	fabTop.setAttribute('aria-label', 'Back to top');
	fabTop.title = 'Back to top';
	fabTop.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
	fabTop.addEventListener('click', function () {
		window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
	});
	floatWrap.appendChild(fabTop);
	document.body.appendChild(floatWrap);

	window.addEventListener('scroll', function () {
		if (window.scrollY > 500) fabTop.classList.add('is-visible');
		else fabTop.classList.remove('is-visible');
	}, { passive: true });

	/* FAQ accordion */
	document.querySelectorAll('.faq-question').forEach(function (btn) {
		var item = btn.closest('.faq-item');
		var answer = item.querySelector('.faq-answer');
		btn.setAttribute('aria-expanded', 'false');
		btn.addEventListener('click', function () {
			var isOpen = item.classList.contains('is-open');
			item.parentElement.querySelectorAll('.faq-item.is-open').forEach(function (open) {
				if (open !== item) {
					open.classList.remove('is-open');
					open.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
					open.querySelector('.faq-answer').style.maxHeight = null;
				}
			});
			if (isOpen) {
				item.classList.remove('is-open');
				btn.setAttribute('aria-expanded', 'false');
				answer.style.maxHeight = null;
			} else {
				item.classList.add('is-open');
				btn.setAttribute('aria-expanded', 'true');
				answer.style.maxHeight = answer.scrollHeight + 'px';
			}
		});
	});

	/* Lightbox for content images */
	var gallerySelector = '.gallery-grid img, .event-gallery img, .event-image img, .event-poster img, .page-content .aligncenter img, .page-content .alignleft img, .page-content .alignright img, .panel-content .portrait img';
	var galleryImages = Array.prototype.slice.call(document.querySelectorAll(gallerySelector));

	if (galleryImages.length) {
		var overlay = document.createElement('div');
		overlay.className = 'lightbox-overlay';
		overlay.setAttribute('role', 'dialog');
		overlay.setAttribute('aria-modal', 'true');
		overlay.innerHTML =
			'<button type="button" class="lightbox-close" aria-label="Close">&times;</button>' +
			'<button type="button" class="lightbox-prev" aria-label="Previous image">&#8249;</button>' +
			'<img alt="">' +
			'<button type="button" class="lightbox-next" aria-label="Next image">&#8250;</button>';
		document.body.appendChild(overlay);

		var lbImg = overlay.querySelector('img');
		var lbClose = overlay.querySelector('.lightbox-close');
		var lbPrev = overlay.querySelector('.lightbox-prev');
		var lbNext = overlay.querySelector('.lightbox-next');
		var currentIndex = 0;

		function openLightbox(index) {
			currentIndex = index;
			var img = galleryImages[currentIndex];
			lbImg.src = img.currentSrc || img.src;
			lbImg.alt = img.alt || '';
			overlay.classList.add('is-open');
			document.body.style.overflow = 'hidden';
		}

		function closeLightbox() {
			overlay.classList.remove('is-open');
			document.body.style.overflow = '';
		}

		function showRelative(step) {
			currentIndex = (currentIndex + step + galleryImages.length) % galleryImages.length;
			var img = galleryImages[currentIndex];
			lbImg.src = img.currentSrc || img.src;
			lbImg.alt = img.alt || '';
		}

		galleryImages.forEach(function (img, index) {
			img.addEventListener('click', function () { openLightbox(index); });
		});

		lbClose.addEventListener('click', closeLightbox);
		lbPrev.addEventListener('click', function () { showRelative(-1); });
		lbNext.addEventListener('click', function () { showRelative(1); });
		overlay.addEventListener('click', function (e) { if (e.target === overlay) closeLightbox(); });
		document.addEventListener('keydown', function (e) {
			if (!overlay.classList.contains('is-open')) return;
			if (e.key === 'Escape') closeLightbox();
			if (e.key === 'ArrowLeft') showRelative(-1);
			if (e.key === 'ArrowRight') showRelative(1);
		});
	}
})();
