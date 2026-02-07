import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Users, Package, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Dashboard() {
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list()
  });

  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const averageTicket = sales.length > 0 ? totalRevenue / sales.length : 0;

  const stats = [
    { 
      label: 'Clientes', 
      value: clients.length, 
      icon: Users, 
      color: 'bg-blue-50 text-blue-600',
      link: 'Clients'
    },
    { 
      label: 'Produtos', 
      value: products.length, 
      icon: Package, 
      color: 'bg-amber-50 text-amber-600',
      link: 'Products'
    },
    { 
      label: 'Vendas', 
      value: sales.length, 
      icon: ShoppingCart, 
      color: 'bg-green-50 text-green-600',
      link: 'Sales'
    },
    { 
      label: 'Faturamento', 
      value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      icon: DollarSign, 
      color: 'bg-purple-50 text-purple-600',
      link: 'Sales'
    },
  ];

  const recentSales = sales.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-500 mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={createPageUrl(stat.link)}
              className="bg-white rounded-xl p-5 border border-stone-100 hover:border-stone-200 hover:shadow-sm transition-all duration-200"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
              <p className="text-sm text-stone-500">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">Vendas Recentes</h2>
          <Link 
            to={createPageUrl('Sales')}
            className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
          >
            Ver todas
          </Link>
        </div>
        {recentSales.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {recentSales.map((sale) => (
              <div key={sale.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-900">{sale.client_name}</p>
                  <p className="text-sm text-stone-500">
                    {sale.items?.length || 0} {sale.items?.length === 1 ? 'item' : 'itens'} • 
                    {sale.payment_type === 'avista' ? ' À vista' : ` ${sale.installments}x`}
                  </p>
                </div>
                <p className="font-semibold text-stone-900">
                  R$ {sale.total_amount?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <ShoppingCart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">Nenhuma venda registrada ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}