"use client";

import { useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from "react";
import * as THREE from "three";
import {
  chapterProgress,
  chapterVisibility,
  clamp01,
  damp,
  smoothstep,
  type Chapter,
} from "@/lib/scroll";
import { useTheme } from "@/components/theme/useTheme";

/**
 * Chapter world.
 *
 * The backdrop is a sequence of set pieces — chapters — each tied to a run of
 * page sections, crossfading as the content changes:
 *
 *   chart    the sales curve climbing away from a flat baseline
 *   engines  Swiggy and Zomato engines streaming orders onto a stack of coins
 *   menu     a carousel of service cards that turns as you scroll
 *   bars     revenue bars rising, with a growth arrow over them
 *   orbit    the brand mark with the food and service imagery circling it
 *
 * Why chapters instead of one camera flight:
 *
 *  - The camera never moves. Everything is composed inside a fixed "stage box"
 *    that is fitted to the free space beside the copy and kept clear of the
 *    header, so no element can drift off-screen or get cut at the top edge.
 *  - Nothing trails the scroll. Positions come straight from the Lenis-smoothed
 *    scroll; the only extra easing is a 0.1s damp on each chapter's presence
 *    to soften the crossfade at a seam.
 *  - Variety. Five distinct compositions instead of one line seen from five
 *    angles.
 */

const SWIGGY = "#FC8019";
const ZOMATO = "#E23744";
const GOLD = "#E0A82E";
const GOLD_HI = "#F7D045";
const CREAM = "#FFF9DF";
const INK = "#17120d";

/**
 * The scene is authored for a dark ground. On paper two things break: additive
 * blending makes every glow invisible (adding light to white does nothing), and
 * a near-black panel becomes a hole punched in the page. So each theme carries
 * its own small palette, and the glows switch to normal blending with their
 * opacity scaled up to compensate.
 *
 * What does not change: the food renders, the coins, the bars and the two
 * platform colours all read correctly on either ground.
 */
type StagePalette = {
  bg: string;
  line: string;
  glow: string;
  grid: string;
  gridStrong: number;
  gridSoft: number;
  panel: string;
  panelOpacity: number;
  blending: THREE.Blending;
  glowScale: number;
  mote: string;
  moteOpacity: number;
  barLow: string;
  barHigh: string;
  /** The travelling highlight on the growth curve. */
  sweep: string;
  /** Emissive reads as a glow on black and as washed-out haze on paper. */
  emissiveScale: number;
  areaAlpha: number;
};

const PALETTES: Record<"dark" | "light", StagePalette> = {
  dark: {
    bg: "#0a0806",
    line: GOLD_HI,
    glow: GOLD,
    grid: CREAM,
    gridStrong: 0.28,
    gridSoft: 0.1,
    panel: INK,
    panelOpacity: 0.62,
    blending: THREE.AdditiveBlending,
    glowScale: 1,
    mote: GOLD,
    moteOpacity: 0.35,
    barLow: "#4a3410",
    barHigh: GOLD,
    sweep: CREAM,
    emissiveScale: 1,
    areaAlpha: 0.34,
  },
  light: {
    bg: "#fdfaf2",
    line: "#8a5a10",
    glow: "#a8761a",
    grid: "#2a2118",
    gridStrong: 0.18,
    gridSoft: 0.07,
    panel: "#ffffff",
    panelOpacity: 0.55,
    blending: THREE.NormalBlending,
    glowScale: 1.6,
    mote: "#6f4a0e",
    moteOpacity: 0.3,
    barLow: "#7a5518",
    barHigh: "#b07414",
    // On paper a pale highlight vanishes, so the pulse runs brighter than the
    // line instead of lighter than the ground.
    sweep: GOLD,
    emissiveScale: 0.35,
    areaAlpha: 0.5,
  },
};

const PaletteCtx = createContext<StagePalette>(PALETTES.dark);
const usePalette = () => useContext(PaletteCtx);


const ASSETS = {
  bag: "/icons3d/food-bag.webp",
  menu: "/icons3d/menu-board.webp",
  shoot: "/icons3d/photography.webp",
  coins: "/icons3d/growth-chart.webp",
  social: "/icons3d/social-media.png",
  events: "/icons3d/eventa.png",
  growth: "/icons3d/growth.png",
  // The 300px mark, not the 2000px master: decoding a large image uploads on
  // the main thread and shows up as a hitch the moment the stage mounts.
  logo: "/brand/PFC-LOGO-300x300.webp",
} as const;

type AssetKey = keyof typeof ASSETS;
const ASSET_KEYS = Object.keys(ASSETS) as AssetKey[];
type Textures = Record<AssetKey, THREE.Texture>;

const easeOut = (v: number) => 1 - Math.pow(1 - v, 3);
const easeInOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);

/* ------------------------------------------------------------------------- */
/* Layout: fit the stage box to the free space on screen                     */
/* ------------------------------------------------------------------------- */

type Layout = { x: number; y: number; unit: number; opacity: number; compact: boolean };

/** Every set piece is authored inside ±BOX units; the layout scales that box. */
const BOX = 2.3;

function computeLayout(width: number, height: number, fovDeg: number, distance: number): Layout {
  const vh = 2 * Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2) * distance;
  const vw = vh * (width / height);
  const toWorldX = (px: number) => (px / width - 0.5) * vw;
  // The fixed header, in world units — nothing is ever placed behind it.
  const header = (88 / height) * vh;

  if (width >= 1024) {
    // Copy occupies roughly the left 60% of the 80rem container; the set piece
    // is centred in whatever remains to its right.
    const container = Math.min(width, 1280);
    const left = (width - container) / 2;
    const start = left + container * 0.6;
    const end = width - Math.max(64, left * 0.6);
    const freeWidth = ((end - start) / width) * vw;
    const freeHeight = (vh - header) * 0.8;
    return {
      x: toWorldX((start + end) / 2),
      y: -header / 2 - vh * 0.01,
      unit: Math.min(freeWidth, freeHeight) / (BOX * 2.1),
      opacity: 1,
      compact: false,
    };
  }

  // Narrow screens: the copy spans the full width, so the set piece sits
  // behind it — lower, smaller and quieter.
  return {
    x: 0,
    y: -vh * 0.17,
    unit: Math.min(vw * 0.86, vh * 0.44) / (BOX * 2),
    opacity: 0.5,
    compact: true,
  };
}

/* ------------------------------------------------------------------------- */
/* Contexts                                                                  */
/* ------------------------------------------------------------------------- */

const LayoutCtx = createContext<Layout>({ x: 0, y: 0, unit: 1, opacity: 1, compact: false });
const TexturesCtx = createContext<Textures | null>(null);
const ChapterCtx = createContext<MutableRefObject<number> | null>(null);

function useTextures() {
  const t = useContext(TexturesCtx);
  if (!t) throw new Error("useTextures outside ChapterWorld");
  return t;
}

/** Eased 0–1 presence of the enclosing chapter. */
function usePresence() {
  const p = useContext(ChapterCtx);
  if (!p) throw new Error("usePresence outside a chapter");
  return p;
}

/**
 * Materials a chapter should leave alone carry `userData.managed`, and their
 * owner sets opacity itself (for depth fades and pulses). `userData.base` is
 * the opacity they should reach at full presence.
 */
function setGroupOpacity(root: THREE.Object3D, opacity: number) {
  root.traverse((obj) => {
    const material = (obj as THREE.Mesh).material as THREE.Material | undefined;
    if (!material) return;
    material.opacity = opacity * ((material.userData.base as number | undefined) ?? 1);
  });
}

/* ------------------------------------------------------------------------- */
/* Chapter wrapper                                                           */
/* ------------------------------------------------------------------------- */

function ChapterGroup({ name, children }: { name: Chapter; children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const presence = useRef(0);
  const layout = useContext(LayoutCtx);
  const materials = useRef<{ material: THREE.Material; base: number }[]>([]);

  useEffect(() => {
    const list: { material: THREE.Material; base: number }[] = [];
    group.current?.traverse((obj) => {
      const m = (obj as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (!m) return;
      for (const material of Array.isArray(m) ? m : [m]) {
        if (material.userData.managed) continue;
        material.transparent = true;
        list.push({ material, base: material.opacity });
      }
    });
    materials.current = list;
  }, []);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;

    presence.current = damp(presence.current, chapterVisibility(name), 10, delta);
    const v = presence.current;

    g.visible = v > 0.003;
    if (!g.visible) return;

    const e = easeOut(v);
    g.scale.setScalar(0.9 + 0.1 * e);
    g.position.y = (1 - e) * -0.45;

    const alpha = e * layout.opacity;
    for (const { material, base } of materials.current) material.opacity = base * alpha;
  });

  return (
    <ChapterCtx.Provider value={presence}>
      <group ref={group} visible={false}>
        {children}
      </group>
    </ChapterCtx.Provider>
  );
}

/* ------------------------------------------------------------------------- */
/* Shared pieces                                                             */
/* ------------------------------------------------------------------------- */

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = w / 2;
  const y = h / 2;
  s.moveTo(-x + r, -y);
  s.lineTo(x - r, -y);
  s.quadraticCurveTo(x, -y, x, -y + r);
  s.lineTo(x, y - r);
  s.quadraticCurveTo(x, y, x - r, y);
  s.lineTo(-x + r, y);
  s.quadraticCurveTo(-x, y, -x, y - r);
  s.lineTo(-x, -y + r);
  s.quadraticCurveTo(-x, -y, -x + r, -y);
  return s;
}

/** A rounded outline: an outer rounded rect with the inner one cut out. */
function roundedFrame(w: number, h: number, r: number, thickness: number) {
  const outer = roundedRect(w, h, r);
  outer.holes.push(roundedRect(w - thickness * 2, h - thickness * 2, Math.max(0.01, r - thickness)));
  return outer;
}

/** An order ticket: platform-coloured slip with two lines of "print". */
function Ticket({ geometry, color }: { geometry: THREE.BufferGeometry; color: string }) {
  return (
    <>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
          userData={{ managed: true, base: 1 }}
        />
      </mesh>
      <mesh position={[-0.03, 0.035, 0.002]}>
        <planeGeometry args={[0.2, 0.034]} />
        <meshBasicMaterial
          color={CREAM}
          transparent
          opacity={0}
          depthWrite={false}
          userData={{ managed: true, base: 0.95 }}
        />
      </mesh>
      <mesh position={[-0.07, -0.035, 0.002]}>
        <planeGeometry args={[0.12, 0.028]} />
        <meshBasicMaterial
          color={CREAM}
          transparent
          opacity={0}
          depthWrite={false}
          userData={{ managed: true, base: 0.6 }}
        />
      </mesh>
    </>
  );
}

/** Camera-facing image. */
function Billboard({
  map,
  size,
  managed = false,
}: {
  map: THREE.Texture;
  size: number;
  managed?: boolean;
}) {
  return (
    <mesh>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={map}
        transparent
        opacity={managed ? 0 : 1}
        depthWrite={false}
        toneMapped={false}
        userData={managed ? { managed: true, base: 1 } : {}}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------------- */
/* 1. Chart — a revenue chart drawing itself                                 */
/* ------------------------------------------------------------------------- */

/**
 * Two curves on one dashboard card, and the gap between them is the argument:
 *
 *   baseline  where the account was - flat, grey, set back in depth
 *   growth    where it gets to - climbing, gold, lit, in front
 *
 * The gold curve draws itself out of the baseline over two seconds, the area
 * beneath it fills in, an arrowhead rides the tip, and a light keeps running up
 * the drawn length afterwards so the picture never freezes into a screenshot.
 * The parallax between the two curves (they sit half a unit apart in z, seen
 * from a turned camera) is what gives the panel its depth.
 */
const CHART_VALUES = [-1.2, -1.05, -1.14, -0.76, -0.34, 0.2, 0.74, 1.32];
/** The same eight weeks without the work: flat, drifting slightly down. */
const BASE_VALUES = [-1.2, -1.26, -1.16, -1.3, -1.2, -1.32, -1.22, -1.3];
const CHART_BASE = -1.6;
const CHART_LEFT = -1.9;
const CHART_WIDTH = 3.8;
const CHART_SEGMENTS = 140;
/** How far behind the growth curve the baseline sits. */
const CHART_DEPTH = -0.55;
const chartX = (i: number) => CHART_LEFT + (CHART_WIDTH * i) / (CHART_VALUES.length - 1);
const LAST = CHART_VALUES.length - 1;

/** Filled area under the curve, gold at the line fading to nothing at the base. */
function buildArea(
  curve: THREE.Curve<THREE.Vector3>,
  segments: number,
  base: number,
  tint: string,
  alpha: number,
) {
  const positions: number[] = [];
  const colors: number[] = [];
  const index: number[] = [];
  const c = new THREE.Color(tint);
  const p = new THREE.Vector3();
  for (let i = 0; i <= segments; i++) {
    curve.getPointAt(i / segments, p);
    positions.push(p.x, p.y, 0, p.x, base, 0);
    colors.push(c.r, c.g, c.b, alpha, c.r, c.g, c.b, 0);
    if (i < segments) {
      const a = i * 2;
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 4));
  g.setIndex(index);
  return g;
}

/**
 * Show the slice of a tube between two points along it. Draw ranges are counted
 * in indices and a triangle is three of them, so both ends snap to a multiple
 * of three - otherwise the slice starts mid-triangle and tears.
 */
function setTubeRange(geo: THREE.BufferGeometry, from: number, to: number) {
  const total = geo.index!.count;
  const start = Math.floor((total * clamp01(from)) / 3) * 3;
  const end = Math.floor((total * clamp01(to)) / 3) * 3;
  geo.setDrawRange(start, Math.max(0, end - start));
}

function ChartChapter() {
  const presence = usePresence();
  const palette = usePalette();
  const layout = useContext(LayoutCtx);

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        CHART_VALUES.map((y, i) => new THREE.Vector3(chartX(i), y, 0)),
        false,
        "catmullrom",
        0.5,
      ),
    [],
  );
  const baseline = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        BASE_VALUES.map((y, i) => new THREE.Vector3(chartX(i), y, CHART_DEPTH)),
        false,
        "catmullrom",
        0.5,
      ),
    [],
  );

  const lineGeo = useMemo(() => new THREE.TubeGeometry(curve, CHART_SEGMENTS, 0.034, 8, false), [curve]);
  const haloGeo = useMemo(() => new THREE.TubeGeometry(curve, CHART_SEGMENTS, 0.1, 8, false), [curve]);
  /** The travelling highlight: a short bright slice of the same path. */
  const sweepGeo = useMemo(() => new THREE.TubeGeometry(curve, CHART_SEGMENTS, 0.062, 8, false), [curve]);
  const baseGeo = useMemo(() => new THREE.TubeGeometry(baseline, 80, 0.016, 6, false), [baseline]);
  const areaGeo = useMemo(
    () => buildArea(curve, CHART_SEGMENTS, CHART_BASE, palette.glow, palette.areaAlpha),
    [curve, palette],
  );
  const panelGeo = useMemo(() => new THREE.ShapeGeometry(roundedRect(4.5, 3.7, 0.22), 8), []);
  const frameGeo = useMemo(() => new THREE.ShapeGeometry(roundedFrame(4.5, 3.7, 0.22, 0.018), 8), []);
  const ticketGeo = useMemo(() => new THREE.ShapeGeometry(roundedRect(0.38, 0.24, 0.06), 6), []);

  // How far along the drawn line each data point sits, so each one pops exactly
  // as the line reaches it rather than on a separate timer.
  const pointStops = useMemo(() => {
    const samples = 400;
    const xs = Array.from({ length: samples + 1 }, (_, i) => curve.getPointAt(i / samples).x);
    return CHART_VALUES.map((_, i) => {
      let best = 0;
      for (let j = 1; j <= samples; j++) {
        if (Math.abs(xs[j] - chartX(i)) < Math.abs(xs[best] - chartX(i))) best = j;
      }
      return best / samples;
    });
  }, [curve]);

  const group = useRef<THREE.Group>(null);
  const dots = useRef<(THREE.Mesh | null)[]>([]);
  const tipRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const sweep = useRef<THREE.Mesh>(null);
  const gap = useRef<THREE.Mesh>(null);
  const tickets = useRef<(THREE.Group | null)[]>([]);
  const draw = useRef(0);
  const tip = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useFrame((state, delta) => {
    const v = presence.current;
    if (v < 0.003) {
      // Reset, so the chart draws itself again each time you come back to it.
      draw.current = 0;
      return;
    }
    const t = state.clock.elapsedTime;
    const alpha = easeOut(v) * layout.opacity;

    draw.current = Math.min(1, draw.current + delta / 2.1);
    const d = easeInOut(draw.current);

    lineGeo.setDrawRange(0, Math.floor(lineGeo.index!.count * d));
    haloGeo.setDrawRange(0, Math.floor(haloGeo.index!.count * d));
    areaGeo.setDrawRange(0, Math.floor(areaGeo.index!.count * d));
    curve.getPointAt(Math.max(0.0001, d), tip);

    // The highlight runs the drawn length on a loop, so once the curve is
    // complete the panel still reads as live rather than finished.
    const run = (t * 0.5) % 1;
    const headAt = run * d;
    setTubeRange(sweepGeo, headAt - 0.17, headAt);
    if (sweep.current) {
      (sweep.current.material as THREE.MeshBasicMaterial).opacity =
        Math.sin(run * Math.PI) * 0.34 * palette.glowScale * alpha;
    }

    dots.current.forEach((dot, i) => {
      if (!dot) return;
      const s = smoothstep(pointStops[i] - 0.005, pointStops[i] + 0.05, d);
      dot.scale.setScalar(Math.max(0.0001, s * (1 + 0.45 * Math.sin(s * Math.PI))));
    });

    // Arrowhead rides the tip, turned along the direction of travel.
    if (tipRef.current) tipRef.current.position.copy(tip);
    if (headRef.current) {
      curve.getTangentAt(Math.max(0.0001, d), dir).normalize();
      headRef.current.quaternion.setFromUnitVectors(up, dir);
      headRef.current.position.copy(dir).multiplyScalar(0.13);
    }
    if (pulse.current) {
      const k = (t * 0.9) % 1;
      pulse.current.scale.setScalar(1 + k * 1.6);
      (pulse.current.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.7 * alpha;
    }

    // The bar closing the gap between the two curves at the final week - the
    // whole point of the picture, so it arrives last and stays.
    if (gap.current) {
      const k = easeOut(smoothstep(0.78, 1, d));
      const h = Math.max(0.0001, (CHART_VALUES[LAST] - BASE_VALUES[LAST]) * k);
      gap.current.scale.y = h;
      gap.current.position.y = BASE_VALUES[LAST] + h / 2;
    }

    // Orders arriving at the tip - one Swiggy, one Zomato, on a loop.
    tickets.current.forEach((node, k) => {
      if (!node) return;
      const phase = (t * 0.42 + k * 0.5) % 1;
      // Kept inside the card: a ticket drifting off the top edge reads as a
      // rendering fault rather than as an order arriving.
      node.position.set(
        Math.min(1.7, tip.x + 0.06 + k * 0.2),
        Math.min(1.62, tip.y + 0.24 + phase * 0.42),
        0.15,
      );
      node.lookAt(state.camera.position);
      setGroupOpacity(node, Math.sin(phase * Math.PI) * alpha * smoothstep(0.25, 0.45, d));
    });

    if (group.current) group.current.rotation.y = -0.3 + Math.sin(t * 0.25) * 0.05;
  });

  return (
    <group ref={group} rotation={[0.06, -0.3, 0]}>
      {/* The dashboard card the chart sits on */}
      <mesh geometry={panelGeo} position={[0, -0.1, -0.22]}>
        <meshBasicMaterial color={palette.panel} opacity={palette.panelOpacity} depthWrite={false} />
      </mesh>
      <mesh geometry={frameGeo} position={[0, -0.1, -0.21]}>
        <meshBasicMaterial color={GOLD} opacity={0.35} depthWrite={false} />
      </mesh>

      {/* Floor: a plane running back under the curves. With the group turned a
          sixth of a radian it catches the eye as depth rather than as a shape. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, CHART_BASE, -0.3]}>
        <planeGeometry args={[4.2, 0.95]} />
        <meshBasicMaterial color={palette.grid} opacity={palette.gridSoft * 0.7} depthWrite={false} />
      </mesh>

      {[CHART_BASE, -0.75, 0, 0.75].map((y, i) => (
        <mesh key={y} position={[0, y, -0.05]}>
          <planeGeometry args={[4.1, i === 0 ? 0.016 : 0.008]} />
          <meshBasicMaterial
            color={palette.grid}
            opacity={i === 0 ? palette.gridStrong : palette.gridSoft}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Baseline: the flat line the growth curve leaves behind. */}
      <mesh geometry={baseGeo}>
        <meshBasicMaterial color={palette.grid} opacity={0.3} depthWrite={false} />
      </mesh>
      {BASE_VALUES.map((y, i) => (
        <mesh key={i} position={[chartX(i), y, CHART_DEPTH]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color={palette.grid} opacity={0.34} depthWrite={false} />
        </mesh>
      ))}

      {/* The lift, measured at the last week. */}
      <mesh ref={gap} position={[chartX(LAST), 0, -0.3]} scale={[1, 0.0001, 1]}>
        <planeGeometry args={[0.035, 1]} />
        <meshBasicMaterial color={palette.glow} opacity={0.55} depthWrite={false} />
      </mesh>

      <mesh geometry={areaGeo}>
        <meshBasicMaterial vertexColors depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={haloGeo}>
        <meshBasicMaterial
          color={palette.glow}
          opacity={0.16 * palette.glowScale}
          blending={palette.blending}
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={lineGeo}>
        <meshBasicMaterial color={palette.line} toneMapped={false} />
      </mesh>
      <mesh ref={sweep} geometry={sweepGeo}>
        <meshBasicMaterial
          color={palette.sweep}
          transparent
          opacity={0}
          blending={palette.blending}
          depthWrite={false}
          toneMapped={false}
          userData={{ managed: true, base: 1 }}
        />
      </mesh>

      {CHART_VALUES.map((y, i) => (
        <mesh
          key={i}
          ref={(el) => {
            dots.current[i] = el;
          }}
          position={[chartX(i), y, 0.02]}
          scale={0.0001}
        >
          <sphereGeometry args={[i === LAST ? 0.08 : 0.06, 16, 16]} />
          <meshBasicMaterial color={i === LAST ? palette.line : palette.grid} toneMapped={false} />
        </mesh>
      ))}

      <group ref={tipRef}>
        <mesh ref={headRef}>
          <coneGeometry args={[0.11, 0.3, 20]} />
          <meshBasicMaterial color={palette.line} toneMapped={false} />
        </mesh>
        <mesh ref={pulse}>
          <ringGeometry args={[0.13, 0.17, 40]} />
          <meshBasicMaterial
            color={palette.line}
            transparent
            opacity={0}
            depthWrite={false}
            blending={palette.blending}
            userData={{ managed: true }}
          />
        </mesh>
      </group>

      {[SWIGGY, ZOMATO].map((color, k) => (
        <group
          key={color}
          ref={(el) => {
            tickets.current[k] = el;
          }}
        >
          <Ticket geometry={ticketGeo} color={color} />
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------------- */
/* 2. Engines — both platforms feeding one stack of revenue                  */
/* ------------------------------------------------------------------------- */

const COINS = 10;
// Authored in the upper half of the box: the platform cards fill the lower half.
const COIN_BASE = -0.25;
const COIN_STEP = 0.085;
const FLOW = 12;

function Engine({ x, color, dir }: { x: number; color: string; dir: 1 | -1 }) {
  const palette = usePalette();
  const outer = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (outer.current) outer.current.rotation.z += delta * 0.5 * dir;
    if (inner.current) inner.current.rotation.z -= delta * 1.1 * dir;
  });

  return (
    <group position={[x, 0.55, 0]} rotation={[0.18, -dir * 0.25, 0]}>
      <mesh>
        <circleGeometry args={[0.46, 48]} />
        <meshBasicMaterial
          color={color}
          opacity={0.16 * palette.glowScale}
          blending={palette.blending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={outer}>
        <torusGeometry args={[0.52, 0.055, 16, 72, Math.PI * 1.6]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh ref={inner}>
        <torusGeometry args={[0.34, 0.018, 10, 60, Math.PI * 1.2]} />
        <meshBasicMaterial color={palette.grid} opacity={0.7} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.1, 20, 20]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

function EnginesChapter() {
  const presence = usePresence();
  const palette = usePalette();
  const layout = useContext(LayoutCtx);
  const tex = useTextures();

  const coins = useRef<(THREE.Mesh | null)[]>([]);
  const tickets = useRef<(THREE.Group | null)[]>([]);
  const bag = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);
  const ticketGeo = useMemo(() => new THREE.ShapeGeometry(roundedRect(0.34, 0.21, 0.05), 6), []);

  useFrame((state) => {
    const v = presence.current;
    if (v < 0.003) return;
    const t = state.clock.elapsedTime;
    const alpha = easeOut(v) * layout.opacity;

    // The stack grows as you read down through the chapter.
    const growth = smoothstep(0, 0.8, chapterProgress("engines")) * easeOut(v);
    const filled = 2 + growth * (COINS - 2);

    let top = COIN_BASE;
    coins.current.forEach((coin, i) => {
      if (!coin) return;
      const present = clamp01(filled - i);
      coin.visible = present > 0.01;
      // New coins drop into place rather than appearing.
      coin.position.y = COIN_BASE + i * COIN_STEP + (1 - present) * 0.7;
      coin.rotation.y = t * 0.4 + i * 0.35;
      if (present > 0.5) top = COIN_BASE + i * COIN_STEP;
    });
    const land = top + 0.12;

    tickets.current.forEach((node, i) => {
      if (!node) return;
      const side = i % 2 === 0 ? -1 : 1;
      const p = (t * 0.28 + i / FLOW) % 1;
      const u = 1 - p;
      // Quadratic bezier from the engine, under the bag, onto the stack.
      const sx = side * 1.5;
      const sy = 0.55;
      const cx = side * 0.75;
      const cy = 1.35;
      node.position.set(u * u * sx + 2 * u * p * cx, u * u * sy + 2 * u * p * cy + p * p * land, 0.2);
      node.rotation.z = side * u * 0.5;
      node.scale.setScalar(0.65 + 0.35 * Math.sin(p * Math.PI));
      setGroupOpacity(node, Math.pow(Math.sin(p * Math.PI), 0.8) * alpha);
    });

    if (glow.current) {
      glow.current.position.y = land;
      (glow.current.material as THREE.MeshBasicMaterial).opacity =
        (0.2 + 0.08 * Math.sin(t * 4)) * alpha;
    }
    if (bag.current) {
      bag.current.position.y = 1.62 + Math.sin(t * 1.2) * 0.06;
      bag.current.lookAt(state.camera.position);
    }
  });

  return (
    <group rotation={[0.05, 0, 0]}>
      <Engine x={-1.5} color={SWIGGY} dir={1} />
      <Engine x={1.5} color={ZOMATO} dir={-1} />

      <mesh ref={glow} position={[0, COIN_BASE, -0.3]}>
        <circleGeometry args={[0.75, 48]} />
        <meshBasicMaterial
          color={palette.glow}
          transparent
          opacity={0}
          blending={palette.blending}
          depthWrite={false}
          userData={{ managed: true }}
        />
      </mesh>

      {Array.from({ length: COINS }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            coins.current[i] = el;
          }}
          position={[0, COIN_BASE + i * COIN_STEP, 0]}
        >
          <cylinderGeometry args={[0.42, 0.42, 0.07, 40]} />
          <meshStandardMaterial
            color={GOLD}
            metalness={0.85}
            roughness={0.28}
            emissive="#5a3c08"
            emissiveIntensity={0.45 * palette.emissiveScale}
          />
        </mesh>
      ))}

      {Array.from({ length: FLOW }, (_, i) => (
        <group
          key={i}
          ref={(el) => {
            tickets.current[i] = el;
          }}
        >
          <Ticket geometry={ticketGeo} color={i % 2 === 0 ? SWIGGY : ZOMATO} />
        </group>
      ))}

      <group ref={bag} position={[0, 1.62, 0.1]}>
        <Billboard map={tex.bag} size={0.95} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------------- */
/* 3. Menu — service cards on a carousel that turns with the scroll          */
/* ------------------------------------------------------------------------- */

const MENU_CARDS: { key: AssetKey; title: string; accent: string }[] = [
  { key: "menu", title: "Menu Optimization", accent: GOLD },
  { key: "coins", title: "Delivery Sales Growth", accent: SWIGGY },
  { key: "shoot", title: "Food Photography", accent: "#C2557F" },
  { key: "bag", title: "Swiggy & Zomato Onboarding", accent: ZOMATO },
  { key: "social", title: "Meta Ads", accent: "#8ED1FC" },
  { key: "events", title: "Event Consulting", accent: "#9B51E0" },
  { key: "growth", title: "Dine-In Sales Growth", accent: "#5FB37A" },
];
const CARD_W = 1.1;
const CARD_H = 1.375;
const CAROUSEL_R = 1.4;

function displayFont() {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--font-sora").trim();
  return value || "system-ui, sans-serif";
}

function hexToRgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function roundedPath(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function wrapText(g: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (g.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Service cards are painted to a canvas — frame, image and title in one
 * texture — so each card is a single plane. That keeps transparency sorting
 * per card correct as the carousel turns, and puts real, legible service names
 * in the 3D rather than anonymous tiles.
 */
function paintCard(
  canvas: HTMLCanvasElement,
  image: CanvasImageSource & { naturalWidth?: number; naturalHeight?: number },
  title: string,
  accent: string,
  index: number,
  font: string,
) {
  const g = canvas.getContext("2d");
  if (!g) return;
  const W = canvas.width;
  const H = canvas.height;
  g.clearRect(0, 0, W, H);

  roundedPath(g, 6, 6, W - 12, H - 12, 44);
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#241c13");
  bg.addColorStop(1, "#110d09");
  g.fillStyle = bg;
  g.fill();

  g.save();
  roundedPath(g, 6, 6, W - 12, H - 12, 44);
  g.clip();
  const glow = g.createRadialGradient(W / 2, 240, 10, W / 2, 240, 300);
  glow.addColorStop(0, hexToRgba(accent, 0.34));
  glow.addColorStop(1, hexToRgba(accent, 0));
  g.fillStyle = glow;
  g.fillRect(0, 0, W, H);
  g.restore();

  roundedPath(g, 6, 6, W - 12, H - 12, 44);
  g.lineWidth = 3;
  g.strokeStyle = "rgba(224,168,46,0.6)";
  g.stroke();

  const box = 320;
  const iw = image.naturalWidth || box;
  const ih = image.naturalHeight || box;
  const s = Math.min(box / iw, box / ih);
  g.drawImage(image, (W - iw * s) / 2, 70 + (box - ih * s) / 2, iw * s, ih * s);

  g.fillStyle = accent;
  roundedPath(g, 48, 436, 64, 8, 4);
  g.fill();

  g.textBaseline = "alphabetic";
  g.fillStyle = "rgba(255,249,223,0.5)";
  g.font = `600 22px ${font}`;
  const num = `0${index + 1}`;
  g.fillText(num, W - 48 - g.measureText(num).width, 448);

  g.fillStyle = "#FFF9DF";
  g.font = `700 40px ${font}`;
  wrapText(g, title, W - 96)
    .slice(0, 2)
    .forEach((line, i) => g.fillText(line, 48, 508 + i * 48));

  g.fillStyle = "rgba(224,168,46,0.85)";
  g.font = `600 20px ${font}`;
  g.fillText("PLATEFUL SERVICE", 48, 606);
}

function MenuChapter() {
  const presence = usePresence();
  const palette = usePalette();
  const layout = useContext(LayoutCtx);
  const tex = useTextures();

  const cards = useMemo(
    () =>
      MENU_CARDS.map((card, i) => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 640;
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        const paint = () => {
          paintCard(canvas, tex[card.key].image as HTMLImageElement, card.title, card.accent, i, displayFont());
          texture.needsUpdate = true;
        };
        paint();
        return { ...card, texture, paint };
      }),
    [tex],
  );

  // Repaint once the display face has loaded, or the first paint's fallback
  // font would stay baked into the textures.
  useEffect(() => {
    let alive = true;
    document.fonts?.ready.then(() => {
      if (alive) cards.forEach((c) => c.paint());
    });
    return () => {
      alive = false;
    };
  }, [cards]);

  const meshes = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const v = presence.current;
    if (v < 0.003) return;
    const t = state.clock.elapsedTime;
    const alpha = easeOut(v) * layout.opacity;

    // Scroll turns the carousel; a slow idle drift keeps it alive when still.
    const turn = -chapterProgress("menu") * Math.PI * 2 * 0.9 + t * 0.03;

    meshes.current.forEach((mesh, i) => {
      if (!mesh) return;
      const a = (i / cards.length) * Math.PI * 2 + turn;
      const front = (Math.cos(a) + 1) / 2;
      mesh.position.set(
        Math.sin(a) * CAROUSEL_R,
        Math.sin(t * 0.8 + i) * 0.03,
        Math.cos(a) * CAROUSEL_R - CAROUSEL_R * 0.35,
      );
      mesh.rotation.y = a;
      (mesh.material as THREE.MeshBasicMaterial).opacity =
        (0.12 + 0.88 * Math.pow(front, 1.6)) * alpha;
    });
  });

  return (
    // Lifted into the space beside the heading; the card grid owns the rest.
    <group position={[0, 0.95, 0]} rotation={[0.06, 0, 0]}>
      <mesh position={[0, -0.8, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.55, 1]}>
        <circleGeometry args={[1.8, 64]} />
        <meshBasicMaterial
          color={palette.glow}
          opacity={0.08 * palette.glowScale}
          blending={palette.blending}
          depthWrite={false}
        />
      </mesh>

      {cards.map((card, i) => (
        <mesh
          key={card.key}
          ref={(el) => {
            meshes.current[i] = el;
          }}
        >
          <planeGeometry args={[CARD_W, CARD_H]} />
          <meshBasicMaterial
            map={card.texture}
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.FrontSide}
            toneMapped={false}
            userData={{ managed: true }}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------------- */
/* 4. Bars — revenue rising, with the growth arrow over it                   */
/* ------------------------------------------------------------------------- */

const BARS = [0.42, 0.66, 0.94, 1.25, 1.6, 2.0];
// Raised clear of the logo grid that fills the lower half of this section.
const BAR_BASE = -0.1;
const BAR_W = 0.42;
const barX = (i: number) => -1.6 + i * 0.64;
const SPARKS = 26;

function BarsChapter() {
  const presence = usePresence();
  const palette = usePalette();
  const layout = useContext(LayoutCtx);
  const tex = useTextures();

  const bars = useRef<(THREE.Mesh | null)[]>([]);
  const caps = useRef<(THREE.Mesh | null)[]>([]);
  const head = useRef<THREE.Mesh>(null);
  const badge = useRef<THREE.Group>(null);
  const sparks = useRef<THREE.Points>(null);
  const group = useRef<THREE.Group>(null);
  const grow = useRef(0);

  const barColors = useMemo(
    () =>
      BARS.map((_, i) =>
        new THREE.Color(palette.barLow).lerp(
          new THREE.Color(palette.barHigh),
          i / (BARS.length - 1),
        ),
      ),
    [palette],
  );

  const arrow = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(-1.95, 0.25, 0.35),
          new THREE.Vector3(-0.95, 0.6, 0.35),
          new THREE.Vector3(0.1, 1.05, 0.35),
          new THREE.Vector3(1.0, 1.55, 0.35),
          new THREE.Vector3(1.72, 2.02, 0.35),
        ],
        false,
        "catmullrom",
        0.5,
      ),
    [],
  );
  const arrowGeo = useMemo(() => new THREE.TubeGeometry(arrow, 90, 0.03, 8, false), [arrow]);
  const arrowEnd = useMemo(() => arrow.getPointAt(1), [arrow]);
  const arrowDir = useMemo(() => arrow.getTangentAt(1).normalize(), [arrow]);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const sparkPositions = useMemo(() => new Float32Array(SPARKS * 3), []);

  useFrame((state, delta) => {
    const v = presence.current;
    if (v < 0.003) {
      grow.current = 0;
      return;
    }
    const t = state.clock.elapsedTime;
    grow.current = Math.min(1, grow.current + delta / 1.8);
    const g = grow.current;

    let tallestTop = BAR_BASE;
    bars.current.forEach((bar, i) => {
      if (!bar) return;
      const rise = easeOut(smoothstep(i * 0.08, 0.45 + i * 0.08, g));
      const h = Math.max(0.001, BARS[i] * rise);
      bar.scale.y = h;
      bar.position.y = BAR_BASE + h / 2;
      const cap = caps.current[i];
      if (cap) {
        cap.position.y = BAR_BASE + h + 0.012;
        cap.visible = h > 0.02;
      }
      tallestTop = Math.max(tallestTop, BAR_BASE + h);
    });

    const d = smoothstep(0.35, 1, g);
    arrowGeo.setDrawRange(0, Math.floor(arrowGeo.index!.count * d));
    if (head.current) {
      head.current.position.copy(arrowEnd);
      head.current.quaternion.setFromUnitVectors(up, arrowDir);
      head.current.scale.setScalar(Math.max(0.0001, smoothstep(0.9, 1, d)));
    }

    if (badge.current) {
      badge.current.position.y = 1.75 + Math.sin(t * 1.1) * 0.06;
      badge.current.lookAt(state.camera.position);
    }

    if (sparks.current) {
      for (let i = 0; i < SPARKS; i++) {
        const p = (t * 0.5 + i / SPARKS) % 1;
        const a = i * 2.39996;
        sparkPositions[i * 3] = barX(BARS.length - 1) + Math.cos(a) * 0.3 * p;
        sparkPositions[i * 3 + 1] = tallestTop + p * 0.42;
        sparkPositions[i * 3 + 2] = Math.sin(a) * 0.3 * p;
      }
      sparks.current.geometry.attributes.position.needsUpdate = true;
      sparks.current.visible = g > 0.75;
    }

    if (group.current) group.current.rotation.y = -0.32 + Math.sin(t * 0.22) * 0.05;
    void layout;
  });

  return (
    <group ref={group} rotation={[0.08, -0.32, 0]}>
      <mesh position={[0, BAR_BASE - 0.03, 0]}>
        <boxGeometry args={[4.3, 0.06, 0.95]} />
        <meshStandardMaterial color={palette.panel} roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, BAR_BASE, 0.48]}>
        <boxGeometry args={[4.3, 0.012, 0.012]} />
        <meshBasicMaterial color={GOLD} toneMapped={false} />
      </mesh>

      {BARS.map((_, i) => (
        <group key={i}>
          <mesh
            ref={(el) => {
              bars.current[i] = el;
            }}
            position={[barX(i), BAR_BASE, 0]}
            scale={[1, 0.001, 1]}
          >
            <boxGeometry args={[BAR_W, 1, BAR_W]} />
            <meshStandardMaterial
              color={barColors[i]}
              emissive={barColors[i]}
              emissiveIntensity={(0.25 + (i / (BARS.length - 1)) * 0.6) * palette.emissiveScale}
              roughness={0.4}
              metalness={0.6}
            />
          </mesh>
          <mesh
            ref={(el) => {
              caps.current[i] = el;
            }}
            position={[barX(i), BAR_BASE, 0]}
            visible={false}
          >
            <boxGeometry args={[BAR_W + 0.02, 0.024, BAR_W + 0.02]} />
            <meshBasicMaterial color={palette.line} toneMapped={false} />
          </mesh>
        </group>
      ))}

      <mesh geometry={arrowGeo}>
        <meshBasicMaterial color="#FF7A4D" toneMapped={false} />
      </mesh>
      <mesh ref={head} scale={0.0001}>
        <coneGeometry args={[0.1, 0.24, 20]} />
        <meshBasicMaterial color="#FF7A4D" toneMapped={false} />
      </mesh>

      <group ref={badge} position={[-1.3, 1.75, 0.2]}>
        <Billboard map={tex.growth} size={1.0} />
      </group>

      <points ref={sparks} visible={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparkPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color={palette.line}
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
          blending={palette.blending}
        />
      </points>
    </group>
  );
}

/* ------------------------------------------------------------------------- */
/* 5. Orbit — the brand, with the food and services circling it              */
/* ------------------------------------------------------------------------- */

const ORBIT_KEYS: AssetKey[] = ["growth", "bag", "menu", "shoot", "social", "coins"];
const ORBIT_R = 1.75;

function OrbitChapter() {
  const presence = usePresence();
  const palette = usePalette();
  const layout = useContext(LayoutCtx);
  const tex = useTextures();

  const logo = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const orbiters = useRef<(THREE.Group | null)[]>([]);

  useFrame((state, delta) => {
    const v = presence.current;
    if (v < 0.003) return;
    const t = state.clock.elapsedTime;
    const alpha = easeOut(v) * layout.opacity;

    if (logo.current) logo.current.rotation.y = Math.sin(t * 0.5) * 0.35;
    if (ring.current) ring.current.rotation.z += delta * 0.25;

    orbiters.current.forEach((node, i) => {
      if (!node) return;
      const a = (i / ORBIT_KEYS.length) * Math.PI * 2 + t * 0.22;
      const front = (Math.sin(a) + 1) / 2;
      node.position.set(Math.cos(a) * ORBIT_R, 0, Math.sin(a) * ORBIT_R);
      node.scale.setScalar(0.72 + 0.28 * front);
      node.lookAt(state.camera.position);
      setGroupOpacity(node, (0.28 + 0.72 * front) * alpha);
    });
  });

  return (
    <group>
      <mesh position={[0, 0.05, -0.2]}>
        <circleGeometry args={[0.95, 64]} />
        <meshBasicMaterial
          color={palette.glow}
          opacity={0.14 * palette.glowScale}
          blending={palette.blending}
          depthWrite={false}
        />
      </mesh>

      <group ref={logo} position={[0, 0.05, 0]}>
        <Billboard map={tex.logo} size={1.25} />
      </group>

      {/* Tilted plane the orbit runs in */}
      <group rotation={[0.28, 0, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[ORBIT_R, 0.006, 6, 160]} />
          <meshBasicMaterial color={GOLD} opacity={0.35} depthWrite={false} />
        </mesh>
        <mesh ref={ring} rotation={[Math.PI / 2 - 0.12, 0, 0]}>
          <torusGeometry args={[0.98, 0.016, 10, 120]} />
          <meshBasicMaterial color={palette.line} opacity={0.75} toneMapped={false} />
        </mesh>

        {ORBIT_KEYS.map((key, i) => (
          <group
            key={key}
            ref={(el) => {
              orbiters.current[i] = el;
            }}
          >
            <Billboard map={tex[key]} size={0.9} managed />
          </group>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------------- */
/* Atmosphere                                                                */
/* ------------------------------------------------------------------------- */

function Motes({ count }: { count: number }) {
  const palette = usePalette();
  const points = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 2] = -Math.random() * 4;
      speeds[i] = 0.08 + Math.random() * 0.25;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((_, delta) => {
    const geo = points.current?.geometry;
    if (!geo) return;
    const arr = geo.attributes.position.array as Float32Array;
    const step = Math.min(delta, 0.05);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * step;
      if (arr[i * 3 + 1] > 4.5) arr[i * 3 + 1] = -4.5;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={palette.mote}
        transparent
        opacity={palette.moteOpacity}
        sizeAttenuation
        depthWrite={false}
        blending={palette.blending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------------- */

export default function ChapterWorld({ quality = 1 }: { quality?: number }) {
  const { size, camera } = useThree();
  const { theme } = useTheme();
  const palette = PALETTES[theme];

  const loaded = useLoader(
    THREE.TextureLoader,
    ASSET_KEYS.map((k) => ASSETS[k]),
  );
  const textures = useMemo(() => {
    const map = {} as Textures;
    ASSET_KEYS.forEach((key, i) => {
      const t = loaded[i];
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      map[key] = t;
    });
    return map;
  }, [loaded]);

  const layout = useMemo(
    () =>
      computeLayout(
        size.width,
        size.height,
        (camera as THREE.PerspectiveCamera).fov,
        camera.position.z,
      ),
    [size.width, size.height, camera],
  );

  const stage = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  // The canvas ignores pointer events, so read the pointer from the window.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, delta) => {
    const g = stage.current;
    if (!g) return;
    g.position.set(layout.x, layout.y, 0);
    g.scale.setScalar(layout.unit);
    // Pointer parallax only — a gentle tilt toward the cursor, never scroll-linked.
    const px = layout.compact ? 0 : pointer.current.x;
    const py = layout.compact ? 0 : pointer.current.y;
    g.rotation.y = damp(g.rotation.y, px * 0.16, 3, delta);
    g.rotation.x = damp(g.rotation.x, py * 0.08, 3, delta);
  });

  return (
    <>
      <color attach="background" args={[palette.bg]} />
      <ambientLight intensity={0.75} color={CREAM} />
      <directionalLight position={[3, 5, 8]} intensity={1.7} color="#FFF3D0" />
      <pointLight position={[-6, 1, 6]} intensity={14} color={SWIGGY} distance={30} decay={2} />
      <pointLight position={[6, -1, 6]} intensity={12} color={ZOMATO} distance={30} decay={2} />

      <PaletteCtx.Provider value={palette}>
        <LayoutCtx.Provider value={layout}>
        <TexturesCtx.Provider value={textures}>
          <group ref={stage}>
            <ChapterGroup name="chart">
              <ChartChapter />
            </ChapterGroup>
            <ChapterGroup name="engines">
              <EnginesChapter />
            </ChapterGroup>
            <ChapterGroup name="menu">
              <MenuChapter />
            </ChapterGroup>
            <ChapterGroup name="bars">
              <BarsChapter />
            </ChapterGroup>
            <ChapterGroup name="orbit">
              <OrbitChapter />
            </ChapterGroup>
          </group>
        </TexturesCtx.Provider>
      </LayoutCtx.Provider>

        {quality > 0.5 && <Motes count={Math.round(140 * quality)} />}
      </PaletteCtx.Provider>
    </>
  );
}
