// supabaseClient.js - VERSÃO CORRIGIDA E SIMPLIFICADA
// ============================================================================
// Este arquivo exporta o client do Supabase diretamente para uso em queries
// ============================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ AVISO: Variáveis de ambiente Supabase não configuradas!');
  console.error('Certifique-se de que .env contém VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
}

// Client principal do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Exporta também como 'api' para compatibilidade com código existente

// ============================================================================
// HELPERS ÚTEIS (OPCIONAL)
// ============================================================================

/**
 * Formata erros do Supabase para facilitar debug
 * @param {Error} error - Erro do Supabase
 * @param {string} context - Contexto da operação
 */
export const logSupabaseError = (error, context) => {
  console.error(`❌ Erro Supabase [${context}]:`, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
    timestamp: new Date().toISOString()
  });
};

/**
 * Helper para buscar vendas com todos os relacionamentos
 * @returns {Promise<Array>} Lista de vendas com clientes, itens e parcelas
 */
export const fetchVendasCompletas = async () => {
  const { data, error } = await supabase
    .from('vendas')
    .select(`
      *,
      cliente:clientes!vendas_id_cliente_fkey(id_cliente, nome, celular, cpf),
      itens:venda_itens(
        id_venda_item,
        id_produto,
        quantidade,
        preco_unitario_praticado,
        produto:produtos!venda_itens_id_produto_fkey(id_produto, nome)
      ),
      parcelas(
        id_parcelas,
        data_vencimento,
        valor_parcela,
        status,
        data_pagamento
      )
    `)
    .order('data_venda', { ascending: false });

  if (error) {
    logSupabaseError(error, 'fetchVendasCompletas');
    throw error;
  }

  return data;
};

/**
 * Helper para criar uma venda completa (venda + itens + parcelas)
 * @param {Object} vendaData - Dados da venda
 * @returns {Promise<Object>} Venda criada
 */
export const criarVendaCompleta = async (vendaData) => {
  try {
    // 1️⃣ Criar venda principal
    const { data: venda, error: vendaError } = await supabase
      .from('vendas')
      .insert({
        id_cliente: vendaData.id_cliente,
        valor_total: vendaData.valor_total,
        tipo_pagamento: vendaData.tipo_pagamento,
        status: vendaData.status || 'concluida'
      })
      .select()
      .single();

    if (vendaError) {
      logSupabaseError(vendaError, 'criarVendaCompleta - Venda');
      throw vendaError;
    }

    const vendaId = venda.id;

    // 2️⃣ Criar itens da venda
    if (vendaData.itens?.length > 0) {
      const itensData = vendaData.itens.map(item => ({
        id_venda: vendaId,
        id_produto: item.id_produto,
        quantidade: item.quantidade,
        preco_unitario_praticado: item.preco_unitario_praticado
      }));

      const { error: itensError } = await supabase
        .from('venda_itens')
        .insert(itensData);

      if (itensError) {
        logSupabaseError(itensError, 'criarVendaCompleta - Itens');
        // Rollback: deletar venda criada
        await supabase.from('vendas').delete().eq('id', vendaId);
        throw itensError;
      }
    }

    // 3️⃣ Criar parcelas (se pagamento a prazo)
    if (vendaData.tipo_pagamento === 'prazo' && vendaData.parcelas?.length > 0) {
      const parcelasData = vendaData.parcelas.map(parcela => ({
        id_venda: vendaId,
        data_vencimento: parcela.data_vencimento,
        valor_parcela: parcela.valor_parcela,
        status: parcela.status || 'pendente'
      }));

      const { error: parcelasError } = await supabase
        .from('parcelas')
        .insert(parcelasData);

      if (parcelasError) {
        logSupabaseError(parcelasError, 'criarVendaCompleta - Parcelas');
        // Rollback: deletar venda e itens criados
        await supabase.from('venda_itens').delete().eq('id_venda', vendaId);
        await supabase.from('vendas').delete().eq('id', vendaId);
        throw parcelasError;
      }
    }

    // 4️⃣ Buscar venda completa criada
    const { data: vendaCompleta, error: fetchError } = await supabase
      .from('vendas')
      .select(`
        *,
        cliente:clientes!vendas_id_cliente_fkey(id_cliente, nome, celular),
        itens:venda_itens(
          id_venda_item,
          id_produto,
          quantidade,
          preco_unitario_praticado,
          produto:produtos!venda_itens_id_produto_fkey(id_produto, nome)
        ),
        parcelas(
          id_parcelas,
          data_vencimento,
          valor_parcela,
          status
        )
      `)
      .eq('id', vendaId)
      .single();

    if (fetchError) {
      logSupabaseError(fetchError, 'criarVendaCompleta - Fetch');
      throw fetchError;
    }

    return vendaCompleta;
  } catch (error) {
    console.error('Erro ao criar venda completa:', error);
    throw error;
  }
};

/**
 * Helper para marcar parcela como paga
 * @param {number} parcelaId - ID da parcela
 * @returns {Promise<Object>} Parcela atualizada
 */
export const marcarParcelaPaga = async (parcelaId) => {
  const { data, error } = await supabase
    .from('parcelas')
    .update({
      status: 'paga',
      data_pagamento: new Date().toISOString().split('T')[0]
    })
    .eq('id_parcelas', parcelaId)
    .select()
    .single();

  if (error) {
    logSupabaseError(error, 'marcarParcelaPaga');
    throw error;
  }

  return data;
};

/**
 * Helper para buscar parcelas vencidas
 * @returns {Promise<Array>} Lista de parcelas vencidas
 */
export const fetchParcelasVencidas = async () => {
  const hoje = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('parcelas')
    .select(`
      *,
      venda:vendas!parcelas_id_venda_fkey(
        id,
        valor_total,
        cliente:clientes!vendas_id_cliente_fkey(nome, celular)
      )
    `)
    .eq('status', 'pendente')
    .lt('data_vencimento', hoje)
    .order('data_vencimento', { ascending: true });

  if (error) {
    logSupabaseError(error, 'fetchParcelasVencidas');
    throw error;
  }

  return data;
};

/**
 * Helper para buscar produtos com estoque baixo
 * @param {number} limite - Quantidade mínima de estoque (padrão: 5)
 * @returns {Promise<Array>} Lista de produtos
 */
export const fetchProdutosEstoqueBaixo = async (limite = 5) => {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .lte('quantidade', limite)
    .order('quantidade', { ascending: true });

  if (error) {
    logSupabaseError(error, 'fetchProdutosEstoqueBaixo');
    throw error;
  }

  return data;
};

// ============================================================================
// COMPATIBILIDADE COM CÓDIGO LEGADO (se necessário)
// ============================================================================

// Se algum código antigo usa api.entities.Client, etc., você pode descomentar:
/*
export const apiLegado = {
  entities: {
    Client: {
      list: async () => {
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .order('criado_em', { ascending: false });
        
        if (error) throw error;
        
        // Converte para formato antigo se necessário
        return data.map(c => ({
          id: c.id_cliente,
          name: c.nome,
          phone: c.celular,
          // ... outros campos
        }));
      }
    },
    Product: {
      list: async () => {
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .order('nome');
        
        if (error) throw error;
        
        return data.map(p => ({
          id: p.id_produto,
          name: p.nome,
          price: p.preco_base_vista,
          // ... outros campos
        }));
      }
    },
    Sale: {
      list: async () => {
        return fetchVendasCompletas();
      },
      create: async (data) => {
        return criarVendaCompleta(data);
      }
    }
  }
};
*/

// supabaseClient.js - ADICIONE OU SUBSTITUA NO FINAL DO ARQUIVO

export const api = {
  ...supabase,
  entities: {
    Client: {
      list: async () => {
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .order('nome', { ascending: true });
        
        if (error) throw error;
        
        // Mapeia os nomes das colunas do seu banco para o que o React espera
        return data.map(c => ({
          ...c,
          id: c.id_cliente, // De id_cliente para id
          name: c.nome,       // De nome para name
          phone: c.celular,   // De celular para phone
          birthDate: c.data_nascimento,
          occupation: c.ocupacao
        }));
      },
      create: async (payload) => {
        const { data, error } = await supabase
          .from('clientes')
          .insert([{
            nome: payload.name,
            cpf: payload.cpf,
            celular: payload.phone,
            email: payload.email,
            rg: payload.rg,
            data_nascimento: payload.birthDate,
            ocupacao: payload.occupation
          }])
          .select().single();
        if (error) throw error;
        return data;
      },
      update: async (id, payload) => {
        const { data, error } = await supabase
          .from('clientes')
          .update({
            nome: payload.name,
            celular: payload.phone,
            cpf: payload.cpf,
            email: payload.email,
            rg: payload.rg,
            data_nascimento: payload.birthDate,
            ocupacao: payload.occupation
          })
          .eq('id_cliente', id)
          .select().single();
        if (error) throw error;
        return data;
      },
      delete: async (id) => {
        const { error } = await supabase
          .from('clientes')
          .delete()
          .eq('id_cliente', id);
        if (error) throw error;
        return true;
      }
    },
    Product: {
      list: async () => {
        const { data, error } = await supabase
          .from('produtos') // Verifique se o nome da tabela no seu Supabase é 'produtos'
          .select('*')
          .order('nome', { ascending: true });
        
        if (error) throw error;
        
        // Mapeia os campos do banco para o que o componente Products.jsx espera
        return data.map(p => ({
          ...p,
          id: p.id_produto,
          name: p.nome,
          brand: p.marca,
          category: p.categoria,
          price: p.preco_base_vista,
          sale_price: p.preco_venda,
          cost_price: p.preco_custo,
          stock: p.quantidade,
          image_url: p.imagem_url
        }));
      },

      create: async (payload) => {
        const { data, error } = await supabase
          .from('produtos')
          .insert([{
            nome: payload.name,
            marca: payload.brand,
            categoria: payload.category,
            preco_base_vista: payload.price,
            quantidade: payload.stock,
            imagem_url: payload.image_url
            // adicione outros campos conforme sua tabela
          }])
          .select().single();
        if (error) throw error;
        return data;
      },

      update: async (id, payload) => {
        const { data, error } = await supabase
          .from('produtos')
          .update({
            nome: payload.name,
            marca: payload.brand,
            categoria: payload.category,
            preco_base_vista: payload.price,
            quantidade: payload.stock
          })
          .eq('id_produto', id)
          .select().single();
        if (error) throw error;
        return data;
      },

      delete: async (id) => {
        const { error } = await supabase
          .from('produtos')
          .delete()
          .eq('id_produto', id);
        if (error) throw error;
        return true;
      }
    },
    // Dentro do objeto api em supabaseClient.js

    Sale: {
      list: async () => {
        const { data, error } = await supabase
          .from('vendas')
          .select(`
            *,
            cliente:clientes!vendas_id_cliente_fkey(id_cliente, nome, celular),
            itens:venda_itens(
              id_venda_item,
              id_produto,
              quantidade,
              preco_unitario_praticado,
              produto:produtos!venda_itens_id_produto_fkey(id_produto, nome)
            ),
            parcelas(
              id_parcelas,
              data_vencimento,
              valor_parcela,
              status,
              data_pagamento
            )
          `)
          .order('data_venda', { ascending: false });

        if (error) throw error;
        return data;
      },

      create: async (formData) => {
        // 1️⃣ Inserir venda principal
        const { data: venda, error: vendaError } = await supabase
          .from('vendas')
          .insert([{
            id_cliente: formData.id_cliente,
            valor_total: formData.valor_total,
            tipo_pagamento: formData.tipo_pagamento,
            status: formData.status || 'concluida'
          }])
          .select()
          .single();

        if (vendaError) throw vendaError;

        // 2️⃣ Inserir itens da venda
        if (formData.itens?.length > 0) {
          const vendaItens = formData.itens.map(item => ({
            id_venda: venda.id, // O id gerado pela venda acima
            id_produto: item.id_produto,
            quantidade: item.quantidade,
            preco_unitario_praticado: item.preco_unitario_praticado
          }));

          const { error: itensError } = await supabase
            .from('venda_itens')
            .insert(vendaItens);

          if (itensError) throw itensError;
        }

        // 3️⃣ Inserir parcelas (se for a prazo)
        if (formData.tipo_pagamento === 'prazo' && formData.parcelas?.length > 0) {
          const parcelas = formData.parcelas.map(parcela => ({
            id_venda: venda.id,
            data_vencimento: parcela.data_vencimento,
            valor_parcela: parcela.valor_parcela,
            status: parcela.status || 'pendente'
          }));

          const { error: parcelasError } = await supabase
            .from('parcelas')
            .insert(parcelas);

          if (parcelasError) throw parcelasError;
        }

        return venda;
      }
    },
    // Dentro do objeto api em supabaseClient.js

    Installment: {
      list: async () => {
        const { data, error } = await supabase
          .from('parcelas')
          .select(`
            *,
            venda:vendas(
              id,
              cliente:clientes(nome, cpf, celular)
            )
          `)
          .order('data_vencimento', { ascending: true });

        if (error) {
          console.error("Erro na busca de parcela: ", error);
          throw error;
        }

        // Mapeia para o formato que o componente Installments.jsx espera
        return data.map(p => ({
          id: p.id_parcelas,
          sale_id: p.id_venda,
          due_date: p.data_vencimento,
          value: p.valor_parcela,
          status: p.status,
          payment_date: p.data_pagamento,
          client_name: p.venda?.cliente?.nome || 'Cliente não identificado',
          client_cpf: p.venda?.cliente?.cpf,
          installment_number: p.numero_parcela || 1,
          total_installments: p.total_parcelas || 1
        }));
      },

      update: async (id, payload) => {
        const { data, error } = await supabase
          .from('parcelas')
          .update(payload)
          .eq('id_parcelas', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    }
  }
};

export default supabase;
