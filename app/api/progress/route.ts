import { getChatGPTUser } from "../../chatgpt-auth";
import { getProgressDb } from "../../../db/raw";
import { completeLesson, LESSON_IDS, readProgress } from "../../../lib/progress-service.mjs";

export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => Response.json(body, {
  status, headers: { "Cache-Control": "private, no-store" },
});

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return json({ error: "Iniciá sesión para guardar tu progreso." }, 401);
  try { return json(await readProgress(getProgressDb(), user.userId)); }
  catch (error) {
    console.error("Reading progress failed", error);
    return json({ error: "No pudimos cargar tu progreso. Volvé a intentar." }, 503);
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return json({ error: "Iniciá sesión para guardar tu progreso." }, 401);
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return json({ error: "Solicitud no permitida." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json"))
    return json({ error: "Formato no permitido." }, 415);
  let lessonId: unknown;
  try {
    const text = await request.text();
    if (text.length > 2048) return json({ error: "Solicitud demasiado grande." }, 413);
    lessonId = JSON.parse(text).lessonId;
  } catch { return json({ error: "Solicitud inválida." }, 400); }
  if (typeof lessonId !== "string" || !LESSON_IDS.includes(lessonId))
    return json({ error: "Lección inválida." }, 400);
  try { return json(await completeLesson(getProgressDb(), user.userId, lessonId)); }
  catch (error) {
    console.error("Saving progress failed", error);
    return json({ error: "No pudimos guardar la lección. Tus puntos no se duplicarán si reintentás." }, 503);
  }
}
