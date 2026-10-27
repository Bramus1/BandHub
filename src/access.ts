export function accessScreen(configured:boolean,loading:boolean,session:unknown):'setup'|'loading'|'auth'|'workspace'{
  if(!configured)return 'setup';
  if(loading)return 'loading';
  return session?'workspace':'auth';
}
