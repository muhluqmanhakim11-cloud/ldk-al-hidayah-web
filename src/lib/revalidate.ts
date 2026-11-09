import { revalidatePath } from "next/cache";

/**
 * Revalidates public pages on-demand so changes in admin panel
 * reflect immediately without waiting for ISR cache expiry.
 */
export function revalidatePublic(...paths: string[]) {
  try {
    for (const p of paths) {
      revalidatePath(p);
    }
  } catch (err) {
    console.error("[revalidatePublic] error:", err);
  }
}

/**
 * Revalidates the entire public site layout (header, footer, settings, all child routes)
 */
export function revalidateAll() {
  try {
    revalidatePath("/", "layout");
  } catch (err) {
    console.error("[revalidateAll] error:", err);
  }
}

