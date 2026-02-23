import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrintInstallments() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const saleId = urlParams.get('sale_id');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Buscar os dados da venda
  const { 
    data: sale, 
    isLoading: isLoadingSale, 
    error: errorSale 
  } = useQuery({
    queryKey: ['sale', saleId],
    queryFn: async () => {
      try {
        console.log('Buscando venda com ID:', saleId);
        const response = await api.entities.Sale.filter({ id: saleId });
        console.log('Resposta da venda:', response);
        return response[0] || null;
      } catch (error) {
        console.error('Erro ao buscar venda:', error);
        throw error;
      }
    },
    enabled: !!saleId
  });

  // Buscar as parcelas da venda
  const { 
    data: installments = [], 
    isLoading: isLoadingInstallments, 
    error: errorInstallments,
    isFetching 
  } = useQuery({
    queryKey: ['sale-installments', saleId],
    queryFn: async () => {
      try {
        console.log('Buscando parcelas para sale_id:', saleId);
        
        // Primeiro, tente buscar com o parâmetro de ordenação
        let response;
        try {
          response = await api.entities.Installment.filter({ sale_id: saleId }, 'installment_number');
        } catch (e) {
          // Se falhar, tente sem o parâmetro de ordenação
          console.log('Tentando sem ordenação...');
          response = await api.entities.Installment.filter({ sale_id: saleId });
        }
        
        console.log('Resposta das parcelas:', response);
        
        // Se for um objeto com propriedade data, extraia os dados
        if (response && response.data) {
          return response.data;
        }
        
        // Se já for um array, retorne direto
        if (Array.isArray(response)) {
          return response;
        }
        
        console.warn('Formato inesperado de resposta:', response);
        return [];
      } catch (error) {
        console.error('Erro ao buscar parcelas:', error);
        throw error;
      }
    },
    enabled: !!saleId && !!sale // Aguardar a venda ser carregada primeiro
  });

  // DEBUG: Log dos dados
  useEffect(() => {
    if (mounted) {
      console.log('=== DADOS DA VENDA ===');
      console.log('Sale:', sale);
      console.log('Sale ID:', saleId);
      console.log('Installments:', installments);
      console.log('Número de parcelas:', installments.length);
      console.log('isLoadingSale:', isLoadingSale);
      console.log('isLoadingInstallments:', isLoadingInstallments);
      console.log('isFetching:', isFetching);
    }
  }, [sale, installments, mounted, saleId, isLoadingSale, isLoadingInstallments, isFetching]);

  const handlePrint = () => {
    window.print();
  };

  // Formatar CPF
  const formatCPF = (cpf) => {
    if (!cpf) return 'N/A';
    // Remove caracteres não numéricos
    const cleaned = cpf.toString().replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `***.***.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    }
    return cpf;
  };

  // Formatar valor monetário
  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return 'N/A';
    }
  };

  // Agrupar em conjuntos de 4 parcelas (2 linhas x 2 colunas por página)
  const groupedInstallments = [];
  for (let i = 0; i < installments.length; i += 4) {
    groupedInstallments.push(installments.slice(i, i + 4));
  }

  // Mostrar loading
  if (isLoadingSale || isLoadingInstallments || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-stone-900" />
          <p className="text-stone-600">Carregando parcelas...</p>
        </div>
      </div>
    );
  }

  // Mostrar erro
  if (errorSale || errorInstallments) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar os dados</p>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  // Se não houver venda
  if (!sale && mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600 mb-4">Venda não encontrada</p>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Controles de impressão - ocultos na impressão */}
      <div className="print:hidden bg-white border-b border-stone-200 px-4 py-4 mb-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-stone-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-xl font-bold text-stone-900">
            Imprimir Carnê - {installments.length} parcela(s)
          </h1>
          <Button
            onClick={handlePrint}
            className="bg-stone-900 hover:bg-stone-800"
            disabled={installments.length === 0}
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* DEBUG INFO - Apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && mounted && (
        <div className="print:hidden max-w-7xl mx-auto px-4 mb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm">
            <p className="font-semibold text-yellow-800">DEBUG INFO:</p>
            <p>Sale ID: {saleId}</p>
            <p>Venda encontrada: {sale ? 'Sim' : 'Não'}</p>
            <p>Parcelas encontradas: {installments.length}</p>
            {installments.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">Primeira parcela:</p>
                <pre className="text-xs">{JSON.stringify(installments[0], null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo para impressão */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {groupedInstallments.length > 0 ? (
          groupedInstallments.map((pageGroup, pageIndex) => (
            <div
              key={pageIndex}
              className="bg-white shadow-sm page-break-after print:shadow-none"
              style={{
                width: '210mm',
                minHeight: '297mm',
                margin: '0 auto 24px auto',
                padding: '15mm',
                boxSizing: 'border-box',
                position: 'relative'
              }}
            >
              {/* Layout de grade 2x2 para 4 carnês por página */}
              <div className="grid grid-cols-2 grid-rows-2 gap-8 h-full">
                {pageGroup.map((installment, index) => {
                  // Usar o valor correto da parcela - verifica diferentes propriedades possíveis
                  const installmentValue = installment.value || installment.amount || 0;
                  
                  return (
                    <div
                      key={installment.id || index}
                      className="border-2 border-dashed border-gray-300 p-4 print:border-solid print:border-gray-800"
                      style={{
                        minHeight: '120mm',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      {/* Cabeçalho do carnê */}
                      <div className="text-center mb-4">
                        <h2 className="text-lg font-bold uppercase print:text-xl">
                          RECIBO DE PARCELA
                        </h2>
                        <div className="text-sm text-gray-600 print:text-base">
                          Parcela {installment.installment_number || (index + 1)} de {installments.length}
                        </div>
                      </div>

                      {/* Linha separadora */}
                      <div className="border-t-2 border-gray-800 mb-4"></div>

                      {/* Conteúdo em duas colunas - NOVA ESTRUTURA */}
                      <div className="mb-4">
                        {/* Primeira linha: NOME | NOME */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="font-semibold text-sm print:text-base">NOME:</div>
                            <div className="text-lg print:text-xl font-bold border-b border-gray-300 pb-1">
                              {sale?.customer_name || installment.client_name || 'Cliente'}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-sm print:text-base">NOME:</div>
                            <div className="text-lg print:text-xl font-bold border-b border-gray-300 pb-1">
                              {sale?.customer_name || installment.client_name || 'Cliente'}
                            </div>
                          </div>
                        </div>

                        {/* Segunda linha: CPF | CPF */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="font-semibold text-sm print:text-base">CPF:</div>
                            <div className="text-lg print:text-xl border-b border-gray-300 pb-1">
                              {formatCPF(sale?.customer_cpf || installment.customer_cpf || '')}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-sm print:text-base">CPF:</div>
                            <div className="text-lg print:text-xl border-b border-gray-300 pb-1">
                              {formatCPF(sale?.customer_cpf || installment.customer_cpf || '')}
                            </div>
                          </div>
                        </div>

                        {/* Terceira linha: ENDEREÇO | ENDEREÇO */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="font-semibold text-sm print:text-base">ENDEREÇO:</div>
                            <div className="text-sm print:text-base border-b border-gray-300 pb-1">
                              {sale?.customer_address || installment.customer_address || 'Endereço não informado'}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-sm print:text-base">ENDEREÇO:</div>
                            <div className="text-sm print:text-base border-b border-gray-300 pb-1">
                              {sale?.customer_address || installment.customer_address || 'Endereço não informado'}
                            </div>
                          </div>
                        </div>

                        {/* Quarta linha: VALOR | VENCIMENTO */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="font-semibold text-sm print:text-base">VALOR:</div>
                            <div className="text-lg print:text-xl font-bold border-b border-gray-300 pb-1">
                              {formatCurrency(installmentValue)}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-sm print:text-base">VEN.:</div>
                            <div className="text-lg print:text-xl font-bold border-b border-gray-300 pb-1">
                              {formatDate(installment.due_date)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rodapé do carnê */}
                      <div className="mt-6 space-y-2">
                        <div className="border-t-2 border-gray-800"></div>
                        
                        {/* Linhas para assinatura */}
                        <div className="mt-4 pt-4 border-t border-dashed border-gray-400">
                          <div className="text-center text-sm print:text-base">
                            ___________________________________________
                          </div>
                          <div className="text-center text-xs print:text-sm mt-1">
                            Assinatura do Responsável
                          </div>
                        </div>
                        
                        <div className="text-center text-xs print:text-sm text-gray-600 mt-2">
                          ID: {installment.id ? installment.id.slice(0, 8) : `P${installment.installment_number}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Se houver menos de 4 carnês na última página */}
              {pageGroup.length < 4 && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 4 - pageGroup.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="border-2 border-dashed border-gray-200 print:border-none"
                      style={{
                        position: 'absolute',
                        width: 'calc(50% - 16px)',
                        height: 'calc(50% - 16px)',
                        left: i % 2 === 0 ? '15mm' : 'calc(50% + 8px)',
                        top: i < 2 ? '15mm' : 'calc(50% + 8px)',
                        margin: '8px'
                      }}
                    ></div>
                  ))}
                </div>
              )}

              {/* Número da página */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm print:text-base text-gray-500">
                Página {pageIndex + 1} de {groupedInstallments.length}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-stone-500 text-lg">
              {sale ? 'Nenhuma parcela encontrada para esta venda.' : 'Venda não encontrada.'}
            </p>
            <Button
              onClick={() => navigate(-1)}
              className="mt-4"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
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
            background: white !important;
            -webkit-print-color-adjust: exact;
          }

          .page-break-after {
            page-break-after: always;
            break-after: page;
            margin-bottom: 0 !important;
          }

          .page-break-after:last-child {
            page-break-after: auto;
          }

          /* Ocultar elementos não necessários na impressão */
          .print\\:hidden {
            display: none !important;
          }

          /* Melhorar a qualidade da impressão */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Garantir que borders sejam visíveis */
          .border-gray-800 {
            border-color: #1f2937 !important;
            border-width: 1.5pt !important;
          }

          /* Ajustar tamanhos de fonte para impressão */
          .print\\:text-xl {
            font-size: 14pt !important;
          }

          .print\\:text-base {
            font-size: 11pt !important;
          }

          .print\\:text-sm {
            font-size: 10pt !important;
          }
        }

        @media screen {
          /* Estilo para visualização na tela */
          .page-break-after {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
        }
      `}} />
    </div>
  );
}