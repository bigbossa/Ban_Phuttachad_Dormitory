import React, { useMemo, useState } from "react";
import Select from "react-select";

import provincesRaw from "../../json/thai_provinces.json";
import amphuresRaw from "../../json/thai_amphures.json";
import tambonsRaw from "../../json/thai_tambons.json";

interface Tambon {
  id: number;
  name_th: string;
  zip_code: number;
  amphure_id: number;
}

interface Amphure {
  id: number;
  name_th: string;
  province_id: number;
  districts: Tambon[];
}

interface Province {
  id: number;
  name_th: string;
  amphoes: Amphure[];
}

function transformData(): Province[] {
  const tambonsByAmphure: Record<number, Tambon[]> = {};
  tambonsRaw.forEach((tambon: Tambon) => {
    if (!tambonsByAmphure[tambon.amphure_id]) tambonsByAmphure[tambon.amphure_id] = [];
    tambonsByAmphure[tambon.amphure_id].push(tambon);
  });

  const amphoesWithDistricts: Amphure[] = amphuresRaw.map((amp: any) => ({
    ...amp,
    districts: tambonsByAmphure[amp.id] || [],
  }));

  return provincesRaw.map((prov: any) => ({
    ...prov,
    amphoes: amphoesWithDistricts.filter((amp) => amp.province_id === prov.id),
  }));
}

export default function ThaiAddressFinder() {
  const data = useMemo(() => transformData(), []);

  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedAmphoe, setSelectedAmphoe] = useState<Amphure | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<Tambon | null>(null);

  // ตัวเลือกสำหรับ React Select
  const provinceOptions = data.map((p) => ({ value: p.id, label: p.name_th }));
  const amphoeOptions = selectedProvince
    ? selectedProvince.amphoes.map((a) => ({ value: a.id, label: a.name_th }))
    : [];
  const districtOptions = selectedAmphoe
    ? selectedAmphoe.districts.map((d) => ({ value: d.id, label: d.name_th }))
    : [];

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-lg font-semibold mb-4">เลือกที่อยู่ (จังหวัด, อำเภอ, ตำบล)</h2>

      {/* จังหวัด */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">จังหวัด</label>
        <Select
          options={provinceOptions}
          value={selectedProvince ? { value: selectedProvince.id, label: selectedProvince.name_th } : null}
          onChange={(option) => {
            const prov = data.find((p) => p.id === option?.value) || null;
            setSelectedProvince(prov);
            setSelectedAmphoe(null);
            setSelectedDistrict(null);
          }}
          placeholder="เลือกจังหวัด"
          isClearable
        />
      </div>

      {/* อำเภอ */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">อำเภอ</label>
        <Select
          options={amphoeOptions}
          value={selectedAmphoe ? { value: selectedAmphoe.id, label: selectedAmphoe.name_th } : null}
          onChange={(option) => {
            if (!selectedProvince) return;
            const amp = selectedProvince.amphoes.find((a) => a.id === option?.value) || null;
            setSelectedAmphoe(amp);
            setSelectedDistrict(null);
          }}
          placeholder={selectedProvince ? "เลือกอำเภอ" : "กรุณาเลือกจังหวัดก่อน"}
          isClearable
          isDisabled={!selectedProvince}
        />
      </div>

      {/* ตำบล */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">ตำบล</label>
        <Select
          options={districtOptions}
          value={selectedDistrict ? { value: selectedDistrict.id, label: selectedDistrict.name_th } : null}
          onChange={(option) => {
            if (!selectedAmphoe) return;
            const dist = selectedAmphoe.districts.find((d) => d.id === option?.value) || null;
            setSelectedDistrict(dist);
          }}
          placeholder={selectedAmphoe ? "เลือกตำบล" : "กรุณาเลือกอำเภอก่อน"}
          isClearable
          isDisabled={!selectedAmphoe}
        />
      </div>

      {/* รหัสไปรษณีย์ */}
      <div>
        <label className="block mb-1 font-medium">รหัสไปรษณีย์</label>
        <input
          type="text"
          readOnly
          className="w-full border rounded px-3 py-2 bg-gray-100"
          value={selectedDistrict?.zip_code || ""}
          placeholder="รหัสไปรษณีย์"
        />
      </div>
    </div>
  );
}
