import * as THREE from "three";
import { SKINS as BUDDIES_SKINS, B, type Skin as BuddySkin } from "../buddies/characters";
import { buildVoxelGeometry, type Part } from "./voxel";
import type { Skin } from "./skins";

/** Cache of merged BufferGeometries for Voxel Buddies characters */
const buddyGeoCache = new Map<string, THREE.BufferGeometry>();

/** Extract all voxel box parts from a Voxel Buddies React component tree */
function extractBuddyParts(Comp: React.FC): Part[] {
  const parts: Part[] = [];

  function traverse(el: unknown, parentMat: THREE.Matrix4) {
    if (!el) return;
    if (Array.isArray(el)) {
      for (const child of el) traverse(child, parentMat);
      return;
    }
    const element = el as {
      type?: unknown;
      props?: {
        p?: [number, number, number];
        s?: [number, number, number];
        c?: string;
        r?: [number, number, number];
        position?: [number, number, number];
        rotation?: [number, number, number];
        scale?: number | [number, number, number];
        children?: unknown;
      };
    };

    if (typeof element.type === "function") {
      if (element.type === B || (element.type as { name?: string }).name === "B") {
        const { p = [0, 0, 0], s = [1, 1, 1], c = "#ffffff", r } = element.props || {};
        const local = new THREE.Matrix4();
        const rotEuler = r ? new THREE.Euler(r[0], r[1], r[2]) : new THREE.Euler(0, 0, 0);
        local.makeRotationFromEuler(rotEuler);
        local.setPosition(p[0], p[1], p[2]);

        const m = parentMat.clone().multiply(local);
        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        m.decompose(pos, quat, scale);
        const finalEuler = new THREE.Euler().setFromQuaternion(quat);

        parts.push({
          x: pos.x,
          y: pos.y,
          z: pos.z,
          w: s[0] * scale.x,
          h: s[1] * scale.y,
          d: s[2] * scale.z,
          rx: finalEuler.x,
          ry: finalEuler.y,
          rz: finalEuler.z,
          color: c,
        });
        return;
      }
      try {
        const fn = element.type as (props: unknown) => unknown;
        const rendered = fn(element.props || {});
        traverse(rendered, parentMat);
      } catch {
        // Safe fallback for edge cases
      }
      return;
    }

    if (element.type === Symbol.for("react.fragment") || element.type === Symbol.for("react.transitional.element")) {
      if (element.props?.children) {
        traverse(element.props.children, parentMat);
      }
      return;
    }

    const localMat = parentMat.clone();
    if (element.props) {
      const p = element.props.position || element.props.p;
      const r = element.props.rotation || element.props.r;
      const s = element.props.scale !== undefined ? element.props.scale : 1;
      const local = new THREE.Matrix4();
      const rot = r ? (Array.isArray(r) ? new THREE.Euler(r[0], r[1], r[2]) : r) : new THREE.Euler(0, 0, 0);
      local.makeRotationFromEuler(rot);
      if (p) local.setPosition(p[0], p[1], p[2]);
      if (typeof s === "number") local.scale(new THREE.Vector3(s, s, s));
      else if (Array.isArray(s)) local.scale(new THREE.Vector3(s[0], s[1], s[2]));
      localMat.multiply(local);

      if (element.props.children) {
        traverse(element.props.children, localMat);
      }
    }
  }

  try {
    (globalThis as unknown as { __EXTRACTING_BUDDY_PARTS?: boolean }).__EXTRACTING_BUDDY_PARTS = true;
    const root = Comp({});
    traverse(root, new THREE.Matrix4());
  } catch {
    // ignore
  } finally {
    (globalThis as unknown as { __EXTRACTING_BUDDY_PARTS?: boolean }).__EXTRACTING_BUDDY_PARTS = false;
  }

  return parts;
}

/** Get or build cached BufferGeometry for a Voxel Buddies character */
export function getBuddyGeometry(buddyId: string): THREE.BufferGeometry {
  const cached = buddyGeoCache.get(buddyId);
  if (cached) return cached;

  const buddy = BUDDIES_SKINS.find((s) => s.id === buddyId);
  if (!buddy) return new THREE.BufferGeometry();

  const parts = extractBuddyParts(buddy.Comp);
  const geo = buildVoxelGeometry(parts);
  buddyGeoCache.set(buddyId, geo);
  return geo;
}

/** Preload all buddy geometries to avoid hitches */
export function preloadAllBuddyGeometries() {
  for (const s of BUDDIES_SKINS) {
    if (s.id !== "pigeon") {
      getBuddyGeometry(s.id);
    }
  }
}

/**
 * Filter out 'pigeon' because the user specified:
 * "skin selain merpati di voxel buddies maka skinnya bisa dipakai di pigeon game"
 */
export const BUDDIES_FOR_PIGEON: BuddySkin[] = BUDDIES_SKINS.filter((s) => s.id !== "pigeon");

/**
 * Build playable Skin definitions for all 33 Voxel Buddies characters.
 * Each skin has `buddyId`, `kind: "buddy"`, and label badge `VOXEL BUDDIES`.
 */
export const BUDDY_SKIN_OPTIONS: Skin[] = BUDDIES_FOR_PIGEON.map((b) => {
  return {
    id: `buddy-${b.id}`,
    name: b.name,
    tagline: b.desc,
    cost: 0, // Free so player can enjoy playing as any Voxel Buddy immediately
    kind: "buddy" as const,
    buddyId: b.id,
    badgeLabel: "VOXEL BUDDIES",
    emoji: b.emoji,
    body: b.color,
    belly: b.bg[0] || b.color,
    head: b.color,
    neck1: b.bg[1] || b.color,
    neck2: b.color,
    wing: b.color,
    wingTip: b.bg[1] || "#111111",
    tail: b.color,
    tailTip: b.bg[1] || "#111111",
    beak: b.color,
    cere: b.color,
    feet: b.color,
    deck: b.bg[0] || "#2ec4b6",
    wheels: "#1c1e22",
  };
});
