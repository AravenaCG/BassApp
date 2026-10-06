import { currentBetaUser } from "../../../../lib/beta-auth";
export async function GET(request: Request) { const user=await currentBetaUser(request); return Response.json({user:user?{id:user.id,email:user.email,displayName:user.display_name,weeklyStudyMinutes:user.weekly_study_minutes}:null},{headers:{"Cache-Control":"no-store"}}); }
