import { currentBetaUser, publicUser } from "../../../../lib/beta-auth";
import { json, failure } from "../../../../lib/http";
import { reminderDue, sessionPlan } from "../../../../lib/study.mjs";
export async function GET(request: Request) {
  try {
    const user = await currentBetaUser(request);
    return json({user: user ? publicUser(user) : null,
      reminder: user ? reminderDue(user) : false,
      plan: sessionPlan(user?.weekly_study_minutes || 60)});
  } catch(e) { return failure(e); }
}
