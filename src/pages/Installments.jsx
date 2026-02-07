import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Calendar, CheckCircle, AlertCircle, Clock, DollarSign, Eye, Printer } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import InstallmentDetails from '@/components/installments/InstallmentDetails';
import { createPageUrl } from '@/utils';

export default function Installments() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: installments = [], isLoading } = useQuery({
    queryKey: ['installments'],
    queryFn: () => base44.entities.Installment.list('due_date')
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list()
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Installment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments'] });
      queryClient.invalidateQueries({ queryKey: ['installment-payments'] });
    }
  });

  const handlePaymentComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['installments'] });
    queryClient.invalidateQueries({ queryKey: ['installment-payments'] });
    setSelectedInstallment(null);
  };

  const getSaleForInstallment = (installment) => {
    return sales.find(s => s.id === installment.sale_id);
  };

  const getSaleInstallments = (saleId) => {
    return installments.filter(i => i.sale_id === saleId);
  };

  const getInstallmentStatus = (installment) => {
    if (installment.status === 'pago') return 'pago';
    const today = new Date();
    const dueDate = new Date(installment.due_date);
    if (isBefore(dueDate, today)) return 'atrasado';
    return 'pendente';
  };

  const filteredInstallments = installments
    .filter(inst => {
      const matchesSearch = inst.client_name?.toLowerCase().includes(search.toLowerCase());
      const status = getInstallmentStatus(inst);
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'pendente' && status === 'pendente') ||
        (statusFilter === 'atrasado' && status === 'atrasado') ||
        (statusFilter === 'pago' && status === 'pago');
      return matchesSearch && matchesStatus;
    })
    .map(inst => ({
      ...inst,
      computedStatus: getInstallmentStatus(inst)
    }));

  const stats = {
    total: installments.length,
    pendente: installments.filter(i => getInstallmentStatus(i) === 'pendente').length,
    atrasado: installments.filter(i => getInstallmentStatus(i) === 'atrasado').length,
    pago: installments.filter(i => i.status === 'pago').length,
    totalValue: installments.filter(i => getInstallmentStatus(i) !== 'pago').reduce((sum, i) => sum + (i.value || 0), 0)
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pago':
        return <Badge className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" /> Pago
        </Badge>;
      case 'atrasado':
        return <Badge className="bg-red-50 text-red-700 border-red-200">
          <AlertCircle className="w-3 h-3 mr-1" /> Atrasado
        </Badge>;
      default:
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="w-3 h-3 mr-1" /> Pendente
        </Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Parcelas</h1>
        <p className="text-stone-500 mt-1">Gerenciamento de parcelas a receber</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-stone-100">
          <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5 text-stone-600" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{stats.total}</p>
          <p className="text-sm text-stone-500">Total</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-stone-100">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{stats.pendente}</p>
          <p className="text-sm text-stone-500">Pendentes</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-stone-100">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{stats.atrasado}</p>
          <p className="text-sm text-stone-500">Atrasadas</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-stone-100">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{stats.pago}</p>
          <p className="text-sm text-stone-500">Pagas</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-stone-100">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-stone-900">
            {stats.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-sm text-stone-500">A Receber</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Buscar por cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-stone-100">
            <TabsTrigger value="all" className="data-[state=active]:bg-white">Todas</TabsTrigger>
            <TabsTrigger value="pendente" className="data-[state=active]:bg-white">Pendentes</TabsTrigger>
            <TabsTrigger value="atrasado" className="data-[state=active]:bg-white">Atrasadas</TabsTrigger>
            <TabsTrigger value="pago" className="data-[state=active]:bg-white">Pagas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Installments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-5 border border-stone-100 animate-pulse">
              <div className="h-5 bg-stone-100 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-stone-100 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : filteredInstallments.length > 0 ? (
        <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Parcela</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Vencimento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredInstallments.map((installment) => (
                  <tr key={installment.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-stone-900">{installment.client_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-stone-600">{installment.installment_number}/{installment.total_installments}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-stone-600">
                        {format(new Date(installment.due_date), "dd/MM/yyyy")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-stone-900">
                        R$ {installment.value?.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(installment.computedStatus)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedInstallment(installment)}
                          className="border-stone-200"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Detalhes
                        </Button>
                        {installment.computedStatus === 'pago' && installment.payment_date && getSaleInstallments(installment.sale_id).length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(createPageUrl('PrintInstallments') + `?sale_id=${installment.sale_id}`, '_blank')}
                            className="border-stone-200"
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-stone-100">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500">
            {search || statusFilter !== 'all' ? 'Nenhuma parcela encontrada' : 'Nenhuma parcela registrada'}
          </p>
        </div>
      )}

      {/* Installment Details Dialog */}
      <InstallmentDetails
        installment={selectedInstallment}
        open={!!selectedInstallment}
        onClose={() => setSelectedInstallment(null)}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}