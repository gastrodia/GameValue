var keep:any = {};

export function get(key:any):any{
  return keep[key];
}

export function set(key:any,value:any){
  keep[key] = value;
}
