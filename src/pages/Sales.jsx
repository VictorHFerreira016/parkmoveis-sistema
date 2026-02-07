import React, { useState } from 'react';
import { api } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ShoppingCart, ChevronDown, ChevronUp, CreditCard, Banknote, Smartphone, Wallet, Printer } from 'lucide-react';
import SaleForm from '@/components/sales/SaleForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createPageUrl } from '@/utils';

export default function Sales() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedSale, setExpandedSale] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list('-created_date')
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const sale = await api.entities.Sale.create(data);
      
      if (data.payment_method === 'credito_parcelado' && data.installments_data?.length) {
        const installments = data.installments_data.map(inst => ({
          sale_id: sale.id,
          client_id: data.client_id,
          client_name: data.client_name,
          installment_number: inst.number,
          total_installments: data.installments_data.length,
          value: inst.value,
          due_date: inst.due_date,
          status: inst.status
        }));
        await base44.entities.Installment.bulkCreate(installments);
      }
      
      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['installments'] });
      setShowForm(false);
    }
  });

  const filteredSales = sales.filter(sale =>
    sale.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Vendas</h1>
          <p className="text-stone-500 mt-1">
            {sales.length} vendas • Faturamento: R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-stone-900 hover:bg-stone-800 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Venda
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Buscar por cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
          />
        </div>
      </div>

      {/* Sales List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-5 border border-stone-100 animate-pulse">
              <div className="h-5 bg-stone-100 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-stone-100 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : filteredSales.length > 0 ? (
        <div className="space-y-4">
          {filteredSales.map((sale) => (
            <div 
              key={sale.id} 
              className="bg-white rounded-xl border border-stone-100 overflow-hidden hover:border-stone-200 transition-all duration-200"
            >
              <button
                className="w-full px-5 py-4 flex items-center justify-between text-left"
                onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    sale.payment_method === 'dinheiro' 
                      ? 'bg-green-50 text-green-600' 
                      : sale.payment_method === 'pix'
                      ? 'bg-purple-50 text-purple-600'
                      : sale.payment_method === 'debito'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}>
                    {sale.payment_method === 'dinheiro' ? (
                      <Banknote className="w-5 h-5" />
                    ) : sale.payment_method === 'pix' ? (
                      <Smartphone className="w-5 h-5" />
                    ) : (
                      <CreditCard className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">{sale.client_name}</h3>
                    <p className="text-sm text-stone-500">
                      {sale.created_date && format(new Date(sale.created_date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-stone-900">
                      R$ {sale.total_amount?.toFixed(2)}
                    </p>
                    <Badge className="mt-1 bg-stone-100 text-stone-700">
                      {sale.payment_method === 'dinheiro' ? 'Dinheiro' : 
                       sale.payment_method === 'pix' ? 'PIX' :
                       sale.payment_method === 'debito' ? 'Débito' :
                       sale.payment_method === 'credito_avista' ? 'Crédito à Vista' :
                       `${sale.installments_data?.length || 0}x Crédito`}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {sale.payment_method === 'credito_parcelado' && sale.installments_data?.length > 0 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(createPageUrl('PrintInstallments') + `?sale_id=${sale.id}`, '_blank');
                        }}
                        className="h-8 w-8"
                      >
                        <Printer className="w-4 h-4 text-stone-600" />
                      </Button>
                    )}
                    {expandedSale === sale.id ? (
                      <ChevronUp className="w-5 h-5 text-stone-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-stone-400" />
                    )}
                  </div>
                </div>
              </button>
              
              {expandedSale === sale.id && (
                <div className="px-5 pb-5 pt-0 border-t border-stone-100">
                  <h4 className="text-sm font-medium text-stone-600 mt-4 mb-3">Itens da venda</h4>
                  <div className="space-y-2 mb-4">
                    {sale.items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                        <div>
                          <p className="font-medium text-stone-900">{item.product_name}</p>
                          <p className="text-sm text-stone-500">
                            {item.quantity}x R$ {item.unit_price?.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium text-stone-900">
                          R$ {item.total?.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {(sale.discount > 0 || sale.addition > 0) && (
                    <div className="space-y-1 text-sm mb-4">
                      <div className="flex justify-between text-stone-600">
                        <span>Subtotal:</span>
                        <span>R$ {sale.subtotal?.toFixed(2)}</span>
                      </div>
                      {sale.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Desconto:</span>
                          <span>- R$ {sale.discount.toFixed(2)}</span>
                        </div>
                      )}
                      {sale.addition > 0 && (
                        <div className="flex justify-between text-amber-600">
                          <span>Acréscimo:</span>
                          <span>+ R$ {sale.addition.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {sale.installments_data?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-stone-600 mb-2">Parcelas</h4>
                      <div className="space-y-1 text-sm">
                        {sale.installments_data.map((inst, i) => (
                          <div key={i} className="flex justify-between text-stone-600">
                            <span>Parcela {inst.number} - Venc: {new Date(inst.due_date).toLocaleDateString('pt-BR')}</span>
                            <span>R$ {inst.value?.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500">
            {search ? 'Nenhuma venda encontrada' : 'Nenhuma venda registrada ainda'}
          </p>
          {!search && (
            <Button 
              onClick={() => setShowForm(true)}
              variant="outline"
              className="mt-4 border-stone-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Registrar primeira venda
            </Button>
          )}
        </div>
      )}

      {/* Form Dialog */}
      <SaleForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={(data) => createMutation.mutate(data)}
        clients={clients}
        products={products}
      />
    </div>
  );
}