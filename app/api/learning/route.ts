import {requireBetaUser} from '../../../lib/beta-auth';
import {getSqlPool} from '../../../lib/azure-sql';
import {bodyOf,failure,json,HttpError} from '../../../lib/http';
import {validateLearning} from '../../../lib/learning-validation.mjs';
import {readLearningData,saveLearningData} from '../../../lib/learning-service.mjs';
export async function GET(request:Request){
 try{const user=await requireBetaUser(request);return json(await readLearningData(await getSqlPool(),user.id));}
 catch(e){return failure(e);}
}
export async function POST(request:Request){
 try{
 const user=await requireBetaUser(request),body=await bodyOf(request);
 let b;try{b=validateLearning(body);}catch{throw new HttpError(400,'Revisá los datos de aprendizaje.');}
 if(!b)throw new HttpError(400,'Revisá los datos de aprendizaje.');
 try{return json(await saveLearningData(await getSqlPool(),user.id,b));}
 catch(e){if((e as {status?:number}).status===409)throw new HttpError(409,(e as Error).message);throw e;}
 }catch(e){return failure(e);}
}
