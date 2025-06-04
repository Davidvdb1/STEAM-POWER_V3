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
