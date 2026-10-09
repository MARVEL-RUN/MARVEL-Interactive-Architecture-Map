"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import styles from "./wire.module.css";

export type MapFocus = { x: number; y: number; key: string | number };

type Props = {
  children: ReactNode;
  label?: string;
  initialScale?: number;
  /** Changing this re-centres the map (e.g. when switching repo or tab). */
  resetKey?: string;
  /** Changing `focus.key` glides the camera so (x, y) sits in the visible centre. */
  focus?: MapFocus | null;
  /** Width covered by a panel on the right, so focus centres in the free area. */
  rightInset?: number;
  /**
   * Centre the content in the free area instead of anchoring top-left.
   * w/h are the fractions of the content (around its centre) that must fit on screen.
   */
  center?: FitBox;
};

type FitBox = { w: number; h: number };

type Transform = { x: number; y: number; scale: number };

const MIN_SCALE = 0.3;
const MAX_SCALE = 2.4;
/** Leaves room for the floating story panel on wide screens. */
const PANEL_GUTTER = 300;
const DRAG_THRESHOLD = 4;
/** Space kept clear for the zoom/reset bar at the bottom. */
const HINT_GUTTER = 56;

function isWide(el: HTMLElement | null) {
  return (el?.clientWidth ?? 1200) > 900;
}

function startTransform(
  surface: HTMLElement | null,
  content: HTMLElement | null,
  maxScale: number,
  center: FitBox | null,
): Transform {
  const vw = surface?.clientWidth ?? 1200;
  const vh = surface?.clientHeight ?? 800;
  const wide = isWide(surface);
  const top = wide ? 16 : 260;
  const ch = content?.offsetHeight || vh;
  if (center) {
    const left = wide ? PANEL_GUTTER : 0;
    const cw = content?.offsetWidth || vw;
    const freeW = vw - left - 16;
    const freeH = vh - top - HINT_GUTTER;
    const scale = Math.min(
      maxScale,
      Math.max(0.5, Math.min(freeW / (cw * center.w), freeH / (ch * center.h))),
    );
    return {
      x: left + (freeW - cw * scale) / 2,
      y: top + (freeH - ch * scale) / 2,
      scale,
    };
  }
  const fit = (vh - top - 16) / ch;
  const scale = Math.min(maxScale, Math.max(0.8, fit));
  return { x: wide ? PANEL_GUTTER : 16, y: top, scale };
}

export function PannableMap({
  children,
  label = "드래그 · 휠로 지도 탐색",
  initialScale = 1,
  resetKey,
  focus,
  rightInset = 0,
  center,
}: Props) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>({
    x: PANEL_GUTTER,
    y: 16,
    scale: initialScale,
  });
  const [gliding, setGliding] = useState(false);
  const drag = useRef<{
    px: number;
    py: number;
    x: number;
    y: number;
    moved: boolean;
    id: number;
  } | null>(null);
  const suppressClick = useRef(false);

  const reset = useCallback(() => {
    setGliding(false);
    setTransform(
      startTransform(surfaceRef.current, contentRef.current, initialScale, center ?? null),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fit box is compared by value
  }, [initialScale, center?.w, center?.h]);

  useEffect(() => {
    reset();
  }, [reset, resetKey]);

  useEffect(() => {
    if (!focus) return;
    const el = surfaceRef.current;
    if (!el) return;
    const wide = isWide(el);
    const left = wide ? PANEL_GUTTER : 0;
    const right = wide ? rightInset : 0;
    const cx = left + (el.clientWidth - left - right) / 2;
    const cy = el.clientHeight / 2;
    setGliding(true);
    setTransform((t) => ({ ...t, x: cx - focus.x * t.scale, y: cy - focus.y * t.scale }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the focus target changes
  }, [focus?.key]);

  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setGliding(false);
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      setTransform((t) => {
        const factor = Math.exp(-e.deltaY * 0.0015);
        const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.scale * factor));
        const k = scale / t.scale;
        return { scale, x: cx - (cx - t.x) * k, y: cy - (cy - t.y) * k };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    suppressClick.current = false;
    drag.current = {
      px: e.clientX,
      py: e.clientY,
      x: transform.x,
      y: transform.y,
      moved: false,
      id: e.pointerId,
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      d.moved = true;
      setGliding(false);
      e.currentTarget.setPointerCapture(d.id);
    }
    setTransform((t) => ({ ...t, x: d.x + dx, y: d.y + dy }));
  };

  const onPointerUp = () => {
    if (drag.current?.moved) suppressClick.current = true;
    drag.current = null;
  };

  const onClickCapture = (e: MouseEvent) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div className={styles.mapViewport}>
      <div
        ref={surfaceRef}
        className={styles.mapSurface}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        role="application"
        aria-label="탐색 가능한 아키텍처 지도"
      >
        <div
          ref={contentRef}
          className={`${styles.mapTransform} ${gliding ? styles.mapGlide : ""}`}
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          }}
        >
          {children}
        </div>
      </div>
      <div className={styles.mapHint}>
        <span>{label}</span>
        <span className={styles.mapZoom}>{Math.round(transform.scale * 100)}%</span>
        <button type="button" onClick={reset}>
          초기화
        </button>
      </div>
    </div>
  );
}
