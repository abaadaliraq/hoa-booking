"use client";
import {useEffect,useRef,useState} from 'react';
import {exportQr,qrPngFile} from '../../lib/exhibition/qr-export';
import styles from './booking.module.css';
export default function SaveQrButton({qr,reference}:{qr:string;reference:string}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[fallback,setFallback]=useState(false),[image,setImage]=useState<{url:string;name:string}|null>(null);
 const lock=useRef(false),url=useRef<string|null>(null);
 useEffect(()=>()=>{if(url.current)URL.revokeObjectURL(url.current);},[]);
 async function save(){
  if(lock.current)return;lock.current=true;setBusy(true);setMessage('');
  try{
   // Decode synchronously so native sharing still belongs to this exact user click.
   const file=qrPngFile(qr,reference);
   if(!url.current)url.current=URL.createObjectURL(file);
   const href=url.current;setImage({url:href,name:file.name});
   const result=await exportQr(file,{
    canShare:typeof navigator.canShare==='function'?data=>navigator.canShare(data):undefined,
    share:typeof navigator.share==='function'?data=>navigator.share(data):undefined,
    download:()=>{const link=document.createElement('a');link.href=href;link.download=file.name;document.body.appendChild(link);link.click();link.remove();},
   });
   setFallback(true);
   setMessage(result==='shared'?'إذا لم تجد خيار حفظ الصورة بقائمة الهاتف، استخدم التنزيل المباشر أدناه.':result==='cancelled'?'أُغلقت خيارات المشاركة. تقدر تستخدم التنزيل المباشر أدناه.':result==='share-unavailable'?'المتصفح لم يفتح خيارات الحفظ. استخدم التنزيل المباشر أو افتح الصورة.':'طُلب تنزيل الصورة. ابحث عنها في الملفات ← التنزيلات؛ إذا لم تنزل، افتح الصورة للحفظ.');
  }catch(e){setFallback(true);setMessage(e instanceof Error?e.message:'تعذر تجهيز الباركود للحفظ.');}
  finally{lock.current=false;setBusy(false);}
 }
 return <>
  <button type="button" className={styles.saveQr} disabled={busy} onClick={()=>void save()}>{busy?'جارٍ تجهيز الصورة…':'حفظ الباركود على الهاتف'}</button>
  {fallback&&image&&<><a href={image.url} download={image.name}>تنزيل صورة PNG</a><a href={image.url} target="_blank" rel="noopener noreferrer">فتح الصورة للحفظ</a></>}
  <p role={message?'status':undefined} className={styles.qrSaveHint}>{message||'يمكنك أيضاً الضغط مطوّلاً على صورة الباركود واختيار حفظ الصورة أو تنزيلها.'}</p>
 </>;
}
