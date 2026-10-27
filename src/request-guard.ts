export function createRequestGuard(){
 let generation=0;
 return {invalidate(){generation++},begin(){const request=++generation;return ()=>request===generation}};
}
