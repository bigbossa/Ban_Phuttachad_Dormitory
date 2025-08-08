import { useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { ReportSelector } from "@/components/reports/ReportSelector";
import { OccupancyChart } from "@/components/reports/charts/OccupancyChart";
import { RevenueChart } from "@/components/reports/charts/RevenueChart";
import { PieCharts } from "@/components/reports/charts/PieCharts";
import { EventsChart } from "@/components/reports/charts/EventsChart";
import { useToast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ReportsPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState("occupancy");
  const [isExporting, setIsExporting] = useState(false);

  const getReportTitle = () => {
    switch(selectedReport) {
      case "occupancy":
        return "Occupancy Trends Report";
      case "revenue":
        return "Revenue Analysis Report";
      case "rooms":
        return "Room Type Distribution Report";
      case "repairs":
        return "Repair Request Analysis Report";
      case "events":
        return "Event Attendance Report";
      default:
        return "Report";
    }
  };

  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      
      // Capture the chart
      const chartElement = document.getElementById('report-container');
      if (!chartElement) {
        throw new Error("Chart element not found");
      }

      const canvas = await html2canvas(chartElement, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1a1b1e' : '#ffffff'
      });

      // Create PDF with proper dimensions
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
      });

      // Calculate dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      // Calculate image dimensions to fit page with margins
      const maxWidth = pageWidth - (margin * 2);
      const maxHeight = pageHeight - (margin * 2) - 20; // 20mm reserved for header
      
      let imgWidth = maxWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = (canvas.width * imgHeight) / canvas.height;
      }

      // Add title
      pdf.setFontSize(16);
      pdf.text(getReportTitle(), margin, margin + 5);
      
      // Add timestamp
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, margin + 12);

      // Center the image horizontally if it's smaller than max width
      const xPos = margin + (maxWidth - imgWidth) / 2;
      
      // Add the image
      pdf.addImage(imgData, 'PNG', xPos, margin + 20, imgWidth, imgHeight);

      // Save the PDF
      pdf.save(`${selectedReport}-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Export successful",
        description: "Your report has been exported as PDF",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your report",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const renderReport = () => {
    switch(selectedReport) {
      case "occupancy":
        return <OccupancyChart />;
      case "revenue":
        return <RevenueChart />;
      case "rooms":
      case "repairs":
        return <PieCharts selectedReport={selectedReport} />;
      case "events":
        return <EventsChart />;
      default:
        return null;
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">View and analyze dormitory data</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={exportToPDF}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </Button>
        </div>
      </div>

      <ReportSelector
        selectedReport={selectedReport}
        setSelectedReport={setSelectedReport}
      />

      <div id="report-container">
        {renderReport()}
      </div>
    </div>
  );
};

export default ReportsPage;
