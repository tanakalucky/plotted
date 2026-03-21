import { del, get, set } from "idb-keyval";

const PREFIX = "map-img-";

export const saveMapImage = async (mapId: string, blob: Blob): Promise<void> => {
  try {
    await set(`${PREFIX}${mapId}`, blob);
  } catch {
    // D-06: IndexedDB unavailable — silently fail, image stays null
  }
};

export const loadMapImage = async (mapId: string): Promise<Blob | null> => {
  try {
    return (await get<Blob>(`${PREFIX}${mapId}`)) ?? null;
  } catch {
    return null; // D-06: fail gracefully
  }
};

export const deleteMapImage = async (mapId: string): Promise<void> => {
  try {
    await del(`${PREFIX}${mapId}`);
  } catch {
    // D-06: ignore
  }
};
