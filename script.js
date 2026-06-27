/* Mohamed Alhaskir — portfolio interactions (minimal) */
(function () {
    "use strict";

    const sideLinks = Array.from(document.querySelectorAll(".side-link"));
    const byId = new Map(sideLinks.map((a) => [a.getAttribute("href").slice(1), a]));

    /* Active section highlighting */
    const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                sideLinks.forEach((a) => {
                    a.classList.remove("active");
                    a.removeAttribute("aria-current");
                });
                const a = byId.get(entry.target.id);
                if (a) { a.classList.add("active"); a.setAttribute("aria-current", "page"); }
            }
        });
    }, { rootMargin: "-30% 0px -60% 0px" });
    document.querySelectorAll("section[id]").forEach((s) => {
        if (byId.has(s.id)) spy.observe(s);
    });

    /* Subtle reveal on scroll */
    const targets = document.querySelectorAll(".block-title, .about-text, .lang-box, .entry, .skill-row, .pubs li, .contact-list, .contact-lede");
    targets.forEach((el) => el.classList.add("reveal"));
    const reveal = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) { entry.target.classList.add("visible"); obs.unobserve(entry.target); }
        });
    }, { threshold: 0.1 });
    targets.forEach((el) => reveal.observe(el));

    /* Footer year */
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();

    /* Back to top — the #top target is the sticky sidebar, which is always
       in view, so the browser's default anchor jump does nothing. Scroll
       the window explicitly instead. */
    document.querySelectorAll('a[href="#top"]').forEach((a) => {
        a.addEventListener("click", (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });

    /* Mobile nav toggle */
    const navToggle = document.querySelector(".nav-toggle");
    if (navToggle) {
        const closeNav = () => {
            document.body.classList.remove("nav-open");
            navToggle.setAttribute("aria-expanded", "false");
        };
        navToggle.addEventListener("click", () => {
            const open = document.body.classList.toggle("nav-open");
            navToggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
        // Close after tapping a nav link
        sideLinks.forEach((a) => a.addEventListener("click", closeNav));
        // Close on Escape
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && document.body.classList.contains("nav-open")) closeNav();
        });
    }

    /* ---- Publications from Google Scholar (publications.json) ---- */
    const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    const renderPubs = (data) => {
        const list = document.getElementById("pubs");
        const note = document.getElementById("pubsNote");
        const pubs = (data && data.publications) || [];
        if (!list || !pubs.length) return; // keep built-in fallback list

        list.innerHTML = pubs.map((p) => {
            const meta = [p.venue, p.year].filter(Boolean).join(" · ");
            const cited = p.citations > 0
                ? ` <span class="tag">Cited by ${p.citations}</span>` : "";
            const title = p.url
                ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)}</a>`
                : esc(p.title);
            return `<li>
                <p class="pub-title">${title}</p>
                <p class="pub-meta">${esc(meta)}${cited}</p>
            </li>`;
        }).join("");

        if (note) {
            const parts = [];
            if (data.profile_url) {
                parts.push(`<a href="${esc(data.profile_url)}" target="_blank" rel="noopener">View on Google Scholar ↗</a>`);
            }
            if (data.updated) parts.push(`Updated ${esc(data.updated)}`);
            note.innerHTML = parts.join(" · ");
        }
    };

    fetch("publications.json", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => { if (data) renderPubs(data); })
        .catch(() => {});
})();
