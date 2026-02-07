import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import InstallmentCard from '@/components/installments/InstallmentCard';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrintInstallments() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const saleId = urlParams.get('sale_id');

  const { data: sale } = useQuery({
    queryKey: ['sale', saleId],
    queryFn: async () => {
      const sales = await base44.entities.Sale.filter({ id: saleId });
      return sales[0];
    },
    enabled: !!saleId
  });

  const { data: installments = [] } = useQuery({
    queryKey: ['sale-installments', saleId],
    queryFn: () => base44.entities.Installment.filter({ sale_id: saleId }, 'installment_number'),
    enabled: !!saleId
  });

  const handlePrint = () => {
    window.print();
  };

  // Group installments in sets of 4 for each page
  const pages = [];
  for (let i = 0; i < installments.length; i += 4) {
    pages.push(installments.slice(i, i + 4));
  }

  return (
    <div>
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden bg-white border-b border-stone-200 px-4 py-4 mb-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-stone-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-xl font-bold text-stone-900">Imprimir Carnê</h1>
          <Button
            onClick={handlePrint}
            className="bg-stone-900 hover:bg-stone-800"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Print Content */}
      <div className="max-w-7xl mx-auto px-4">
        {pages.map((pageInstallments, pageIndex) => (
          <div
            key={pageIndex}
            className="bg-white page-break-after"
            style={{
              width: '210mm',
              minHeight: '297mm',
              margin: '0 auto',
              padding: '20mm',
              boxSizing: 'border-box'
            }}
          >
            <div className="grid grid-cols-1 gap-8">
              {pageInstallments.map((installment) => (
                <InstallmentCard
                  key={installment.id}
                  installment={installment}
                  sale={sale}
                />
              ))}
            </div>
          </div>
        ))}

        {installments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-stone-500">Nenhuma parcela encontrada para esta venda.</p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          
          body {
            margin: 0;
            padding: 0;
          }

          .page-break-after {
            page-break-after: always;
          }

          .page-break-after:last-child {
            page-break-after: auto;
          }
        }
      `}} />
    </div>
  );
}