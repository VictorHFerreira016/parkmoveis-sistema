// supabaseClient.js
// Integração direta com Supabase
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase - use import.meta.env para Vite ou process.env para Create React App
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Se você estiver usando Create React App, descomente as linhas abaixo e comente as de cima:
// const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
// const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API adaptada para usar com seus componentes React
export const api = {
  entities: {
    Client: {
      async list() {
        const { data, error } = await supabase
          .from('clientes')
          .select(`
            *,
            enderecos(*),
            telefones(*),
            parentes(*)
          `)
          .order('criado_em', { ascending: false });
        
        if (error) throw error;
        
        return data.map(client => ({
          id: client.id_cliente,
          name: client.nome,
          cpf: client.cpf,
          rg: client.rg,
          birthDate: client.data_nascimento,
          occupation: client.ocupacao,
          email: client.email,
          phone: client.celular,
          createdAt: client.criado_em,
          addresses: client.enderecos || [],
          phones: client.telefones || [],
          relatives: client.parentes || []
        }));
      },

      async get(id) {
        const { data, error } = await supabase
          .from('clientes')
          .select(`
            *,
            enderecos(*),
            telefones(*),
            parentes(*)
          `)
          .eq('id_cliente', id)
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id_cliente,
          name: data.nome,
          cpf: data.cpf,
          rg: data.rg,
          birthDate: data.data_nascimento,
          occupation: data.ocupacao,
          email: data.email,
          phone: data.celular,
          createdAt: data.criado_em,
          addresses: data.enderecos || [],
          phones: data.telefones || [],
          relatives: data.parentes || []
        };
      },

      async create(clientData) {
        // 1. Criar o cliente
        const { data: client, error: clientError } = await supabase
          .from('clientes')
          .insert({
            nome: clientData.name,
            cpf: clientData.cpf,
            rg: clientData.rg,
            data_nascimento: clientData.birthDate,
            ocupacao: clientData.occupation,
            email: clientData.email,
            celular: clientData.phone
          })
          .select()
          .single();
        
        if (clientError) throw clientError;

        const clientId = client.id_cliente;

        // 2. Criar endereços se houver
        if (clientData.addresses && clientData.addresses.length > 0) {
          const addressesData = clientData.addresses.map(addr => ({
            id_cliente: clientId,
            logradouro: addr.logradouro,
            numero: addr.numero,
            bairro: addr.bairro,
            cidade: addr.cidade,
            estado: addr.estado,
            cep: addr.cep,
            tipo: addr.tipo
          }));

          const { error: addressError } = await supabase
            .from('enderecos')
            .insert(addressesData);
          
          if (addressError) throw addressError;
        }

        // 3. Criar telefones adicionais se houver
        if (clientData.phones && clientData.phones.length > 0) {
          const phonesData = clientData.phones.map(phone => ({
            id_cliente: clientId,
            numero: phone.numero,
            tipo: phone.tipo,
            pertence_a: phone.pertence_a
          }));

          const { error: phoneError } = await supabase
            .from('telefones')
            .insert(phonesData);
          
          if (phoneError) throw phoneError;
        }

        // 4. Criar parentes se houver
        if (clientData.relatives && clientData.relatives.length > 0) {
          const relativesData = clientData.relatives.map(rel => ({
            id_cliente: clientId,
            nome_parente: rel.nome_parente,
            parentesco: rel.parentesco
          }));

          const { error: relativeError } = await supabase
            .from('parentes')
            .insert(relativesData);
          
          if (relativeError) throw relativeError;
        }

        // 5. Retornar cliente completo
        return await this.get(clientId);
      },

      async update(id, clientData) {
        // 1. Atualizar dados do cliente
        const { data: client, error: clientError } = await supabase
          .from('clientes')
          .update({
            nome: clientData.name,
            cpf: clientData.cpf,
            rg: clientData.rg,
            data_nascimento: clientData.birthDate,
            ocupacao: clientData.occupation,
            email: clientData.email,
            celular: clientData.phone
          })
          .eq('id_cliente', id)
          .select()
          .single();
        
        if (clientError) throw clientError;

        // 2. Gerenciar endereços
        if (clientData.addresses) {
          // Deletar endereços antigos
          await supabase.from('enderecos').delete().eq('id_cliente', id);
          
          // Inserir novos endereços
          if (clientData.addresses.length > 0) {
            const addressesData = clientData.addresses.map(addr => ({
              id_cliente: id,
              logradouro: addr.logradouro,
              numero: addr.numero,
              bairro: addr.bairro,
              cidade: addr.cidade,
              estado: addr.estado,
              cep: addr.cep,
              tipo: addr.tipo
            }));

            await supabase.from('enderecos').insert(addressesData);
          }
        }

        // 3. Gerenciar telefones
        if (clientData.phones) {
          // Deletar telefones antigos
          await supabase.from('telefones').delete().eq('id_cliente', id);
          
          // Inserir novos telefones
          if (clientData.phones.length > 0) {
            const phonesData = clientData.phones.map(phone => ({
              id_cliente: id,
              numero: phone.numero,
              tipo: phone.tipo,
              pertence_a: phone.pertence_a
            }));

            await supabase.from('telefones').insert(phonesData);
          }
        }

        // 4. Gerenciar parentes
        if (clientData.relatives) {
          // Deletar parentes antigos
          await supabase.from('parentes').delete().eq('id_cliente', id);
          
          // Inserir novos parentes
          if (clientData.relatives.length > 0) {
            const relativesData = clientData.relatives.map(rel => ({
              id_cliente: id,
              nome_parente: rel.nome_parente,
              parentesco: rel.parentesco
            }));

            await supabase.from('parentes').insert(relativesData);
          }
        }

        // 5. Retornar cliente completo atualizado
        return await this.get(id);
      },

      async delete(id) {
        // O Supabase deve estar configurado com CASCADE DELETE
        // Se não estiver, deletar manualmente as relações primeiro
        
        // Deletar endereços
        await supabase.from('enderecos').delete().eq('id_cliente', id);
        
        // Deletar telefones
        await supabase.from('telefones').delete().eq('id_cliente', id);
        
        // Deletar parentes
        await supabase.from('parentes').delete().eq('id_cliente', id);
        
        // Deletar cliente
        const { error } = await supabase
          .from('clientes')
          .delete()
          .eq('id_cliente', id);
        
        if (error) throw error;
        
        return { success: true };
      }
    },

    Product: {
      async list() {
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .order('nome');
        
        if (error) throw error;
        
        return data.map(product => ({
          id: product.id_produto,
          barcode: product.codigo_barras,
          name: product.nome,
          description: product.descricao,
          brand: product.fabrica_modelo,
          stock: product.quantidade,
          stockLocation: product.local_estoque,
          price: parseFloat(product.preco_base_vista || 0),
          installmentPrice: parseFloat(product.preco_base_prazo || 0),
          sale_price: parseFloat(product.preco_base_vista || 0),
          cost_price: parseFloat(product.preco_base_prazo || 0)
        }));
      },

      async get(id) {
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .eq('id_produto', id)
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id_produto,
          barcode: data.codigo_barras,
          name: data.nome,
          description: data.descricao,
          brand: data.fabrica_modelo,
          stock: data.quantidade,
          stockLocation: data.local_estoque,
          price: parseFloat(data.preco_base_vista || 0),
          installmentPrice: parseFloat(data.preco_base_prazo || 0),
          sale_price: parseFloat(data.preco_base_vista || 0),
          cost_price: parseFloat(data.preco_base_prazo || 0)
        };
      },

      async create(productData) {
        const { data, error } = await supabase
          .from('produtos')
          .insert({
            codigo_barras: productData.barcode,
            nome: productData.name,
            descricao: productData.description,
            fabrica_modelo: productData.brand,
            quantidade: productData.stock || 0,
            local_estoque: productData.stockLocation,
            preco_base_vista: productData.price,
            preco_base_prazo: productData.installmentPrice
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id_produto,
          barcode: data.codigo_barras,
          name: data.nome,
          description: data.descricao,
          brand: data.fabrica_modelo,
          stock: data.quantidade,
          stockLocation: data.local_estoque,
          price: parseFloat(data.preco_base_vista || 0),
          installmentPrice: parseFloat(data.preco_base_prazo || 0)
        };
      },

      async update(id, productData) {
        const { data, error } = await supabase
          .from('produtos')
          .update({
            codigo_barras: productData.barcode,
            nome: productData.name,
            descricao: productData.description,
            fabrica_modelo: productData.brand,
            quantidade: productData.stock,
            local_estoque: productData.stockLocation,
            preco_base_vista: productData.price,
            preco_base_prazo: productData.installmentPrice
          })
          .eq('id_produto', id)
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id_produto,
          barcode: data.codigo_barras,
          name: data.nome,
          description: data.descricao,
          brand: data.fabrica_modelo,
          stock: data.quantidade,
          stockLocation: data.local_estoque,
          price: parseFloat(data.preco_base_vista || 0),
          installmentPrice: parseFloat(data.preco_base_prazo || 0)
        };
      },

      async delete(id) {
        const { error } = await supabase
          .from('produtos')
          .delete()
          .eq('id_produto', id);
        
        if (error) throw error;
        
        return { success: true };
      }
    },

    Address: {
      async create(addressData) {
        const { data, error } = await supabase
          .from('enderecos')
          .insert({
            id_cliente: addressData.clientId,
            logradouro: addressData.street,
            numero: addressData.number,
            bairro: addressData.neighborhood,
            cidade: addressData.city,
            estado: addressData.state,
            cep: addressData.zipCode,
            tipo: addressData.type
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      },

      async update(id, addressData) {
        const { data, error } = await supabase
          .from('enderecos')
          .update({
            logradouro: addressData.street,
            numero: addressData.number,
            bairro: addressData.neighborhood,
            cidade: addressData.city,
            estado: addressData.state,
            cep: addressData.zipCode,
            tipo: addressData.type
          })
          .eq('id_endereco', id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      },

      async delete(id) {
        const { error } = await supabase
          .from('enderecos')
          .delete()
          .eq('id_endereco', id);
        
        if (error) throw error;
        return { success: true };
      }
    },

    Sale: {
      async list() {
        const { data, error } = await supabase
          .from('vendas')
          .select(`
            *,
            clientes(nome, cpf),
            venda_itens(*, produtos(nome))
          `)
          .order('data_venda', { ascending: false });
        
        if (error) throw error;
        return data;
      },

      async create(saleData) {
        const { data, error } = await supabase
          .from('vendas')
          .insert({
            id_cliente: saleData.clientId,
            valor_total: saleData.totalValue,
            tipo_pagamento: saleData.paymentType,
            status: saleData.status || 'pendente'
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    }
  }
};