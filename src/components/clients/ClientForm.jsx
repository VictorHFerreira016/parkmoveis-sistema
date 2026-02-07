import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, MapPin, Phone, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ClientForm({ open, onClose, onSave, client }) {
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    rg: '',
    birthDate: '',
    occupation: '',
    email: '',
    phone: '',
    addresses: [],
    phones: [],
    relatives: []
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        cpf: client.cpf || '',
        rg: client.rg || '',
        birthDate: client.birthDate || '',
        occupation: client.occupation || '',
        email: client.email || '',
        phone: client.phone || '',
        addresses: client.addresses || [],
        phones: client.phones || [],
        relatives: client.relatives || []
      });
    } else {
      setFormData({
        name: '',
        cpf: '',
        rg: '',
        birthDate: '',
        occupation: '',
        email: '',
        phone: '',
        addresses: [],
        phones: [],
        relatives: []
      });
    }
  }, [client, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Funções para Endereços
  const addAddress = () => {
    setFormData({
      ...formData,
      addresses: [...formData.addresses, {
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        tipo: 'residencial'
      }]
    });
  };

  const updateAddress = (index, field, value) => {
    const newAddresses = [...formData.addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setFormData({ ...formData, addresses: newAddresses });
  };

  const removeAddress = (index) => {
    const newAddresses = formData.addresses.filter((_, i) => i !== index);
    setFormData({ ...formData, addresses: newAddresses });
  };

  // Funções para Telefones
  const addPhone = () => {
    setFormData({
      ...formData,
      phones: [...formData.phones, {
        numero: '',
        tipo: 'pessoal',
        pertence_a: 'cliente'
      }]
    });
  };

  const updatePhone = (index, field, value) => {
    const newPhones = [...formData.phones];
    newPhones[index] = { ...newPhones[index], [field]: value };
    setFormData({ ...formData, phones: newPhones });
  };

  const removePhone = (index) => {
    const newPhones = formData.phones.filter((_, i) => i !== index);
    setFormData({ ...formData, phones: newPhones });
  };

  // Funções para Parentes
  const addRelative = () => {
    setFormData({
      ...formData,
      relatives: [...formData.relatives, {
        nome_parente: '',
        parentesco: ''
      }]
    });
  };

  const updateRelative = (index, field, value) => {
    const newRelatives = [...formData.relatives];
    newRelatives[index] = { ...newRelatives[index], [field]: value };
    setFormData({ ...formData, relatives: newRelatives });
  };

  const removeRelative = (index) => {
    const newRelatives = formData.relatives.filter((_, i) => i !== index);
    setFormData({ ...formData, relatives: newRelatives });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-stone-900">
            {client ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Tabs defaultValue="dados" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dados">Dados Básicos</TabsTrigger>
              <TabsTrigger value="enderecos">Endereços</TabsTrigger>
              <TabsTrigger value="telefones">Telefones</TabsTrigger>
              <TabsTrigger value="parentes">Parentes</TabsTrigger>
            </TabsList>

            {/* Dados Básicos */}
            <TabsContent value="dados" className="space-y-4">
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
                  <Label className="text-stone-600 text-sm">RG</Label>
                  <Input
                    value={formData.rg}
                    onChange={(e) => setFormData({...formData, rg: e.target.value})}
                    className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
                  />
                </div>
                
                <div>
                  <Label className="text-stone-600 text-sm">Data de Nascimento</Label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                    className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
                  />
                </div>
                
                <div>
                  <Label className="text-stone-600 text-sm">Ocupação</Label>
                  <Input
                    value={formData.occupation}
                    onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                    className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
                  />
                </div>
                
                <div>
                  <Label className="text-stone-600 text-sm">Celular Principal *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
                    placeholder="(00) 00000-0000"
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
              </div>
            </TabsContent>

            {/* Endereços */}
            <TabsContent value="enderecos" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-stone-600">
                  {formData.addresses.length} endereço(s) cadastrado(s)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAddress}
                  className="border-stone-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Endereço
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {formData.addresses.map((address, index) => (
                  <div key={index} className="p-4 border border-stone-200 rounded-lg bg-stone-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-stone-400" />
                        <span className="text-sm font-medium text-stone-700">
                          Endereço {index + 1}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAddress(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <Label className="text-xs text-stone-600">Tipo</Label>
                        <Select
                          value={address.tipo}
                          onValueChange={(value) => updateAddress(index, 'tipo', value)}
                        >
                          <SelectTrigger className="mt-1 border-stone-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="residencial">Residencial</SelectItem>
                            <SelectItem value="comercial">Comercial</SelectItem>
                            <SelectItem value="cobranca">Cobrança</SelectItem>
                            <SelectItem value="entrega">Entrega</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="sm:col-span-2">
                        <Label className="text-xs text-stone-600">Logradouro</Label>
                        <Input
                          value={address.logradouro}
                          onChange={(e) => updateAddress(index, 'logradouro', e.target.value)}
                          className="mt-1 border-stone-200"
                          placeholder="Rua, Avenida, etc."
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-stone-600">Número</Label>
                        <Input
                          value={address.numero}
                          onChange={(e) => updateAddress(index, 'numero', e.target.value)}
                          className="mt-1 border-stone-200"
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-stone-600">Bairro</Label>
                        <Input
                          value={address.bairro}
                          onChange={(e) => updateAddress(index, 'bairro', e.target.value)}
                          className="mt-1 border-stone-200"
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-stone-600">Cidade</Label>
                        <Input
                          value={address.cidade}
                          onChange={(e) => updateAddress(index, 'cidade', e.target.value)}
                          className="mt-1 border-stone-200"
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-stone-600">Estado</Label>
                        <Input
                          value={address.estado}
                          onChange={(e) => updateAddress(index, 'estado', e.target.value)}
                          className="mt-1 border-stone-200"
                          placeholder="SP"
                          maxLength={2}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Label className="text-xs text-stone-600">CEP</Label>
                        <Input
                          value={address.cep}
                          onChange={(e) => updateAddress(index, 'cep', e.target.value)}
                          className="mt-1 border-stone-200"
                          placeholder="00000-000"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {formData.addresses.length === 0 && (
                  <div className="text-center py-8 text-stone-400">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Nenhum endereço cadastrado</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Telefones */}
            <TabsContent value="telefones" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-stone-600">
                  {formData.phones.length} telefone(s) adicional(is)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPhone}
                  className="border-stone-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Telefone
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {formData.phones.map((phone, index) => (
                  <div key={index} className="p-4 border border-stone-200 rounded-lg bg-stone-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-stone-400" />
                        <span className="text-sm font-medium text-stone-700">
                          Telefone {index + 1}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePhone(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-3">
                        <Label className="text-xs text-stone-600">Número *</Label>
                        <Input
                          value={phone.numero}
                          onChange={(e) => updatePhone(index, 'numero', e.target.value)}
                          className="mt-1 border-stone-200"
                          placeholder="(00) 00000-0000"
                          required
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-stone-600">Tipo</Label>
                        <Select
                          value={phone.tipo}
                          onValueChange={(value) => updatePhone(index, 'tipo', value)}
                        >
                          <SelectTrigger className="mt-1 border-stone-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pessoal">Pessoal</SelectItem>
                            <SelectItem value="comercial">Comercial</SelectItem>
                            <SelectItem value="recado">Recado</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="sm:col-span-2">
                        <Label className="text-xs text-stone-600">Pertence a</Label>
                        <Input
                          value={phone.pertence_a}
                          onChange={(e) => updatePhone(index, 'pertence_a', e.target.value)}
                          className="mt-1 border-stone-200"
                          placeholder="Cliente, Esposa, etc."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {formData.phones.length === 0 && (
                  <div className="text-center py-8 text-stone-400">
                    <Phone className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Nenhum telefone adicional cadastrado</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Parentes */}
            <TabsContent value="parentes" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-stone-600">
                  {formData.relatives.length} parente(s) cadastrado(s)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRelative}
                  className="border-stone-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Parente
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {formData.relatives.map((relative, index) => (
                  <div key={index} className="p-4 border border-stone-200 rounded-lg bg-stone-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-stone-400" />
                        <span className="text-sm font-medium text-stone-700">
                          Parente {index + 1}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRelative(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <Label className="text-xs text-stone-600">Nome do Parente *</Label>
                        <Input
                          value={relative.nome_parente}
                          onChange={(e) => updateRelative(index, 'nome_parente', e.target.value)}
                          className="mt-1 border-stone-200"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Label className="text-xs text-stone-600">Parentesco</Label>
                        <Select
                          value={relative.parentesco}
                          onValueChange={(value) => updateRelative(index, 'parentesco', value)}
                        >
                          <SelectTrigger className="mt-1 border-stone-200">
                            <SelectValue placeholder="Selecione o parentesco" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pai">Pai</SelectItem>
                            <SelectItem value="mae">Mãe</SelectItem>
                            <SelectItem value="filho">Filho(a)</SelectItem>
                            <SelectItem value="irmao">Irmão(ã)</SelectItem>
                            <SelectItem value="conjuge">Cônjuge</SelectItem>
                            <SelectItem value="avo">Avô/Avó</SelectItem>
                            <SelectItem value="tio">Tio(a)</SelectItem>
                            <SelectItem value="primo">Primo(a)</SelectItem>
                            <SelectItem value="sobrinho">Sobrinho(a)</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}

                {formData.relatives.length === 0 && (
                  <div className="text-center py-8 text-stone-400">
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Nenhum parente cadastrado</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
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
              {client ? 'Salvar Alterações' : 'Adicionar Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}