/**
 * @module AnimationHandler
 * @description Handles animations for transitioning between scenes in the game
 */

/**
 * Animates the transition of a wrapper and stats element by sliding them horizontally.
 * @param {HTMLElement} wrapperEl - The wrapper element to animate.
 * @param {HTMLElement} statsEl - The stats element to animate.
 * @param {number} offsetX - The horizontal offset to apply during the animation.
 * @param {Function} onComplete - Callback function to execute when the animation completes.
 * @return {void}
 */
export function animateWrapperAndStats(
  wrapperEl,
  statsEl,
  offsetX,
  onComplete
) {
  const els = [wrapperEl, statsEl];
  els.forEach((el) => {
    el.style.transition = "transform 0.5s ease";
    el.style.transform = `translateX(${offsetX}px)`;
  });

  let done = 0;
  els.forEach((el) => {
    el.addEventListener(
      "transitionend",
      () => {
        done++;
        if (done === els.length) {
          onComplete();
          els.forEach((inner) => {
            inner.style.transition = "none";
            inner.style.transform = `translateX(${-offsetX}px)`;
            void inner.offsetWidth;
            inner.style.transition = "transform 0.5s ease";
            inner.style.transform = "translateX(0)";
          });
        }
      },
      { once: true }
    );
  });
}
