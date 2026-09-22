import nodemailer from "nodemailer";

export function emailConfigured(){return Boolean(process.env.SMTP_USER&&process.env.SMTP_PASS)}
function transporter(){
  if(!emailConfigured())return null;
  return nodemailer.createTransport({host:process.env.SMTP_HOST||"smtp.gmail.com",port:Number(process.env.SMTP_PORT||465),secure:String(process.env.SMTP_SECURE??"true")==="true",auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
}
export async function sendEmail(to,subject,text){
  const tx=transporter();if(!tx)return {sent:false,reason:"SMTP not configured"};
  await tx.sendMail({from:process.env.EMAIL_FROM||process.env.SMTP_USER,to,subject,text});
  return {sent:true};
}
