import React, { useState } from 'react';
import { api } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2, Users, Phone, Mail, MapPin, Eye, X } from 'lucide-react';
import ClientForm from '@/components/clients/ClientForm';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function Clients() {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteClient, setDeleteClient] = useState(null);
  const [viewClient, setViewClient] = useState(null);
  const [search, setSearch] = useState('');
  
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.entities.Client.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.entities.Client.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Client.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowForm(false);
      setEditingClient(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.Client.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setDeleteClient(null);
    }
  });

  const handleSave = (data) => {
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(search.toLowerCase()) ||
    client.cpf?.includes(search) ||
    client.phone?.includes(search)
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getAddressTypeLabel = (type) => {
    const types = {
      'residencial': 'Residencial',
      'comercial': 'Comercial',
      'cobranca': 'Cobrança',
      'entrega': 'Entrega'
    };
    return types[type] || type;
  };

  const getPhoneTypeLabel = (type) => {
    const types = {
      'pessoal': 'Pessoal',
      'comercial': 'Comercial',
      'recado': 'Recado',
      'whatsapp': 'WhatsApp'
    };
    return types[type] || type;
  };

  const getRelativeTypeLabel = (type) => {
    const types = {
      'pai': 'Pai',
      'mae': 'Mãe',
      'filho': 'Filho(a)',
      'irmao': 'Irmão(ã)',
      'conjuge': 'Cônjuge',
      'avo': 'Avô/Avó',
      'tio': 'Tio(a)',
      'primo': 'Primo(a)',
      'sobrinho': 'Sobrinho(a)',
      'outro': 'Outro'
    };
    return types[type] || type;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Clientes</h1>
          <p className="text-stone-500 mt-1">{clients.length} clientes cadastrados</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-stone-900 hover:bg-stone-800 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Buscar por nome, CPF ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-stone-200 focus:border-stone-400 focus:ring-stone-400"
          />
        </div>
      </div>

      {/* Clients List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-5 border border-stone-100 animate-pulse">
              <div className="h-5 bg-stone-100 rounded w-2/3 mb-3"></div>
              <div className="h-4 bg-stone-100 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-stone-100 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div 
              key={client.id} 
              className="bg-white rounded-xl p-5 border border-stone-100 hover:border-stone-200 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-stone-900">{client.name}</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-stone-400 hover:text-stone-600"
                    onClick={() => setViewClient(client)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-stone-400 hover:text-stone-600"
                    onClick={() => {
                      setEditingClient(client);
                      setShowForm(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-stone-400 hover:text-red-600"
                    onClick={() => setDeleteClient(client)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                {client.cpf && (
                  <p className="text-stone-500">CPF: {client.cpf}</p>
                )}
                <div className="flex items-center gap-2 text-stone-600">
                  <Phone className="w-4 h-4 text-stone-400" />
                  {client.phone}
                </div>
                {client.email && (
                  <div className="flex items-center gap-2 text-stone-600">
                    <Mail className="w-4 h-4 text-stone-400" />
                    {client.email}
                  </div>
                )}
                
                {/* Badges de informação adicional */}
                <div className="flex flex-wrap gap-1 pt-2">
                  {client.addresses && client.addresses.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="w-3 h-3 mr-1" />
                      {client.addresses.length} endereço(s)
                    </Badge>
                  )}
                  {client.phones && client.phones.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Phone className="w-3 h-3 mr-1" />
                      +{client.phones.length} telefone(s)
                    </Badge>
                  )}
                  {client.relatives && client.relatives.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      {client.relatives.length} parente(s)
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500">
            {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}
          </p>
          {!search && (
            <Button 
              onClick={() => setShowForm(true)}
              variant="outline"
              className="mt-4 border-stone-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar primeiro cliente
            </Button>
          )}
        </div>
      )}

      {/* Form Dialog */}
      <ClientForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingClient(null);
        }}
        onSave={handleSave}
        client={editingClient}
      />

      {/* View Client Dialog */}
      <Dialog open={!!viewClient} onOpenChange={() => setViewClient(null)}>
        <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-stone-900">Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          
          {viewClient && (
            <div className="space-y-6">
              {/* Dados Básicos */}
              <div>
                <h3 className="text-lg font-semibold text-stone-900 mb-3">Informações Básicas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-stone-500 mb-1">Nome</p>
                    <p className="text-sm font-medium text-stone-900">{viewClient.name}</p>
                  </div>
                  {viewClient.cpf && (
                    <div>
                      <p className="text-xs text-stone-500 mb-1">CPF</p>
                      <p className="text-sm font-medium text-stone-900">{viewClient.cpf}</p>
                    </div>
                  )}
                  {viewClient.rg && (
                    <div>
                      <p className="text-xs text-stone-500 mb-1">RG</p>
                      <p className="text-sm font-medium text-stone-900">{viewClient.rg}</p>
                    </div>
                  )}
                  {viewClient.birthDate && (
                    <div>
                      <p className="text-xs text-stone-500 mb-1">Data de Nascimento</p>
                      <p className="text-sm font-medium text-stone-900">{formatDate(viewClient.birthDate)}</p>
                    </div>
                  )}
                  {viewClient.occupation && (
                    <div>
                      <p className="text-xs text-stone-500 mb-1">Ocupação</p>
                      <p className="text-sm font-medium text-stone-900">{viewClient.occupation}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-stone-500 mb-1">Celular Principal</p>
                    <p className="text-sm font-medium text-stone-900">{viewClient.phone}</p>
                  </div>
                  {viewClient.email && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-stone-500 mb-1">Email</p>
                      <p className="text-sm font-medium text-stone-900">{viewClient.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Endereços */}
              {viewClient.addresses && viewClient.addresses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Endereços
                  </h3>
                  <div className="space-y-3">
                    {viewClient.addresses.map((address, index) => (
                      <div key={index} className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {getAddressTypeLabel(address.tipo)}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-stone-900">
                            {address.logradouro}, {address.numero}
                          </p>
                          <p className="text-stone-600">
                            {address.bairro}
                          </p>
                          <p className="text-stone-600">
                            {address.cidade} - {address.estado}
                          </p>
                          {address.cep && (
                            <p className="text-stone-500">CEP: {address.cep}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Telefones Adicionais */}
              {viewClient.phones && viewClient.phones.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-3 flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Telefones Adicionais
                  </h3>
                  <div className="space-y-2">
                    {viewClient.phones.map((phone, index) => (
                      <div key={index} className="bg-stone-50 p-3 rounded-lg border border-stone-200 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-stone-900">{phone.numero}</p>
                          <p className="text-xs text-stone-500">
                            {getPhoneTypeLabel(phone.tipo)} - {phone.pertence_a}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {getPhoneTypeLabel(phone.tipo)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Parentes */}
              {viewClient.relatives && viewClient.relatives.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Parentes
                  </h3>
                  <div className="space-y-2">
                    {viewClient.relatives.map((relative, index) => (
                      <div key={index} className="bg-stone-50 p-3 rounded-lg border border-stone-200 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-stone-900">{relative.nome_parente}</p>
                          <p className="text-xs text-stone-500">
                            {getRelativeTypeLabel(relative.parentesco)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {getRelativeTypeLabel(relative.parentesco)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={() => setViewClient(null)}
                  variant="outline"
                  className="border-stone-200"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteClient} onOpenChange={() => setDeleteClient(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {deleteClient?.name}? Esta ação não pode ser desfeita.
              Todos os endereços, telefones e parentes associados também serão excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-stone-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteMutation.mutate(deleteClient.id)}
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