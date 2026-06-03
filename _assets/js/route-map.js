/* route-map.js — Barefoot Baltic interactive tour-route map (Mapbox GL JS).
 *
 * Reads stops + route options from a `<div data-route-map>` element on the
 * page (the data attribute is a JSON-encoded config). Lazy-loads Mapbox GL JS
 * and CSS only when the map scrolls into view.
 *
 * Layout: two-pane on desktop (stops list left, sticky map right), stacked
 * on mobile (map on top, horizontal chip strip + single detail panel below).
 * No customer-facing route toggle — defaultOption is the only one rendered.
 *
 * Page contract:
 *   <div class="route-map" data-route-map='{...config JSON...}'></div>
 *
 * Config:
 *   {
 *     token: "pk....",
 *     style: "mapbox://styles/mapbox/light-v11",
 *     stops: { id: { name, coords:[lon,lat], desc, img, time }, ... },
 *     options: { "1": ["id", ...], ... },
 *     defaultOption: "1"
 *   }
 */
(function () {
  'use strict';

  const MAPBOX_VERSION = '3.5.2';
  const MAPBOX_JS = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_VERSION}/mapbox-gl.js`;
  const MAPBOX_CSS = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_VERSION}/mapbox-gl.css`;

  const CARMINE = '#9e1b32';
  const MOBILE_QUERY = '(max-width: 900px)';

  function loadStylesheet(href) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`link[href="${href}"]`)) return resolve();
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (window.mapboxgl) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function escapeHTML(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function makeMarker(num) {
    const wrap = document.createElement('div');
    wrap.className = 'route-map-marker';
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('aria-label', `Stop ${num}`);
    wrap.tabIndex = 0;
    wrap.innerHTML = `
      <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
        <circle cx="24" cy="24" r="18" fill="${CARMINE}" stroke="white" stroke-width="3"/>
      </svg>
      <span class="route-map-marker-num">${num}</span>
    `;
    return wrap;
  }

  async function fetchRoute(token, coords) {
    const coordStr = coords.map(c => `${c[0]},${c[1]}`).join(';');
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}?geometries=geojson&overview=full&access_token=${token}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Directions API ${r.status}`);
    const data = await r.json();
    if (!data.routes || !data.routes.length) throw new Error('No route returned');
    return data.routes[0];
  }

  function distanceLabel(meters) {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  }

  function durationLabel(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    if (h && m) return `${h} h ${m} min`;
    if (h) return `${h} h`;
    return `${m} min`;
  }

  class TourRouteMap {
    constructor(container) {
      this.container = container;
      this.config = JSON.parse(container.dataset.routeMap);
      this.optionKey = this.config.defaultOption || Object.keys(this.config.options || {})[0];
      const fullSequence = (this.config.options || {})[this.optionKey] || [];
      this.fullSequence = fullSequence.slice();
      // Deduped stop order for markers/cards/chips (e.g. drop trailing pickup).
      const seen = new Set();
      this.stopOrder = [];
      fullSequence.forEach((id) => {
        if (seen.has(id)) return;
        if (!this.config.stops[id]) return;
        seen.add(id);
        this.stopOrder.push(id);
      });
      this.markers = new Map();    // stopId -> mapboxgl.Marker
      this.markerEls = new Map();  // stopId -> HTMLElement
      this.currentStop = null;
      this.initialized = false;

      this.buildShell();
      this.observeForLazyLoad();
    }

    buildShell() {
      const stops = this.stopOrder;

      const cardsHTML = stops.map((id, idx) => {
        const stop = this.config.stops[id];
        const num = idx + 1;
        const time = stop.time ? `<span class="route-map-stop-time">${escapeHTML(stop.time)}</span>` : '';
        const desc = stop.desc ? `<p class="route-map-stop-desc">${escapeHTML(stop.desc)}</p>` : '';
        const thumb = stop.img
          ? `<div class="route-map-stop-thumb"><img src="${escapeHTML(stop.img)}" alt="" loading="lazy" decoding="async"></div>`
          : '<div class="route-map-stop-thumb route-map-stop-thumb-empty" aria-hidden="true"></div>';
        return `
          <li class="route-map-stop" data-stop-id="${escapeHTML(id)}">
            <button type="button" class="route-map-stop-btn" aria-pressed="false">
              <span class="route-map-stop-num" aria-hidden="true">${num}</span>
              ${thumb}
              <div class="route-map-stop-info">
                ${time}
                <h3 class="route-map-stop-name">${escapeHTML(stop.name)}</h3>
                ${desc}
              </div>
            </button>
          </li>
        `;
      }).join('');

      this.container.innerHTML = `
        <div class="route-map-meta" aria-live="polite">
          <span class="route-map-meta-stops">— stops</span>
          <span class="route-map-meta-sep" aria-hidden="true">·</span>
          <span class="route-map-meta-distance">—</span>
          <span class="route-map-meta-sep" aria-hidden="true">·</span>
          <span class="route-map-meta-duration">—</span>
        </div>
        <div class="route-map-canvas-wrap">
          <div class="route-map-canvas" aria-label="Tour route map"></div>
          <div class="route-map-loading" role="status">Loading map…</div>
        </div>
        <ol class="route-map-stops" role="list">${cardsHTML}</ol>
      `;

      this.container.querySelectorAll('.route-map-stop-btn').forEach((btn) => {
        const stopId = btn.closest('[data-stop-id]').dataset.stopId;
        btn.addEventListener('click', () => this.selectStop(stopId, { from: 'card' }));
      });
    }

    observeForLazyLoad() {
      if (!('IntersectionObserver' in window)) return this.init();
      const obs = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) {
          obs.disconnect();
          this.init();
        }
      }, { rootMargin: '200px' });
      obs.observe(this.container);
    }

    async init() {
      if (this.initialized) return;
      this.initialized = true;
      try {
        await loadStylesheet(MAPBOX_CSS);
        await loadScript(MAPBOX_JS);

        window.mapboxgl.accessToken = this.config.token;
        const canvas = this.container.querySelector('.route-map-canvas');
        this.map = new window.mapboxgl.Map({
          container: canvas,
          style: this.config.style || 'mapbox://styles/mapbox/light-v11',
          attributionControl: { compact: true },
          cooperativeGestures: true,
        });
        this.map.addControl(new window.mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
        this.map.on('load', () => this.onMapLoad());
      } catch (err) {
        console.error('[route-map] init failed:', err);
        const loading = this.container.querySelector('.route-map-loading');
        if (loading) loading.textContent = 'Map could not load. Please refresh.';
      }
    }

    onMapLoad() {
      try {
        const layers = this.map.getStyle().layers;
        layers.forEach((l) => {
          if (l.id.includes('label-poi') || l.id.includes('symbol-poi')) {
            try { this.map.setLayoutProperty(l.id, 'visibility', 'none'); } catch (_) {}
          }
        });
      } catch (_) {}
      this.renderRoute();
    }

    isMobile() {
      return window.matchMedia(MOBILE_QUERY).matches;
    }

    fitAllStops(duration) {
      const bounds = new window.mapboxgl.LngLatBounds();
      this.stopOrder.forEach((id) => {
        const s = this.config.stops[id];
        if (s) bounds.extend(s.coords);
      });
      const mobile = this.isMobile();
      this.map.fitBounds(bounds, {
        padding: mobile
          ? { top: 40, bottom: 40, left: 30, right: 30 }
          : { top: 50, bottom: 50, left: 50, right: 50 },
        duration: duration == null ? 0 : duration,
      });
    }

    async renderRoute() {
      this.markers.forEach(m => m.remove());
      this.markers.clear();
      this.markerEls.clear();

      this.stopOrder.forEach((id, idx) => {
        const stop = this.config.stops[id];
        const num = idx + 1;
        const el = makeMarker(num);
        this.markerEls.set(id, el);
        const marker = new window.mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat(stop.coords)
          .addTo(this.map);
        this.markers.set(id, marker);
        const onSelect = () => this.selectStop(id, { from: 'pin' });
        el.addEventListener('click', onSelect);
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); }
        });
      });

      this.fitAllStops(0);

      const coords = this.fullSequence
        .map((id) => this.config.stops[id] && this.config.stops[id].coords)
        .filter(Boolean);

      try {
        const route = await fetchRoute(this.config.token, coords);
        const geojson = { type: 'Feature', properties: {}, geometry: route.geometry };

        if (this.map.getSource('route')) {
          if (this.map.getLayer('route-line')) this.map.removeLayer('route-line');
          if (this.map.getLayer('route-line-glow')) this.map.removeLayer('route-line-glow');
          this.map.removeSource('route');
        }

        this.map.addSource('route', { type: 'geojson', data: geojson });
        this.map.addLayer({
          id: 'route-line-glow',
          type: 'line',
          source: 'route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': CARMINE, 'line-width': 12, 'line-opacity': 0 },
        });
        this.map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': CARMINE, 'line-width': 4, 'line-opacity': 0 },
        });

        this.animateRouteDraw();

        const meta = this.container.querySelector('.route-map-meta');
        meta.querySelector('.route-map-meta-stops').textContent = `${this.stopOrder.length} stops`;
        meta.querySelector('.route-map-meta-distance').textContent = distanceLabel(route.distance);
        meta.querySelector('.route-map-meta-duration').textContent = durationLabel(route.duration);

        const loading = this.container.querySelector('.route-map-loading');
        if (loading) loading.style.display = 'none';
      } catch (err) {
        console.error('[route-map] route fetch failed:', err);
        const loading = this.container.querySelector('.route-map-loading');
        if (loading) loading.textContent = 'Route could not load. Markers shown.';
      }
    }

    animateRouteDraw() {
      const start = performance.now();
      const duration = 1500;
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      const supportsTrim = (() => {
        try {
          this.map.setPaintProperty('route-line', 'line-trim-offset', [0, 1]);
          return true;
        } catch (_) {
          return false;
        }
      })();

      if (!supportsTrim) {
        const step = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const e = ease(t);
          this.map.setPaintProperty('route-line', 'line-opacity', 0.95 * e);
          this.map.setPaintProperty('route-line-glow', 'line-opacity', 0.13 * e);
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        return;
      }

      try { this.map.setPaintProperty('route-line-glow', 'line-trim-offset', [0, 1]); } catch (_) {}
      this.map.setPaintProperty('route-line', 'line-opacity', 0.95);
      this.map.setPaintProperty('route-line-glow', 'line-opacity', 0.13);

      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const e = ease(t);
        const trim = Math.max(0, Math.min(1, 1 - e));
        try {
          this.map.setPaintProperty('route-line', 'line-trim-offset', [0, trim]);
          this.map.setPaintProperty('route-line-glow', 'line-trim-offset', [0, trim]);
        } catch (_) {}
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    selectStop(stopId, opts) {
      opts = opts || {};
      if (!this.config.stops[stopId]) return;
      const isToggleOff = this.currentStop === stopId && opts.from === 'card';
      this.currentStop = isToggleOff ? null : stopId;

      this.highlightCard(this.currentStop, opts.from);
      this.highlightMarker(this.currentStop);

      if (this.currentStop) {
        this.flyToStop(this.currentStop);
      } else {
        this.fitAllStops(700);
      }
    }

    highlightCard(stopId, from) {
      this.container.querySelectorAll('.route-map-stops [data-stop-id]').forEach((el) => {
        const active = el.dataset.stopId === stopId;
        el.classList.toggle('is-active', active);
        const btn = el.querySelector('.route-map-stop-btn');
        if (btn) btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        if (active && from !== 'card') {
          try {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          } catch (_) {}
        }
      });
    }

    highlightMarker(stopId) {
      this.markerEls.forEach((el, id) => {
        el.classList.toggle('is-active', id === stopId);
      });
    }

    flyToStop(stopId) {
      const stop = this.config.stops[stopId];
      if (!this.map || !stop) return;
      this.map.flyTo({
        center: stop.coords,
        zoom: Math.max(this.map.getZoom(), 11),
        padding: { top: 40, bottom: 40, left: 40, right: 40 },
        duration: 700,
        essential: true,
      });
    }
  }

  function initAll() {
    document.querySelectorAll('.route-map[data-route-map]').forEach((el) => {
      try { new TourRouteMap(el); } catch (err) { console.error('[route-map]', err); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
