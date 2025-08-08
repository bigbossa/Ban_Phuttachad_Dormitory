import React, { forwardRef, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import ownerSignature from "@/image/sigPadOwner.jpg";
import * as z from "zod";

// ฟังก์ชันแปลงเลขเป็นข้อความภาษาไทย (รองรับถึงหลักล้าน)
function numberToThaiText(num: number): string {
  if (num === 0) return "ศูนย์บาทถ้วน";
  const numberText = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const positionText = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];
  let txt = "";
  let numberStr = num.toString();
  let len = numberStr.length;
  for (let i = 0; i < len; i++) {
    let digit = parseInt(numberStr.charAt(i));
    let position = len - i - 1;
    if (digit === 0) continue;
    if (position === 0 && digit === 1 && len > 1) {
      txt += "เอ็ด";
    } else if (position === 1 && digit === 2) {
      txt += "ยี่";
    } else if (position === 1 && digit === 1) {
      txt += "";
    } else {
      txt += numberText[digit];
    }
    txt += positionText[position];
  }
  return txt + "บาทถ้วน";
}

const userSchema = z.object({
  sigPadTenant: z.string().email("กรุณาเซ็นลายเซ็น"),
});

interface ContractPreviewProps {
  firstName: string;
  lastName: string;
  room_number: string; 
  startDate: string;
  endDate: string;
  price?: number;
  contractDate?: string;
  contractPlace?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export const ContractPreview = forwardRef<HTMLDivElement, ContractPreviewProps>(
  (
    {
      firstName,
      lastName,
      room_number,
      startDate,
      endDate,
      price,
      contractDate,
      contractPlace,
      address,
      phone,
      email,
    },
    ref
  ) => {
    const formattedPrice = typeof price === "number" ? price.toLocaleString() : "0";
    const priceText = typeof price === "number" ? numberToThaiText(price) : "ศูนย์บาทถ้วน";
    const currentDate = new Date().toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const sigPadTenant = useRef<SignatureCanvas>(null);

    return (
      <>
       <div className="bg-gray-500 print:bg-white flex justify-center items-center min-h-screen">
        <link href="https://fonts.googleapis.com/css2?family=Sarabun&display=swap" rel="stylesheet" />
          <div
            ref={ref}
          className="contract-a4 bg-white border p-5 text-xs leading-relaxed text-gray-800 shadow-lg"
          style={{
            width: "210mm",
            height: "297mm",
            fontFamily: "'Sarabun', sans-serif",
            boxSizing: "border-box",
            padding: "20mm",
          }}

          >
            <h2 className="text-center text-2xl font-bold mb-6">สัญญาเช่าห้องพัก</h2>
            <div className="flex flex-col items-end mb-4 px-4 text-right">
              <p>ทำที่ {contractPlace || "หอพักบ้านพุทธชาติ นครปฐม"}</p>
              <p>วันที่ {contractDate || currentDate}</p>
            </div>
            <div className="whitespace-pre-line mb-4">
              &emsp;&emsp;&emsp;สัญญาเช่าฉบับนี้ทำขึ้นระหว่าง คุณ จตุรภัทร พลรบ ดังที่อยู่ข้างต้น ซึ่งต่อไปในสัญญานี้จะเรียกว่า “ผู้ให้เช่า”  
              ฝ่ายหนึ่งกับ คุณ {firstName} {lastName} อยู่ที่ {address || ".............................................................."}   
              โทรศัพท์ {phone || "..................................................."}  
              อีเมล {email || "..................................................."} 
              ซึ่งต่อไปในสัญญานี้จะเรียกว่า “ผู้เช่า” ฝ่ายหนึ่ง คู่สัญญาได้ตกลงกันดังนี้
            </div>
            <p className="mb-2">&emsp;&emsp;&emsp;
              <strong>ข้อ 1.</strong> ผู้ให้เช่าตกลงให้เช่าและผู้เช่าตกลงเช่าห้องพักเลขที่ {room_number} ตั้งแต่วันที่ {startDate} ถึง {endDate} 
              ในอาคารของผู้ให้เช่าเพื่อเป็นที่อยู่อาศัยภายใต้ระเบียบที่ผู้ให้เช่ากำหนด โดยเฉพาะไม่ก่อกวน ต้องสงบในยามวิกาล ไม่ทะเลาะวิวาท ไม่ทำผิดศีลธรรมและกฎหมาย
            </p>
            <p className="mb-2">&emsp;&emsp;&emsp;
              <strong>ข้อ 2.</strong> ผู้เช่าตกลงชำระค่าเช่าให้แก่ผู้ให้เช่าล่วงหน้า 1 เดือนและเป็นรายเดือน 
              โดยกำหนดชำระค่าเช่าภายในวันที่ 5 ของทุกเดือน ในอัตราค่าเช่าเดือนละ {formattedPrice} บาท ({priceText})
            </p>
            <p className="mb-2">&emsp;&emsp;&emsp;
              <strong>ข้อ 3.</strong> ผู้เช่าตกลงจะนำค่าเช่ามาชำระให้ ณ ที่ทำการของผู้ให้เช่าหรือตัวแทนภายในกำหนด
            </p>
            <p className="mb-2">&emsp;&emsp;&emsp;
              <strong>ข้อ 4.</strong> ห้ามเช่าช่วงเป็นอันขาด เว้นแต่ผู้ให้เช่าตกลงยินยอมด้วยเป็นลายลักษณ์อักษร
            </p>
            <p className="mb-2">&emsp;&emsp;&emsp;
              <strong>ข้อ 5.</strong> ค่าน้ำประปา ค่าไฟฟ้า และค่าใช้จ่ายอื่น ถ้ามิให้เรียกเก็บตามอัตราในมิเตอร์หรือโดยเฉลี่ยจากผู้เช่า
            </p>
            <p className="mb-2">&emsp;&emsp;&emsp;
              <strong>ข้อ 6.</strong> ผู้เช่าต้องบำรุงรักษาห้องเช่ารวมถึงอุปกรณ์ไฟฟ้า มุ้งลวด กระจกบานเกล็ด กุญแจห้อง กลอนประตู พัดลม หลอดไฟ เสื่อ ฝาผนัง และอื่น ๆ 
              ให้อยู่ในสภาพที่ดีอยู่เสมอ หากเกิดชำรุดเสียหายไม่ว่าด้วยเหตุใดก็ตาม ผู้เช่าต้องทำให้กลับคืนสู่สภาพเดิมทันที ด้วยค่าใช้จ่ายของผู้เช่า
            </p>
            <p className="mb-2">&emsp;&emsp;&emsp;
              <strong>ข้อ 7.</strong> ผู้เช่ามีหน้าที่รักษาความสะอาดตามกฎหมาย ไม่เก็บวัตถุไวไฟหรือสิ่งอันตรายหรือสิ่งต้องห้ามตามกฎหมาย 
              ผู้เช่ายินยอมให้ผู้ให้เช่าเข้าตรวจความถูกต้องเรียบร้อยในห้อง
            </p>
            <p className="mb-2">&emsp;&emsp;&emsp;
              <strong>ข้อ 8.</strong> ผู้เช่าจะดัดแปลงต่อเติมหรือรื้อถอนทรัพย์สินที่เช่าทั้งหมดหรือบางส่วนได้ ต่อเมื่อได้รับความยินยอมเป็นหนังสือจากผู้ให้เช่า
            </p>
            <p className="mb-2">&emsp;&emsp;&emsp;
              <strong>ข้อ 9.</strong> ถ้าผู้เช่าผิดสัญญาไม่ชำระค่าเช่าตามกำหนดไว้ในข้อ 2 ผู้ให้เช่าต้องทวงสิทธิไว้ในการกลับเข้าครอบครองทรัพย์สินที่เช่าตามสัญญานี้โดยฉบับพลัน
               และผู้เช่ายอมให้ผู้ให้เช่าย้ายบุคคลหรือทรัพย์สินของผู้เช่าออกไปจากทรัพย์ที่เช่าตามสัญญานี้
            </p>
            <p className="mb-2">&emsp;&emsp;&emsp;
              <strong>ข้อ 10.</strong> ผู้เช่ามีหน้าที่แจ้งให้ผู้ให้เช่าทราบล่วงหน้าในการเลิกเช่าไม่น้อยกว่าสามสิบวันจึงจะได้รับเงินล่วงหน้าคืนหรืออยู่อาศัยโดยหักจากการชำระล่วงหน้าตามข้อ 2
            </p>
            <p className="mb-2">&emsp;&emsp;&emsp;
              <strong>ข้อ 11.</strong> ในวันทำสัญญานี้ ผู้เช่าได้ตรวจตราทรัพย์สินที่เช่าแล้วเห็นว่ามีสภาพปกติดีทุกประการและผู้ให้เช่าได้ส่งมอบทรัพย์สินที่เช่าให้แก่ผู้เช่าแล้ว
            </p>
            <p className="mb-2">&emsp;&emsp;&emsp;
              <strong>ข้อ 12.</strong> ผู้เช่าได้มอบสำเนาบัตรประจำตัว สำเนาทะเบียนบ้านและเอกสารแสดงตัวตามกฎหมายที่ไม่หมดอายุพร้อมรูปถ่าย ………… รูป ให้ไว้กับผู้ให้เช่า
            </p>
            <p> คู่สัญญาทั้งสองฝ่ายได้อ่านและทำความเข้าใจดีแล้ว จึงลงลายมือชื่อไว้เป็นหลักฐาน</p>

            <div className="grid grid-cols-2 gap-8 mt-10 text-center">
            <div>
              <p className="mb-1">ลงชื่อผู้เช่า</p>
              <SignatureCanvas
                ref={sigPadTenant}
                penColor="black"
                canvasProps={{ width: 250, height: 100, className: " mx-auto  w-[250px] h-[100px] object-contain" }}
              />
              <p className="mt-2">(คุณ {firstName} {lastName})</p>
            </div>

            <div>
              <p className="mb-1">ลงชื่อผู้ให้เช่า</p>
             <img
                src={ownerSignature}
                alt="Owner signature"
                className="mx-auto  w-[250px] h-[100px] object-contain"
              />
              <p className="mt-2">(คุณ จตุรภัทร พลรบ)</p>
            </div>
          </div>
          </div>
        </div>
      </>
    );
  }
);