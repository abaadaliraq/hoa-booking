export function qrPngFile(qr:string,reference:string):File {
  if(!/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(qr)||qr.length>2_000_000)throw Error('صورة الباركود غير متوفرة للحفظ.');
  const binary=atob(qr.slice(qr.indexOf(',')+1));
  const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
  if(![137,80,78,71,13,10,26,10].every((value,i)=>bytes[i]===value))throw Error('تعذر تجهيز صورة الباركود.');
  const name=reference.replace(/[^A-Za-z0-9_-]/g,'').slice(0,80)||'booking';
  return new File([bytes],`ABAAD-${name}.png`,{type:'image/png'});
}
export type QrExportResult='shared'|'cancelled'|'download-requested'|'share-unavailable';
export async function exportQr(file:File,environment:{canShare?:(data:ShareData)=>boolean;share?:(data:ShareData)=>Promise<void>;download:()=>void}):Promise<QrExportResult>{
  let supported=false;
  try{supported=!!environment.share&&environment.canShare?.({files:[file]})===true;}catch{/* Use the explicit download path when capability detection fails. */}
  if(supported){
    try{await environment.share!({files:[file],title:'باركود حجز بيت التحفيات'});return 'shared';}
    catch(e){return e&&typeof e==='object'&&'name'in e&&e.name==='AbortError'?'cancelled':'share-unavailable';}
  }
  environment.download();
  return 'download-requested';
}
