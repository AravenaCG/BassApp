import { getSqlPool, sql } from "../../../../lib/azure-sql";
import { bodyOf, failure, json } from "../../../../lib/http";
export async function POST(request:Request) {
  try {
    await bodyOf(request);
    const token=request.headers.get("cookie")?.match(/(?:^|;\s*)appbass_session=([^;]+)/)?.[1];
    if(token) await(await getSqlPool()).request().input("token",sql.VarChar(128),token).query("DELETE dbo.beta_sessions WHERE token=@token");
    return json({ok:true},200,{"Set-Cookie":"appbass_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"});
  } catch(e) { return failure(e); }
}
