import { currentBetaUser } from "../../../../lib/beta-auth";
export async function GET(request: Request) { const user=await currentBetaUser(request); return Response.json({user:user?{id:user.id,email:user.email,displayName:user.display_name}:null},{headers:{"Cache-Control":"no-store"}}); }
