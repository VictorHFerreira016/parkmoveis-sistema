import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Pencil, Trash2, Package, Image as ImageIcon } from 'lucide-react';
import ProductForm from '@/components/products/ProductForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Products() {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
      setEditingProduct(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteProduct(null);
    }
  });

  const handleSave = (data) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase()) ||
      product.brand?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || product.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Produtos</h1>
          <p className="text-stone-500 mt-1">{products.length} produtos cadastrados</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-stone-900 hover:bg-stone-800 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Buscar por nome ou marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
          />
        </div>
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="bg-stone-100">
            <TabsTrigger value="all" className="data-[state=active]:bg-white">Todos</TabsTrigger>
            <TabsTrigger value="moveis" className="data-[state=active]:bg-white">Móveis</TabsTrigger>
            <TabsTrigger value="eletrodomesticos" className="data-[state=active]:bg-white">Eletro</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-stone-100 overflow-hidden animate-pulse">
              <div className="h-48 bg-stone-100"></div>
              <div className="p-4">
                <div className="h-5 bg-stone-100 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-stone-100 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-xl border border-stone-100 overflow-hidden hover:border-stone-200 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="relative h-48 bg-stone-50">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-stone-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-white shadow-sm"
                    onClick={() => {
                      setEditingProduct(product);
                      setShowForm(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-white shadow-sm text-red-600 hover:text-red-700"
                    onClick={() => setDeleteProduct(product)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full ${
                  product.category === 'moveis' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {product.category === 'moveis' ? 'Móveis' : 'Eletro'}
                </span>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-stone-900 truncate">{product.name}</h3>
                {product.brand && (
                  <p className="text-sm text-stone-500">{product.brand}</p>
                )}
                <div className="mt-3">
                  <p className="text-lg font-bold text-stone-900">
                    R$ {(product.sale_price || product.price)?.toFixed(2)}
                  </p>
                  {product.cost_price && (
                    <p className="text-sm text-stone-500">
                      Custo: R$ {product.cost_price.toFixed(2)}
                    </p>
                  )}
                  {product.stock !== undefined && (
                    <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                      product.stock > 0 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {product.stock > 0 ? `${product.stock} em estoque` : 'Sem estoque'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500">
            {search || category !== 'all' ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado ainda'}
          </p>
          {!search && category === 'all' && (
            <Button 
              onClick={() => setShowForm(true)}
              variant="outline"
              className="mt-4 border-stone-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar primeiro produto
            </Button>
          )}
        </div>
      )}

      {/* Form Dialog */}
      <ProductForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
        onSave={handleSave}
        product={editingProduct}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <p>
                Tem certeza que deseja excluir {deleteProduct?.name}? Esta ação não pode ser desfeita.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-stone-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteMutation.mutate(deleteProduct.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}