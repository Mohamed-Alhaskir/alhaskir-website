/* Mohamed Alhaskir — portfolio interactions (minimal) */
(function () {
    "use strict";

    const sideLinks = Array.from(document.querySelectorAll(".side-link"));
    const byId = new Map(sideLinks.map((a) => [a.getAttribute("href").slice(1), a]));

    /* Active section highlighting */
    const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                sideLinks.forEach((a) => a.classList.remove("active"));
                const a = byId.get(entry.target.id);
                if (a) a.classList.add("active");
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

    /* ---- Publications from Google Scholar (publications.json) ---- */
    const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    /* Fisher–Yates shuffle (returns a new array) */
    const shuffled = (arr) => {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    /* Randomize the order of an existing list's <li> children in place */
    const shuffleListItems = (el) => {
        if (!el) return;
        shuffled(Array.from(el.children)).forEach((li) => el.appendChild(li));
    };

    const renderPubs = (data) => {
        const list = document.getElementById("pubs");
        const note = document.getElementById("pubsNote");
        const pubs = shuffled((data && data.publications) || []);
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
        .then((data) => {
            if (data) renderPubs(data);                       // JSON list (shuffled in renderPubs)
            else shuffleListItems(document.getElementById("pubs")); // shuffle fallback list
        })
        .catch(() => shuffleListItems(document.getElementById("pubs")));
})();
