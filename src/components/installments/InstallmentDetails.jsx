import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, AlertCircle, Clock, DollarSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function InstallmentDetails({ installment, open, onClose, onPaymentComplete }) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: payments = [] } = useQuery({
    queryKey: ['installment-payments', installment?.id],
    queryFn: () => base44.entities.InstallmentPayment.filter({ installment_id: installment.id }),
    enabled: !!installment?.id
  });

  if (!installment) return null;

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const remainingAmount = (installment.value || 0) - totalPaid;

  const handlePayment = async (payFull) => {
    setIsProcessing(true);
    try {
      const amount = payFull ? remainingAmount : parseFloat(paymentAmount);
      
      await base44.entities.InstallmentPayment.create({
        installment_id: installment.id,
        sale_id: installment.sale_id,
        client_name: installment.client_name,
        amount,
        payment_date: paymentDate,
        notes
      });

      if (payFull || (totalPaid + amount) >= installment.value) {
        await base44.entities.Installment.update(installment.id, {
          status: 'pago',
          payment_date: paymentDate
        });
      }

      onPaymentComplete();
      setPaymentAmount('');
      setNotes('');
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    if (installment.status === 'pago') {
      return <Badge className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" /> Pago
      </Badge>;
    }
    const today = new Date();
    const dueDate = new Date(installment.due_date);
    if (dueDate < today) {
      return <Badge className="bg-red-50 text-red-700 border-red-200">
        <AlertCircle className="w-3 h-3 mr-1" /> Atrasado
      </Badge>;
    }
    return <Badge className="bg-amber-50 text-amber-700 border-amber-200">
      <Clock className="w-3 h-3 mr-1" /> Pendente
    </Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-stone-900">Detalhes da Parcela</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Installment Info */}
          <div className="p-4 bg-stone-50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-stone-900">{installment.client_name}</h3>
              {getStatusBadge()}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-stone-500">Parcela</p>
                <p className="font-medium text-stone-900">
                  {installment.installment_number}/{installment.total_installments}
                </p>
              </div>
              <div>
                <p className="text-stone-500">Vencimento</p>
                <p className="font-medium text-stone-900">
                  {format(new Date(installment.due_date), "dd/MM/yyyy")}
                </p>
              </div>
              <div>
                <p className="text-stone-500">Valor Original</p>
                <p className="font-medium text-stone-900">
                  R$ {installment.value?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-stone-500">Saldo Restante</p>
                <p className="font-semibold text-green-700">
                  R$ {remainingAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {payments.length > 0 && (
            <div>
              <h3 className="font-semibold text-stone-900 mb-3">Histórico de Pagamentos</h3>
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-stone-900">
                        R$ {payment.amount?.toFixed(2)}
                      </span>
                      <span className="text-sm text-stone-500">
                        {format(new Date(payment.payment_date), "dd/MM/yyyy")}
                      </span>
                    </div>
                    {payment.notes && (
                      <p className="text-sm text-stone-600">{payment.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Form */}
          {remainingAmount > 0 && (
            <div className="space-y-4 p-4 border border-stone-200 rounded-lg">
              <h3 className="font-semibold text-stone-900">Registrar Pagamento</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-stone-600 text-sm">Valor a Pagar (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="mt-1.5 border-stone-200"
                    placeholder={`Máx: ${remainingAmount.toFixed(2)}`}
                  />
                </div>
                <div>
                  <Label className="text-stone-600 text-sm">Data do Pagamento</Label>
                  <Input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="mt-1.5 border-stone-200"
                  />
                </div>
              </div>

              <div>
                <Label className="text-stone-600 text-sm">Observações</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1.5 border-stone-200 resize-none"
                  rows={2}
                  placeholder="Informações adicionais sobre o pagamento..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handlePayment(false)}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || isProcessing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Pagar Parcialmente
                </Button>
                <Button
                  onClick={() => handlePayment(true)}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Pagar Total (R$ {remainingAmount.toFixed(2)})
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-stone-200"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}