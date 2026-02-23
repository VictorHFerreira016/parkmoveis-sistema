import React, { useState, useEffect } from 'react';
import InputMask from 'react-input-mask';
import cep from 'cep-promise';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, MapPin, Phone, Users, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ClientForm({ open, onClose, onSave, client }) {
  const [loadingCep, setLoadingCep] = useState(false);
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
        name: '', cpf: '', rg: '', birthDate: '', occupation: '',
        email: '', phone: '', addresses: [], phones: [], relatives: []
      });
    }
  }, [client, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Lógica de busca de CEP sem travar o preenchimento manual
  const handleCepSearch = async (index, value) => {
    updateAddress(index, 'cep', value);
    const cleanCep = value.replace(/\D/g, '');

    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const res = await cep(cleanCep);
        const newAddresses = [...formData.addresses];
        newAddresses[index] = {
          ...newAddresses[index],
          logradouro: res.street || '',
          bairro: res.neighborhood || '',
          cidade: res.city || '',
          estado: res.state || '',
        };
        setFormData({ ...formData, addresses: newAddresses });
      } catch (error) {
        console.error("CEP não encontrado ou erro na busca.");
      } finally {
        setLoadingCep(false);
      }
    }
  };

  // Funções de manipulação (Endereços)
  const addAddress = () => {
    setFormData({
      ...formData,
      addresses: [...formData.addresses, { logradouro: '', numero: '', bairro: '', cidade: '', estado: '', cep: '', tipo: 'residencial' }]
    });
  };

  const updateAddress = (index, field, value) => {
    const newAddresses = [...formData.addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setFormData({ ...formData, addresses: newAddresses });
  };

  const removeAddress = (index) => {
    setFormData({ ...formData, addresses: formData.addresses.filter((_, i) => i !== index) });
  };

  // Funções de manipulação (Telefones)
  const addPhone = () => {
    setFormData({
      ...formData,
      phones: [...formData.phones, { numero: '', tipo: 'pessoal', pertence_a: 'cliente' }]
    });
  };

  const updatePhone = (index, field, value) => {
    const newPhones = [...formData.phones];
    newPhones[index] = { ...newPhones[index], [field]: value };
    setFormData({ ...formData, phones: newPhones });
  };

  const removePhone = (index) => {
    setFormData({ ...formData, phones: formData.phones.filter((_, i) => i !== index) });
  };

  // Funções de manipulação (Parentes)
  const addRelative = () => {
    setFormData({
      ...formData,
      relatives: [...formData.relatives, { nome_parente: '', parentesco: '' }]
    });
  };

  const updateRelative = (index, field, value) => {
    const newRelatives = [...formData.relatives];
    newRelatives[index] = { ...newRelatives[index], [field]: value };
    setFormData({ ...formData, relatives: newRelatives });
  };

  const removeRelative = (index) => {
    setFormData({ ...formData, relatives: formData.relatives.filter((_, i) => i !== index) });
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
                  <InputMask 
                    mask="999.999.999-99" 
                    value={formData.cpf} 
                    onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                  >
                    {(inputProps) => (
                      <Input
                        {...inputProps}
                        className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
                        placeholder="000.000.000-00"
                      />
                    )}
                  </InputMask>
                </div>
                
                <div>
                  <Label className="text-stone-600 text-sm">RG</Label>
                  <InputMask 
                    mask="99.999.999-*" 
                    value={formData.rg} 
                    onChange={(e) => setFormData({...formData, rg: e.target.value})}
                  >
                    {(inputProps) => (
                      <Input
                        {...inputProps}
                        className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
                        placeholder="00.000.000-0"
                      />
                    )}
                  </InputMask>
                </div>
                
                <div>
                  <Label className="text-stone-600 text-sm">Data de Nascimento</Label>
                  <InputMask 
                    mask="99/99/9999" 
                    value={formData.birthDate} 
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  >
                    {(inputProps) => (
                      <Input
                        {...inputProps}
                        className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
                        placeholder="DD/MM/AAAA"
                      />
                    )}
                  </InputMask>
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
                  <InputMask 
                    mask="(99) 99999-9999" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  >
                    {(inputProps) => (
                      <Input
                        {...inputProps}
                        className="mt-1.5 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
                        placeholder="(00) 00000-0000"
                        required
                      />
                    )}
                  </InputMask>
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
                <p className="text-sm text-stone-600">{formData.addresses.length} endereço(s) cadastrado(s)</p>
                <Button type="button" variant="outline" size="sm" onClick={addAddress} className="border-stone-200">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Endereço
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {formData.addresses.map((address, index) => (
                  <div key={index} className="p-4 border border-stone-200 rounded-lg bg-stone-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-stone-400" />
                        <span className="text-sm font-medium text-stone-700">Endereço {index + 1}</span>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeAddress(index)} className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <Label className="text-xs text-stone-600">Tipo</Label>
                        <Select value={address.tipo} onValueChange={(value) => updateAddress(index, 'tipo', value)}>
                          <SelectTrigger className="mt-1 border-stone-200"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="residencial">Residencial</SelectItem>
                            <SelectItem value="comercial">Comercial</SelectItem>
                            <SelectItem value="cobranca">Cobrança</SelectItem>
                            <SelectItem value="entrega">Entrega</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="sm:col-span-2">
                        <Label className="text-xs text-stone-600">CEP (Busca automática)</Label>
                        <div className="relative">
                          <InputMask 
                            mask="99999-999" 
                            value={address.cep} 
                            onChange={(e) => handleCepSearch(index, e.target.value)}
                          >
                            {(inputProps) => (
                              <Input {...inputProps} className="mt-1 border-stone-200" placeholder="00000-000" />
                            )}
                          </InputMask>
                          {loadingCep && <Loader2 className="absolute right-2 top-3 h-4 w-4 animate-spin text-stone-400" />}
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <Label className="text-xs text-stone-600">Logradouro</Label>
                        <Input value={address.logradouro} onChange={(e) => updateAddress(index, 'logradouro', e.target.value)} className="mt-1 border-stone-200" placeholder="Rua, Avenida, etc." />
                      </div>

                      <div><Label className="text-xs text-stone-600">Número</Label><Input value={address.numero} onChange={(e) => updateAddress(index, 'numero', e.target.value)} className="mt-1 border-stone-200" /></div>
                      <div><Label className="text-xs text-stone-600">Bairro</Label><Input value={address.bairro} onChange={(e) => updateAddress(index, 'bairro', e.target.value)} className="mt-1 border-stone-200" /></div>
                      <div><Label className="text-xs text-stone-600">Cidade</Label><Input value={address.cidade} onChange={(e) => updateAddress(index, 'cidade', e.target.value)} className="mt-1 border-stone-200" /></div>
                      <div><Label className="text-xs text-stone-600">Estado</Label><Input value={address.estado} onChange={(e) => updateAddress(index, 'estado', e.target.value)} className="mt-1 border-stone-200" placeholder="SP" maxLength={2} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Telefones Adicionais */}
            <TabsContent value="telefones" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-stone-600">{formData.phones.length} telefone(s) adicional(is)</p>
                <Button type="button" variant="outline" size="sm" onClick={addPhone} className="border-stone-200">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Telefone
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {formData.phones.map((phone, index) => (
                  <div key={index} className="p-4 border border-stone-200 rounded-lg bg-stone-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-stone-400" />
                        <span className="text-sm font-medium text-stone-700">Telefone {index + 1}</span>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removePhone(index)} className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-3">
                        <Label className="text-xs text-stone-600">Número *</Label>
                        <InputMask 
                          mask="(99) 99999-9999" 
                          value={phone.numero} 
                          onChange={(e) => updatePhone(index, 'numero', e.target.value)}
                        >
                          {(inputProps) => (
                            <Input {...inputProps} className="mt-1 border-stone-200" placeholder="(00) 00000-0000" required />
                          )}
                        </InputMask>
                      </div>

                      <div>
                        <Label className="text-xs text-stone-600">Tipo</Label>
                        <Select value={phone.tipo} onValueChange={(value) => updatePhone(index, 'tipo', value)}>
                          <SelectTrigger className="mt-1 border-stone-200"><SelectValue /></SelectTrigger>
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
                        <Input value={phone.pertence_a} onChange={(e) => updatePhone(index, 'pertence_a', e.target.value)} className="mt-1 border-stone-200" placeholder="Cliente, Esposa, etc." />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Parentes */}
            <TabsContent value="parentes" className="space-y-4">
              {/* O conteúdo de parentes permanece IDÊNTICO ao seu original */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-stone-600">{formData.relatives.length} parente(s) cadastrado(s)</p>
                <Button type="button" variant="outline" size="sm" onClick={addRelative} className="border-stone-200">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Parente
                </Button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {formData.relatives.map((relative, index) => (
                  <div key={index} className="p-4 border border-stone-200 rounded-lg bg-stone-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-stone-400" />
                        <span className="text-sm font-medium text-stone-700">Parente {index + 1}</span>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeRelative(index)} className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <Label className="text-xs text-stone-600">Nome do Parente *</Label>
                        <Input value={relative.nome_parente} onChange={(e) => updateRelative(index, 'nome_parente', e.target.value)} className="mt-1 border-stone-200" required />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-xs text-stone-600">Parentesco</Label>
                        <Select value={relative.parentesco} onValueChange={(value) => updateRelative(index, 'parentesco', value)}>
                          <SelectTrigger className="mt-1 border-stone-200"><SelectValue placeholder="Selecione o parentesco" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pai">Pai</SelectItem><SelectItem value="mae">Mãe</SelectItem>
                            <SelectItem value="filho">Filho(a)</SelectItem><SelectItem value="irmao">Irmão(ã)</SelectItem>
                            <SelectItem value="conjuge">Cônjuge</SelectItem><SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="border-stone-200 text-stone-600 hover:bg-stone-50">Cancelar</Button>
            <Button type="submit" className="bg-stone-900 hover:bg-stone-800 text-white">{client ? 'Salvar Alterações' : 'Adicionar Cliente'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}