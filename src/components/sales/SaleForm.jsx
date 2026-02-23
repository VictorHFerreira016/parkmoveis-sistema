import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Search, Plus, Minus } from 'lucide-react';
import { addDays, format } from 'date-fns';

export default function SaleForm({ open, onClose, onSave, clients, products }) {
  const [selectedClient, setSelectedClient] = useState(null);
  const [items, setItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('dinheiro');
  const [installmentsData, setInstallmentsData] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [addition, setAddition] = useState(0);
  const [searchClient, setSearchClient] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [installmentsCount, setInstallmentsCount] = useState(1);

  useEffect(() => {
    if (!open) {
      setSelectedClient(null);
      setItems([]);
      setPaymentMethod('dinheiro');
      setInstallmentsData([]);
      setDiscount(0);
      setAddition(0);
      setSearchClient('');
      setSearchProduct('');
      setInstallmentsCount(1);
    }
  }, [open]);

  // ✅ Filtro de clientes (usando nome correto do campo)
  const filteredClients = clients.filter(c => 
    c.nome?.toLowerCase().includes(searchClient.toLowerCase())
  );

  // ✅ Filtro de produtos (usando nome correto do campo)
  const filteredProducts = products.filter(p => 
    p.nome?.toLowerCase().includes(searchProduct.toLowerCase())
  );

  // ✅ Adicionar item (usando campos corretos do produto)
  const addItem = (product) => {
    const existingItem = items.find(i => i.id_produto === product.id_produto);
    
    // Escolhe o preço baseado no tipo de pagamento
    const price = paymentMethod === 'prazo' 
      ? (product.preco_base_prazo || product.preco_base_vista || 0)
      : (product.preco_base_vista || 0);
    
    if (existingItem) {
      setItems(items.map(i => 
        i.id_produto === product.id_produto 
          ? { 
              ...i, 
              quantidade: i.quantidade + 1, 
              total: (i.quantidade + 1) * i.preco_unitario_praticado 
            }
          : i
      ));
    } else {
      setItems([...items, {
        id_produto: product.id_produto,
        nome_produto: product.nome,
        quantidade: 1,
        preco_unitario_praticado: price,
        total: price
      }]);
    }
    setSearchProduct('');
  };

  // ✅ Atualizar quantidade do item
  const updateItemQuantity = (index, quantity) => {
    if (quantity < 1) return;
    const newItems = [...items];
    newItems[index].quantidade = quantity;
    newItems[index].total = quantity * newItems[index].preco_unitario_praticado;
    setItems(newItems);
  };

  // ✅ Atualizar preço unitário do item
  const updateItemPrice = (index, price) => {
    const newPrice = parseFloat(price) || 0;
    const newItems = [...items];
    newItems[index].preco_unitario_praticado = newPrice;
    newItems[index].total = newItems[index].quantidade * newPrice;
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = subtotal - discount + addition;

  // ✅ Recalcula parcelas quando mudar quantidade, pagamento ou total
  useEffect(() => {
    if (paymentMethod === 'prazo' && totalAmount > 0) {
      const value = totalAmount / installmentsCount;

      const newInstallments = Array.from({ length: installmentsCount }, (_, i) => ({
        numero_parcela: i + 1,
        valor_parcela: Number(value.toFixed(2)),
        data_vencimento: format(addDays(new Date(), 30 * (i + 1)), 'yyyy-MM-dd'),
        status: 'pendente'
      }));

      setInstallmentsData(newInstallments);
    } else {
      setInstallmentsData([]);
    }
  }, [paymentMethod, installmentsCount, totalAmount]);

  const updateInstallmentCount = (count) => {
    setInstallmentsCount(count);
  };

  const updateInstallmentValue = (index, value) => {
    const newValue = Number(value) || 0;
    const updated = [...installmentsData];

    updated[index].valor_parcela = newValue;

    const remainingTotal = totalAmount - newValue;
    const remainingCount = updated.length - 1;

    if (remainingCount > 0) {
      const adjustedValue = remainingTotal / remainingCount;

      updated.forEach((inst, i) => {
        if (i !== index) {
          inst.valor_parcela = Number(adjustedValue.toFixed(2));
        }
      });
    }

    setInstallmentsData(updated);
  };

  const updateInstallmentDate = (index, date) => {
    const newInstallments = [...installmentsData];
    newInstallments[index].data_vencimento = date;
    setInstallmentsData(newInstallments);
  };

  // ✅ Submeter formulário com dados mapeados corretamente
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClient || items.length === 0) return;
    
    // Mapeia para a estrutura correta do banco de dados
    const saleData = {
      id_cliente: selectedClient.id_cliente,
      valor_total: totalAmount,
      tipo_pagamento: paymentMethod,
      status: 'concluida',
      // Itens no formato correto para venda_itens
      itens: items.map(item => ({
        id_produto: item.id_produto,
        quantidade: item.quantidade,
        preco_unitario_praticado: item.preco_unitario_praticado
      })),
      // Parcelas no formato correto para tabela parcelas
      parcelas: paymentMethod === 'prazo' ? installmentsData : []
    };
    
    onSave(saleData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-stone-900">Nova Venda</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Client Selection */}
          <div>
            <Label className="text-stone-600 text-sm">Cliente *</Label>
            {selectedClient ? (
              <div className="mt-1.5 flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div>
                  <p className="font-medium text-stone-900">{selectedClient.nome}</p>
                  {selectedClient.celular && (
                    <p className="text-sm text-stone-500">{selectedClient.celular}</p>
                  )}
                  {selectedClient.cpf && (
                    <p className="text-xs text-stone-400">CPF: {selectedClient.cpf}</p>
                  )}
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedClient(null)}
                >
                  Alterar
                </Button>
              </div>
            ) : (
              <div className="mt-1.5 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <Input
                    placeholder="Buscar cliente..."
                    value={searchClient}
                    onChange={(e) => setSearchClient(e.target.value)}
                    className="pl-9 border-stone-200"
                  />
                </div>
                {searchClient && (
                  <div className="border border-stone-200 rounded-lg max-h-40 overflow-y-auto">
                    {filteredClients.length > 0 ? (
                      filteredClients.map(client => (
                        <button
                          key={client.id_cliente}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-stone-50 transition-colors"
                          onClick={() => {
                            setSelectedClient(client);
                            setSearchClient('');
                          }}
                        >
                          <p className="font-medium text-stone-900">{client.nome}</p>
                          {client.celular && (
                            <p className="text-sm text-stone-500">{client.celular}</p>
                          )}
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-sm text-stone-500">Nenhum cliente encontrado</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Selection */}
          <div>
            <Label className="text-stone-600 text-sm">Adicionar Produtos *</Label>
            <div className="mt-1.5 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  placeholder="Buscar produto..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="pl-9 border-stone-200"
                />
              </div>
              {searchProduct && (
                <div className="border border-stone-200 rounded-lg max-h-40 overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                      <button
                        key={product.id_produto}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-stone-50 transition-colors"
                        onClick={() => addItem(product)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-stone-900">{product.nome}</p>
                            <p className="text-sm text-stone-500">
                              À vista: R$ {product.preco_base_vista?.toFixed(2)}
                              {product.preco_base_prazo && (
                                <> • A prazo: R$ {product.preco_base_prazo?.toFixed(2)}</>
                              )}
                            </p>
                          </div>
                          {product.quantidade !== null && product.quantidade !== undefined && (
                            <span className="text-xs text-stone-400">
                              Estoque: {product.quantidade}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-stone-500">Nenhum produto encontrado</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Items List */}
          {items.length > 0 && (
            <div>
              <Label className="text-stone-600 text-sm mb-3 block">Itens Selecionados</Label>
              <div className="space-y-2 border border-stone-200 rounded-lg p-3">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 py-2 border-b border-stone-50 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-stone-900">{item.nome_produto}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={item.preco_unitario_praticado}
                          onChange={(e) => updateItemPrice(index, e.target.value)}
                          className="w-28 h-7 text-sm border-stone-200"
                        />
                        <span className="text-xs text-stone-500">por unidade</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateItemQuantity(index, item.quantidade - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantidade}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateItemQuantity(index, item.quantidade + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <span className="font-medium text-stone-900 w-24 text-right">
                        R$ {item.total.toFixed(2)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discount and Addition */}
          {items.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-stone-600 text-sm">Desconto (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="mt-1.5 border-stone-200"
                />
              </div>
              <div>
                <Label className="text-stone-600 text-sm">Acréscimo (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={addition}
                  onChange={(e) => setAddition(parseFloat(e.target.value) || 0)}
                  className="mt-1.5 border-stone-200"
                />
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <Label className="text-stone-600 text-sm">Forma de Pagamento *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="mt-1.5 border-stone-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="debito">Cartão de Débito</SelectItem>
                <SelectItem value="credito">Cartão de Crédito</SelectItem>
                <SelectItem value="prazo">A Prazo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Installments */}
          {paymentMethod === 'prazo' && (
            <div>
              <div className="mb-3">
                <Label className="text-stone-600 text-sm">Quantidade de parcelas</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateInstallmentCount(Math.max(1, installmentsCount - 1))}
                    disabled={installmentsCount <= 1}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    max={24}
                    value={installmentsCount}
                    onChange={(e) => updateInstallmentCount(Number(e.target.value) || 1)}
                    className="border-stone-200 text-center w-20"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateInstallmentCount(Math.min(24, installmentsCount + 1))}
                    disabled={installmentsCount >= 24}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm text-stone-600">parcelas</span>
                </div>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto border border-stone-200 rounded-lg p-3">
                <div className="grid grid-cols-3 gap-2 pb-2 border-b border-stone-200">
                  <Label className="text-xs text-stone-500">Parcela</Label>
                  <Label className="text-xs text-stone-500">Valor (R$)</Label>
                  <Label className="text-xs text-stone-500">Vencimento</Label>
                </div>
                {installmentsData.map((inst, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 items-center">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-stone-900">{inst.numero_parcela}/{installmentsData.length}</span>
                    </div>
                    <div>
                      <Input
                        type="number"
                        step="0.01"
                        value={inst.valor_parcela}
                        onChange={(e) => updateInstallmentValue(index, e.target.value)}
                        className="border-stone-200 text-sm h-9"
                      />
                    </div>
                    <div>
                      <Input
                        type="date"
                        value={inst.data_vencimento}
                        onChange={(e) => updateInstallmentDate(index, e.target.value)}
                        className="border-stone-200 text-sm h-9"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          {items.length > 0 && (
            <div className="p-4 bg-stone-100 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-stone-600">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span>Desconto:</span>
                  <span>- R$ {discount.toFixed(2)}</span>
                </div>
              )}
              {addition > 0 && (
                <div className="flex items-center justify-between text-amber-600">
                  <span>Acréscimo:</span>
                  <span>+ R$ {addition.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                <span className="font-semibold text-stone-900">Total:</span>
                <span className="text-2xl font-bold text-stone-900">
                  R$ {totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-stone-200 text-stone-600 hover:bg-stone-50"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-stone-900 hover:bg-stone-800 text-white"
              disabled={!selectedClient || items.length === 0}
            >
              Finalizar Venda
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}