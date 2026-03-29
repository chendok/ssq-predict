import React, { useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/common/ui/button';
import { Download, ChevronRight, Home, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({ title, lastUpdated, children }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    const element = contentRef.current;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff', // Ensure white background for PDF
        windowWidth: element.scrollWidth,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Handle multi-page content (simplified for now, usually fits or scales)
      // For very long content, proper pagination is complex with html2canvas.
      // We'll just fit it or let it span.

      if (pdfHeight > pdf.internal.pageSize.getHeight()) {
          // If content is longer than one page, we might need a better approach or just accept it
          // For now, let's just add the image. If it's too long, it will be cut off or scaled.
          // A better approach for long text is adding text directly to PDF, but that requires fonts.
          // Or splitting the canvas.

          let heightLeft = pdfHeight;
          let position = 0;
          const pageHeight = pdf.internal.pageSize.getHeight();

          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;
          }
      } else {
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`${title}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF生成失败，请稍后重试');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-muted-foreground mb-6">
          <Link to="/" className="flex items-center hover:text-primary transition-colors">
            <Home size={14} className="mr-1" />
            首页
          </Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="flex items-center text-foreground font-medium">
            <FileText size={14} className="mr-1" />
            {title}
          </span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
            <p className="text-muted-foreground text-sm">
              最后更新日期：{lastUpdated}
            </p>
          </div>
          <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
            <Download size={16} />
            下载 PDF 版本
          </Button>
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div ref={contentRef} className="p-8 md:p-12 bg-white text-slate-900">
                {/* PDF Header - Visible in UI but styled for PDF export */}
                <div className="mb-8 border-b pb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2 text-slate-900">{title}</h2>
                        <p className="text-sm text-slate-500">生效日期: {lastUpdated}</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <span className="text-xl font-bold text-slate-900">SSQ Master</span>
                    </div>
                </div>

                <div className="prose prose-slate max-w-none">
                    {children}
                </div>

                <div className="mt-12 pt-8 border-t text-center text-sm text-slate-500">
                    <p>© {new Date().getFullYear()} SSQ Predict Master. All rights reserved.</p>
                    <p className="mt-1">本文件具有法律效力，请妥善保管。</p>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default LegalLayout;
