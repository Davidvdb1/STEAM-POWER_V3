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

/**
 * Slide from the city scene into the outer city scene.
 */
export function goToOuterCity({
  wrapperEl,
  statsEl,
  detailContainer,
  game,
  innerContainer,
  outerContainer,
}) {
  detailContainer.classList.add("hidden");
  detailContainer.innerHTML = "";

  const distance = wrapperEl.offsetWidth + 800;

  animateWrapperAndStats(wrapperEl, statsEl, -distance, () => {
    game.scene.switch("CityScene", "OuterCityScene");
    outerContainer.style.display = "none";
    innerContainer.style.display = "flex";
  });
}

/**
 * Slide from the outer city scene back into the main city scene.
 */
export function goToInnerCity({
  wrapperEl,
  statsEl,
  detailContainer,
  game,
  innerContainer,
  outerContainer,
}) {
  detailContainer.classList.add("hidden");
  detailContainer.innerHTML = "";

  const distance = wrapperEl.offsetWidth + 800;

  animateWrapperAndStats(wrapperEl, statsEl, distance, () => {
    game.scene.switch("OuterCityScene", "CityScene");
    innerContainer.style.display = "none";
    outerContainer.style.display = "flex";
  });
}
