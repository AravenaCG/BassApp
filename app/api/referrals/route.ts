import { requireBetaUser } from "../../../lib/beta-auth";
import { getSqlPool, sql } from "../../../lib/azure-sql";
import { json, failure } from "../../../lib/http";
export async function GET(request:Request) {
  try { const user=await requireBetaUser(request);
    const result=await(await getSqlPool()).request().input("user",sql.UniqueIdentifier,user.id)
      .query("SELECT COUNT(*) AS total FROM dbo.beta_referrals WHERE referrer_id=@user");
    return json({code:user.id,total:result.recordset[0].total});
  } catch(e) { return failure(e); }
}
// Referrals are bound at registration, never by a client-supplied referred user ID.
export async function POST() { return json({error:"Los referidos se vinculan al crear la cuenta desde un enlace de invitación."},405); }
