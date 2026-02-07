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
    }
  }, [open]);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchClient.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const addItem = (product) => {
    const existingItem = items.find(i => i.product_id === product.id);
    const price = product.sale_price || product.price || 0;
    if (existingItem) {
      setItems(items.map(i => 
        i.product_id === product.id 
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unit_price }
          : i
      ));
    } else {
      setItems([...items, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: price,
        total: price
      }]);
    }
    setSearchProduct('');
  };

  const updateItemQuantity = (index, quantity) => {
    if (quantity < 1) return;
    const newItems = [...items];
    newItems[index].quantity = quantity;
    newItems[index].total = quantity * newItems[index].unit_price;
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = subtotal - discount + addition;

  useEffect(() => {
    if (paymentMethod === 'credito_parcelado' && totalAmount > 0) {
      const installmentCount = installmentsData.length || 2;
      const installmentValue = totalAmount / installmentCount;
      const newInstallments = Array.from({ length: installmentCount }, (_, i) => ({
        number: i + 1,
        value: installmentValue,
        due_date: format(addDays(new Date(), 30 * (i + 1)), 'yyyy-MM-dd'),
        status: 'pendente'
      }));
      setInstallmentsData(newInstallments);
    }
  }, [paymentMethod, totalAmount]);

  const updateInstallmentCount = (count) => {
    const installmentValue = totalAmount / count;
    const newInstallments = Array.from({ length: count }, (_, i) => ({
      number: i + 1,
      value: installmentValue,
      due_date: installmentsData[i]?.due_date || format(addDays(new Date(), 30 * (i + 1)), 'yyyy-MM-dd'),
      status: 'pendente'
    }));
    setInstallmentsData(newInstallments);
  };

  const updateInstallmentValue = (index, value) => {
    const newInstallments = [...installmentsData];
    newInstallments[index].value = parseFloat(value) || 0;
    setInstallmentsData(newInstallments);
  };

  const updateInstallmentDate = (index, date) => {
    const newInstallments = [...installmentsData];
    newInstallments[index].due_date = date;
    setInstallmentsData(newInstallments);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClient || items.length === 0) return;
    
    onSave({
      client_id: selectedClient.id,
      client_name: selectedClient.name,
      items,
      subtotal,
      discount,
      addition,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      installments_data: paymentMethod === 'credito_parcelado' ? installmentsData : [],
      status: 'concluida'
    });
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
                  <p className="font-medium text-stone-900">{selectedClient.name}</p>
                  <p className="text-sm text-stone-500">{selectedClient.phone}</p>
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
                    {filteredClients.map(client => (
                      <button
                        key={client.id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-stone-50 transition-colors"
                        onClick={() => {
                          setSelectedClient(client);
                          setSearchClient('');
                        }}
                      >
                        <p className="font-medium text-stone-900">{client.name}</p>
                        <p className="text-sm text-stone-500">{client.phone}</p>
                      </button>
                    ))}
                    {filteredClients.length === 0 && (
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
                  {filteredProducts.map(product => (
                    <button
                      key={product.id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-stone-50 transition-colors flex items-center justify-between"
                      onClick={() => addItem(product)}
                    >
                      <div>
                        <p className="font-medium text-stone-900">{product.name}</p>
                        <p className="text-sm text-stone-500">{product.brand}</p>
                      </div>
                      <span className="font-medium text-stone-900">
                        R$ {(product.sale_price || product.price)?.toFixed(2)}
                      </span>
                    </button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="px-3 py-2 text-sm text-stone-500">Nenhum produto encontrado</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Items List */}
          {items.length > 0 && (
            <div>
              <Label className="text-stone-600 text-sm">Itens da Venda</Label>
              <div className="mt-1.5 space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200">
                    <div className="flex-1">
                      <p className="font-medium text-stone-900">{item.product_name}</p>
                      <p className="text-sm text-stone-500">R$ {item.unit_price.toFixed(2)} un.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateItemQuantity(index, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateItemQuantity(index, item.quantity + 1)}
                        >
                          +
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
                <SelectItem value="credito_avista">Cartão de Crédito (À Vista)</SelectItem>
                <SelectItem value="credito_parcelado">Cartão de Crédito (Parcelado)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Installments */}
          {paymentMethod === 'credito_parcelado' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-stone-600 text-sm">Parcelas</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateInstallmentCount(Math.max(2, installmentsData.length - 1))}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm font-medium">{installmentsData.length}x</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateInstallmentCount(Math.min(12, installmentsData.length + 1))}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-stone-200 rounded-lg p-3">
                {installmentsData.map((inst, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 items-center">
                    <div>
                      <Label className="text-xs text-stone-500">Parcela {inst.number}</Label>
                    </div>
                    <div>
                      <Input
                        type="number"
                        step="0.01"
                        value={inst.value}
                        onChange={(e) => updateInstallmentValue(index, e.target.value)}
                        className="border-stone-200 text-sm h-9"
                      />
                    </div>
                    <div>
                      <Input
                        type="date"
                        value={inst.due_date}
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