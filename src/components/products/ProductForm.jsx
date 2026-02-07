import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function ProductForm({ open, onClose, onSave, product }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'moveis',
    description: '',
    cost_price: '',
    sale_price: '',
    stock: '',
    image_url: '',
    brand: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        cost_price: product.cost_price?.toString() || '',
        sale_price: product.sale_price?.toString() || product.price?.toString() || '',
        stock: product.stock?.toString() || ''
      });
    } else {
      setFormData({
        name: '',
        category: 'moveis',
        description: '',
        cost_price: '',
        sale_price: '',
        stock: '',
        image_url: '',
        brand: ''
      });
    }
  }, [product, open]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData({ ...formData, image_url: file_url });
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      cost_price: parseFloat(formData.cost_price) || 0,
      sale_price: parseFloat(formData.sale_price) || 0,
      stock: parseInt(formData.stock) || 0
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-stone-900">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Image Upload */}
          <div>
            <Label className="text-stone-600 text-sm">Imagem do Produto</Label>
            <div className="mt-1.5">
              {formData.image_url ? (
                <div className="relative">
                  <img 
                    src={formData.image_url} 
                    alt="Produto" 
                    className="w-full h-48 object-cover rounded-lg border border-stone-200"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 bg-white"
                    onClick={() => setFormData({...formData, image_url: ''})}
                  >
                    Remover
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-stone-400" />
                      <span className="mt-2 text-sm text-stone-500">Clique para fazer upload</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label className="text-stone-600 text-sm">Nome do Produto *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
                required
              />
            </div>
            
            <div>
              <Label className="text-stone-600 text-sm">Categoria *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger className="mt-1.5 border-stone-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moveis">Móveis</SelectItem>
                  <SelectItem value="eletrodomesticos">Eletrodomésticos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-stone-600 text-sm">Marca</Label>
              <Input
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
              />
            </div>
            
            <div>
              <Label className="text-stone-600 text-sm">Preço de Custo (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
                className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
              />
            </div>
            
            <div>
              <Label className="text-stone-600 text-sm">Preço de Venda (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.sale_price}
                onChange={(e) => setFormData({...formData, sale_price: e.target.value})}
                className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
                required
              />
            </div>
            

            
            <div>
              <Label className="text-stone-600 text-sm">Estoque</Label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
              />
            </div>
            
            <div className="sm:col-span-2">
              <Label className="text-stone-600 text-sm">Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400 resize-none"
                rows={3}
              />
            </div>
          </div>
          
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
              disabled={uploading}
            >
              {product ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}