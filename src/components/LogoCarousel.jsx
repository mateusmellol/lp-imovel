import { useEffect, useRef } from "react";

const logos = [
  "https://framerusercontent.com/images/yW392aWUt582OvHygp3RN9IgWtc.png",
  "https://framerusercontent.com/images/1dptRczE8tHiCHKaGoQuUtASY.png",
  "https://framerusercontent.com/images/cdvdrm9hg78OiKxrpZSG5z9VGQ.png",
  "https://framerusercontent.com/images/QHN01j87suJ1VmDmnnao6LnEyc.png",
  "https://framerusercontent.com/images/Gc443yVu5g0rw3XqhDfyt2sxSY.png",
  "https://framerusercontent.com/images/iotIlkJDIrJ2eUxRyk60H5kJ6D4.png",
  "https://framerusercontent.com/images/IL0UndmM0Spaaw43AkuBV4rFhS0.png",
  "https://framerusercontent.com/images/n09deA9kNWNCBuNNYkbOlJmgA.png",
  "https://framerusercontent.com/images/ZW9GQY41nnFJWfbRjshvvhm0Vk.png",
  "https://framerusercontent.com/images/9YNoUTmWTr7Gs1qfU8v6V07K3Y.png",
];

const WHITE_LOGO_FILTER = "brightness(0) invert(1)";
const SCROLL_SPEED = 48;

function trimTransparentPadding(image) {
  const source = document.createElement("canvas");
  source.width = image.naturalWidth;
  source.height = image.naturalHeight;
  const sourceContext = source.getContext("2d", { willReadFrequently: true });
  sourceContext.drawImage(image, 0, 0);
  const { data, width, height } = sourceContext.getImageData(0, 0, source.width, source.height);
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] < 8) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }

  return right < left
    ? { image, width, height }
    : { image, sx: left, sy: top, width: right - left + 1, height: bottom - top + 1 };
}

export default function LogoCarousel() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return undefined;

    const state = {
      images: [], offset: 0, velocity: SCROLL_SPEED, targetVelocity: SCROLL_SPEED, dragging: false,
      paused: false, visible: true, lastX: 0, lastTime: 0, frame: 0,
      width: 0, height: 0, pixelRatio: 1,
    };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) state.targetVelocity = 0;

    Promise.all(logos.map((src) => new Promise((resolve) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(trimTransparentPadding(image));
      image.onerror = () => resolve(null);
      image.src = src;
    }))).then((images) => { state.images = images.filter(Boolean); });

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      state.width = bounds.width;
      state.height = bounds.height;
      state.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(bounds.width * state.pixelRatio);
      canvas.height = Math.round(bounds.height * state.pixelRatio);
    };

    const render = (time) => {
      const elapsed = state.lastTime ? Math.min((time - state.lastTime) / 1000, 0.05) : 0;
      state.lastTime = time;
      state.velocity += (state.targetVelocity - state.velocity) * Math.min(elapsed * 8, 1);
      if (!reduceMotion && !state.paused && !state.dragging) state.offset += state.velocity * elapsed;
      ctx.setTransform(state.pixelRatio, 0, 0, state.pixelRatio, 0, 0);
      ctx.clearRect(0, 0, state.width, state.height);

      if (state.images.length && state.width) {
        const mobile = state.width < 810;
        const maxHeight = mobile ? 20 : 28;
        const gap = mobile ? 132 : 120;
        const center = state.width / 2;
        const entries = state.images.map((logo) => ({
          ...logo,
          drawWidth: (logo.width / logo.height) * maxHeight,
        }));
        const loopWidth = entries.reduce((total, entry) => total + entry.drawWidth + gap, 0);
        const normalizedOffset = ((state.offset % loopWidth) + loopWidth) % loopWidth;
        let x = -normalizedOffset - loopWidth;

        while (x < state.width + loopWidth) {
          entries.forEach(({ image, sx = 0, sy = 0, width, height, drawWidth }) => {
            const imageCenter = x + drawWidth / 2;
            const distance = Math.min(Math.abs(imageCenter - center) / (state.width / 2), 1);
            const scale = 1 - 0.48 * distance;
            const blur = distance > 0.42 ? (distance - 0.42) * 1.6 : 0;
            const scaledWidth = drawWidth * scale;
            const drawHeight = maxHeight * scale;
            ctx.save();
            ctx.globalAlpha = 1 - distance * 0.5;
            ctx.filter = `${WHITE_LOGO_FILTER} blur(${blur.toFixed(2)}px)`;
            ctx.drawImage(image, sx, sy, width, height, imageCenter - scaledWidth / 2, (state.height - drawHeight) / 2, scaledWidth, drawHeight);
            ctx.restore();
            x += drawWidth + gap;
          });
        }
      }
      if (state.visible) state.frame = requestAnimationFrame(render);
    };

    const setHover = (paused) => {
      state.paused = paused;
      state.targetVelocity = paused || reduceMotion ? 0 : SCROLL_SPEED;
    };
    const onPointerDown = (event) => {
      state.dragging = true; state.lastX = event.clientX; state.targetVelocity = 0;
      canvas.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event) => {
      if (!state.dragging) return;
      state.offset -= event.clientX - state.lastX;
      state.lastX = event.clientX;
    };
    const onPointerUp = (event) => {
      if (!state.dragging) return;
      state.dragging = false; state.targetVelocity = state.paused || reduceMotion ? 0 : SCROLL_SPEED;
      canvas.releasePointerCapture(event.pointerId);
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      state.visible = entry.isIntersecting;
      if (state.visible && !state.frame) state.frame = requestAnimationFrame(render);
      if (!state.visible) { cancelAnimationFrame(state.frame); state.frame = 0; }
    });
    resize();
    state.frame = requestAnimationFrame(render);
    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    const onPointerEnter = () => setHover(true);
    const onPointerLeave = () => setHover(false);
    canvas.addEventListener("pointerenter", onPointerEnter);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    return () => {
      cancelAnimationFrame(state.frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointerenter", onPointerEnter);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return <div className="logo-carousel" role="img" aria-label="Administradoras parceiras"><canvas ref={canvasRef} aria-hidden="true" /></div>;
}
