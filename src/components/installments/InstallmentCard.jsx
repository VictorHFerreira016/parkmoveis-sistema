import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function InstallmentCard({ installment, sale }) {
  return (
    <div className="border border-stone-300 rounded-lg p-4 bg-white h-[270px] flex flex-col justify-between">
      {/* Header */}
      <div className="border-b border-dashed border-stone-300 pb-3">
        <h3 className="font-bold text-xs text-stone-900 mb-1">CARNÊ DE PAGAMENTO</h3>
        <p className="text-xs text-stone-600">
          Parcela {installment.installment_number}/{installment.total_installments}
        </p>
      </div>

      {/* Client Info */}
      <div className="py-3 space-y-1">
        <div>
          <p className="text-xs text-stone-500">Cliente:</p>
          <p className="font-semibold text-sm text-stone-900">{installment.client_name}</p>
        </div>
      </div>

      {/* Payment Info */}
      <div className="py-3 border-t border-dashed border-stone-300 space-y-2">
        <div className="flex justify-between">
          <span className="text-xs text-stone-500">Vencimento:</span>
          <span className="font-semibold text-xs text-stone-900">
            {format(new Date(installment.due_date), "dd/MM/yyyy")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-stone-500">Valor:</span>
          <span className="font-bold text-sm text-stone-900">
            R$ {installment.value?.toFixed(2)}
          </span>
        </div>
        {sale?.payment_method === 'credito_parcelado' && (
          <div className="flex justify-between">
            <span className="text-xs text-stone-500">Forma:</span>
            <span className="text-xs text-stone-900">Cartão de Crédito</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-stone-300">
        <p className="text-xs text-stone-500 text-center">
          Venda #{sale?.id?.slice(0, 8) || '---'}
        </p>
      </div>
    </div>
  );
}