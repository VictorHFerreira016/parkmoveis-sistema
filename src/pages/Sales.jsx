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

  // ✅ Buscar vendas com itens e parcelas relacionados
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['vendas'],
    queryFn: () => api.entities.Sale.list()
  });

  // ✅ Buscar clientes (nomes corretos das colunas)
  const { data: clients = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => api.entities.Client.list()
  });

  // ✅ Buscar produtos (nomes corretos das colunas)
  const { data: products = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => api.entities.Product.list()
  });

  // ✅ Mutation para criar venda (estrutura relacional correta)
  const createMutation = useMutation({
    mutationFn: (formData) => api.entities.Sale.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      setShowForm(false);
    }
  });

  // ✅ Filtro por nome do cliente
  const filteredSales = sales.filter(sale =>
    sale.cliente?.nome?.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Cálculo do faturamento total
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.valor_total || 0), 0);

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
                    sale.tipo_pagamento === 'dinheiro' 
                      ? 'bg-green-50 text-green-600' 
                      : sale.tipo_pagamento === 'pix'
                      ? 'bg-purple-50 text-purple-600'
                      : sale.tipo_pagamento === 'debito'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}>
                    {sale.tipo_pagamento === 'dinheiro' ? (
                      <Banknote className="w-5 h-5" />
                    ) : sale.tipo_pagamento === 'pix' ? (
                      <Smartphone className="w-5 h-5" />
                    ) : (
                      <CreditCard className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">{sale.cliente?.nome || 'Cliente não identificado'}</h3>
                    <p className="text-sm text-stone-500">
                      {sale.data_venda && format(new Date(sale.data_venda), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-stone-900">
                      R$ {sale.valor_total?.toFixed(2)}
                    </p>
                    <Badge className="mt-1 bg-stone-100 text-stone-700">
                      {sale.tipo_pagamento === 'dinheiro' ? 'Dinheiro' :
                      sale.tipo_pagamento === 'pix' ? 'PIX' :
                      sale.tipo_pagamento === 'debito' ? 'Débito' :
                      sale.tipo_pagamento === 'credito' ? 'Crédito' :
                      sale.tipo_pagamento === 'prazo' ? `${sale.parcelas?.length || 0}x A Prazo` :
                      'Outro'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {sale.tipo_pagamento === 'prazo' && sale.parcelas?.length > 0 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            createPageUrl('PrintInstallments') + `?sale_id=${sale.id}`,
                            '_blank'
                          );
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
                  {/* Informações do Cliente */}
                  {sale.cliente && (
                    <div className="mt-4 mb-4 p-3 bg-stone-50 rounded-lg">
                      <h4 className="text-sm font-medium text-stone-600 mb-2">Informações do Cliente</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-stone-500">Nome:</span>
                          <p className="font-medium text-stone-900">{sale.cliente.nome}</p>
                        </div>
                        {sale.cliente.celular && (
                          <div>
                            <span className="text-stone-500">Celular:</span>
                            <p className="font-medium text-stone-900">{sale.cliente.celular}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Itens da venda */}
                  <h4 className="text-sm font-medium text-stone-600 mt-4 mb-3">Itens da venda</h4>
                  <div className="space-y-2 mb-4">
                    {sale.itens?.map((item, index) => (
                      <div key={item.id_venda_item || index} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                        <div>
                          <p className="font-medium text-stone-900">{item.produto?.nome || 'Produto não identificado'}</p>
                          <p className="text-sm text-stone-500">
                            {item.quantidade}x R$ {item.preco_unitario_praticado?.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium text-stone-900">
                          R$ {(item.quantidade * item.preco_unitario_praticado)?.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Parcelas */}
                  {sale.parcelas?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-stone-600 mb-2">Parcelas</h4>
                      <div className="space-y-2">
                        {sale.parcelas.map((parcela, i) => (
                          <div 
                            key={parcela.id_parcelas} 
                            className="flex items-center justify-between py-2 px-3 bg-stone-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-stone-900">
                                  Parcela {i + 1}
                                </span>
                                <Badge className={
                                  parcela.status === 'paga' 
                                    ? 'bg-green-100 text-green-700' 
                                    : parcela.status === 'vencida'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-amber-100 text-amber-700'
                                }>
                                  {parcela.status === 'paga' ? 'Paga' : 
                                   parcela.status === 'vencida' ? 'Vencida' : 'Pendente'}
                                </Badge>
                              </div>
                              <p className="text-xs text-stone-500 mt-1">
                                Venc: {new Date(parcela.data_vencimento).toLocaleDateString('pt-BR')}
                                {parcela.data_pagamento && (
                                  <> • Paga em: {new Date(parcela.data_pagamento).toLocaleDateString('pt-BR')}</>
                                )}
                              </p>
                            </div>
                            <span className="font-medium text-stone-900">
                              R$ {parcela.valor_parcela?.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-stone-200 flex justify-between text-sm">
                        <span className="text-stone-600">
                          Total parcelado: {sale.parcelas.length}x
                        </span>
                        <span className="font-medium text-stone-900">
                          {sale.parcelas.filter(p => p.status === 'paga').length} de {sale.parcelas.length} pagas
                        </span>
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