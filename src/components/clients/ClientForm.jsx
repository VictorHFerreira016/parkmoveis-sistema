import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from 'lucide-react';

export default function ClientForm({ open, onClose, onSave, client }) {
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: ''
  });

  useEffect(() => {
    if (client) {
      setFormData(client);
    } else {
      setFormData({
        name: '',
        cpf: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: ''
      });
    }
  }, [client, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-stone-900">
            {client ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label className="text-stone-600 text-sm">Nome completo *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
                required
              />
            </div>
            
            <div>
              <Label className="text-stone-600 text-sm">CPF</Label>
              <Input
                value={formData.cpf}
                onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
                placeholder="000.000.000-00"
              />
            </div>
            
            <div>
              <Label className="text-stone-600 text-sm">Telefone *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
                required
              />
            </div>
            
            <div className="sm:col-span-2">
              <Label className="text-stone-600 text-sm">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
              />
            </div>
            
            <div className="sm:col-span-2">
              <Label className="text-stone-600 text-sm">Endereço</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
              />
            </div>
            
            <div>
              <Label className="text-stone-600 text-sm">Cidade</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
              />
            </div>
            
            <div>
              <Label className="text-stone-600 text-sm">Estado</Label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
                placeholder="SP"
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
            >
              {client ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}