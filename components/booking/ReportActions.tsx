"use client";

import html2canvas from "html2canvas";
import styles from "./booking.module.css";

export default function ReportActions({
  reportRef,
}: {
  reportRef: React.RefObject<HTMLDivElement | null>;
}) {
  function printReport() {
    window.print();
  }

  async function shareAsImage() {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      backgroundColor: "#f7f1e8",
    });

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], "house-of-antiques-booking.png", {
        type: "image/png",
      });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "تقرير حجز بيت التحفيات",
          files: [file],
        });
      } else {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "house-of-antiques-booking.png";
        link.click();
      }
    });
  }

  return (
    <div className={styles.reportActions}>
      <button type="button" onClick={printReport}>
        طباعة / PDF
      </button>

      <button type="button" onClick={shareAsImage}>
        مشاركة كصورة
      </button>
    </div>
  );
}