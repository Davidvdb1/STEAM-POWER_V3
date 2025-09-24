//#region IMPORTS
import {componentBase} from "../../abstracts/componentBase.js";
import {define} from "../../abstracts/functionalBase.js";
import {getStyle, getTemplate} from "../../coreUtils/style.js";
//#endregion IMPORTS

//#region TEMPLATE
const template = await getTemplate("/components/carousel/carousel.html");
//#endregion TEMPLATE

//#region CLASS
define('carousel-χ', class extends componentBase {

    /** @type {HTMLElement[]} */
    slides = [];
    /** @type {HTMLElement[]} */
    dots = [];

    currentIndex = 0;
    isAnimating = false;

    touchStartX = 0;
    touchEndX = 0;

    async created() {
        // Shadow CSS
        this.shadow.appendChild(await getStyle('/components/carousel/carousel.css'));


        // Elements
        this.$slot = this.find('slot[part="slides"]');


        // Touch swipe
        this.shadow.host.addEventListener("touchstart", (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.shadow.host.addEventListener("touchend", (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });

        // React to slot content changes
        this.$slot.addEventListener("slotchange", () => this._syncSlides());

        // Initial sync & render
        this._syncSlides();
    }

    /** Collect slotted elements, decorate, wire, and build dots */
    _syncSlides() {
        const assigned = this.$slot.assignedElements({ flatten: true }).filter(n => n.nodeType === 1);

        // Clean old listeners if we re-sync
        if (this._slideClick) {
            this.slides?.forEach(el => el.removeEventListener('click', this._slideClick));
        }

        // Mark all as slides and add click behavior
        this._slideClick = (e) => {
            const el = /** @type {HTMLElement} */ (e.currentTarget);
            const idx = assigned.indexOf(el);
            if (idx >= 0) this.updateCarousel(idx);
        };

        assigned.forEach((el, i) => {
            el.classList.add('slide');
            el.setAttribute('data-index', String(i));
            el.addEventListener('click', this._slideClick);
            // Give hints for smoother transforms
            el.style.willChange = 'transform, opacity, filter';
        });

        this.slides = assigned;

        // Rebuild dots
        this.$dotsHost.innerHTML = '';
        this.dots = this.slides.map((_, i) => {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.dataset.index = String(i);
            dot.addEventListener('click', () => this.updateCarousel(i));
            this.$dotsHost.appendChild(dot);
            return dot;
        });

        // Clamp index if needed
        if (this.currentIndex >= this.slides.length) this.currentIndex = 0;

        // Render
        this.updateCarousel(this.currentIndex);
    }

    prev(n){
        this.updateCarousel(this.currentIndex - n);
    }
    next(n){
        this.updateCarousel(this.currentIndex + n);
    }

    updateCarousel(newIndex) {
        if (this.isAnimating || !this.slides.length) return;

        this.isAnimating = true;

        const total = this.slides.length;
        this.currentIndex = ((newIndex % total) + total) % total;

        const visibleSide = Math.min(2, Math.max(0, total - 1));

        this.slides.forEach((slide, i) => {
            const offset = (i - this.currentIndex + total) % total;

            slide.classList.remove("center","left-1","left-2","right-1","right-2","hidden");

            if (offset === 0) {
                slide.classList.add("center");
                this.setAttribute('slide-index', String(i));
            } else if (offset <= visibleSide) {
                slide.classList.add(`right-${offset}`);
            } else if (offset >= total - visibleSide) {
                slide.classList.add(`left-${total - offset}`);
            } else {
                slide.classList.add("hidden");
            }
        });

        // Dots
        this.dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === this.currentIndex);
        });

        // Unlock after animation
        setTimeout(() => { this.isAnimating = false; }, 800);
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) this.updateCarousel(this.currentIndex + 1);
            else this.updateCarousel(this.currentIndex - 1);
        }
    }

}, template);
//#endregion CLASS