import React, { useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useBudget } from '../hooks/useBudget';
import { MobileNav } from './layout/MobileNav';
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';
import { Overview } from './dashboard/Overview';
import { SalesView } from './sales/SalesView';
import { ExpensesView } from './expenses/ExpensesView';
import { FundingView } from './funding/FundingView'; // Import FundingView
import { BudgetDashboard } from './budget/BudgetDashboard';
import { SalesModal } from './sales/SalesModal';
import { ExpensesModal } from './expenses/ExpensesModal';
import { FundingModal } from './funding/FundingModal';
import { ProductList } from './products/ProductList';
import { InstallPWA } from './InstallPWA';
import { AdminDashboard } from './AdminDashboard';
import { Card } from './ui/Card';
import { LockIcon } from './ui/Icons';
import { supabase } from '../services/supabase';

export const Dashboard: React.FC = () => {
  // 1. Data Logic (Hook)
  const {
    // Data
    sales, expenses, salesHistory, expensesHistory,
    loading, currentUserEmail, userProfile, isDeactivated, isExpired, isAdmin,
    // Filters
    timeFilter, setTimeFilter, dateRange, setDateRange,
    saleSearchQuery, setSaleSearchQuery, saleFilterService, setSaleFilterService, saleFilterTime, setSaleFilterTime,
    expenseSearchQuery, setExpenseSearchQuery, expenseFilterTime, setExpenseFilterTime,
    // Computed
    filteredSalesHistory, filteredExpensesHistory, uniqueServices,
    totals, chartData, pieData,
    funding, // Get Funding Data
    // Actions
    handleAddSale, handleUpdateSale, handleDeleteSale,
    handleAddExpense, handleUpdateExpense, handleDeleteExpense,
    handleUpdateFunding, handleDeleteFunding, // New Actions
    fetchData
  } = useDashboardData();

  // Budget Data
  const { categories } = useBudget();

  // 2. UI State
  // Added 'funding' tab
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'expenses' | 'products' | 'budget' | 'funding'>('overview');

  // Modals
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [initialSaleData, setInitialSaleData] = useState({
    customer_name: '', service_name: '', amount: '', date: new Date().toISOString().split('T')[0], payment_method: 'Orange Money'
  });

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [initialExpenseData, setInitialExpenseData] = useState({
    description: '', amount: '', date: new Date().toISOString().split('T')[0]
  });

  // Funding Modal State
  const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
  const [fundingSearchQuery, setFundingSearchQuery] = useState('');
  const [editingFundingId, setEditingFundingId] = useState<string | null>(null);
  const [initialFundingData, setInitialFundingData] = useState<any>(null);


  // Handlers for Modals
  const handleOpenNewSale = () => {
    setInitialSaleData({ customer_name: '', service_name: '', amount: '', date: new Date().toISOString().split('T')[0], payment_method: 'Orange Money' });
    setEditingSaleId(null);
    setIsSaleModalOpen(true);
  };

  const handleOpenEditSale = (sale: any) => {
    setInitialSaleData({
      customer_name: sale.customer_name,
      service_name: sale.service_name,
      amount: String(sale.amount),
      date: sale.date,
      payment_method: sale.payment_method
    });
    setEditingSaleId(sale.id);
    setIsSaleModalOpen(true);
    setActiveTab('sales');
  };

  const handleSubmitSale = async (data: any) => {
    const payload = { ...data, amount: Number(data.amount) };
    if (editingSaleId) {
      await handleUpdateSale(editingSaleId, payload);
    } else {
      await handleAddSale(payload);
    }
    setIsSaleModalOpen(false);
  };

  const handleOpenNewExpense = () => {
    setInitialExpenseData({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
    setEditingExpenseId(null);
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (expense: any) => {
    setInitialExpenseData({
      description: expense.description,
      amount: String(expense.amount),
      date: expense.date
    });
    setEditingExpenseId(expense.id);
    setIsExpenseModalOpen(true);
    setActiveTab('expenses');
  };

  const handleSubmitExpense = async (data: any) => {
    const payload = { ...data, amount: Number(data.amount) };
    if (editingExpenseId) {
      await handleUpdateExpense(editingExpenseId, payload);
    } else {
      await handleAddExpense(payload);
    }
    setIsExpenseModalOpen(false);
  };

  // Funding Handlers
  const handleOpenNewFunding = () => {
    setInitialFundingData(null);
    setEditingFundingId(null);
    setIsFundingModalOpen(true);
  };

  const handleOpenEditFunding = (item: any) => {
    setInitialFundingData(item);
    setEditingFundingId(item.id);
    setIsFundingModalOpen(true);
  };

  // 3. Early Returns (Loading, Admin, Expired)
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-900 font-medium">Chargement...</div>;

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">Admin Panel</h1>
          <button onClick={() => supabase.auth.signOut()} className="text-gray-500 hover:text-red-600 font-medium text-sm">Déconnexion</button>
        </nav>
        <AdminDashboard />
      </div>
    );
  }

  if (isExpired || isDeactivated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="text-center max-w-md w-full py-12">
          <div className="flex justify-center mb-6 text-red-500"><LockIcon /></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{isDeactivated ? "Compte Désactivé" : "Période d'essai terminée"}</h1>
          <p className="text-gray-500 mb-8">
            {isDeactivated ? "Votre compte a été désactivé." : "Votre accès a expiré. Veuillez contacter l'administrateur."}
          </p>
          <div className="bg-gray-100 p-4 rounded-xl mb-6 text-sm text-gray-700">Contact: <span className="font-bold">034 96 712 22</span></div>
          <button onClick={() => supabase.auth.signOut()} className="text-emerald-600 font-medium hover:underline">Se déconnecter</button>
        </Card>
      </div>
    );
  }

  // 4. Main Render
  return (
    <div className="min-h-screen pb-20 md:pb-8 bg-gray-50">
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        currentUserEmail={currentUserEmail}
      />

      <main className="md:ml-64 min-h-screen bg-[#F5F6FA] text-slate-800 font-sans">
        <Header
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          userProfile={userProfile}
          currentUserEmail={currentUserEmail}
        />

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {activeTab === 'overview' && (
            <Overview
              totals={totals}
              chartData={chartData}
              pieData={pieData}
              salesHistory={salesHistory}
              expensesHistory={expensesHistory}
              handleEditSale={handleOpenEditSale}
              handleEditExpense={handleOpenEditExpense}
              timeFilter={timeFilter}
              dateRange={dateRange}
              onAddFunding={handleOpenNewFunding} // Open funding modal
            />
          )}

          {activeTab === 'sales' && (
            <SalesView
              filteredSales={filteredSalesHistory}
              totals={{ sales: totals.sales }}
              searchQuery={saleSearchQuery}
              setSearchQuery={setSaleSearchQuery}
              serviceFilter={saleFilterService}
              setServiceFilter={setSaleFilterService}
              timeFilter={saleFilterTime}
              setTimeFilter={setSaleFilterTime}
              uniqueServices={uniqueServices}
              onAdd={handleOpenNewSale}
              onEdit={handleOpenEditSale}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              filteredExpenses={filteredExpensesHistory}
              searchQuery={expenseSearchQuery}
              setSearchQuery={setExpenseSearchQuery}
              timeFilter={expenseFilterTime}
              setTimeFilter={setExpenseFilterTime}
              onAdd={handleOpenNewExpense}
              onEdit={handleOpenEditExpense}
            />
          )}

          {/* New Funding Tab */}
          {activeTab === 'funding' && (
            <FundingView
              funding={funding}
              searchQuery={fundingSearchQuery}
              setSearchQuery={setFundingSearchQuery}
              timeFilter={timeFilter}
              onAdd={handleOpenNewFunding}
              onEdit={handleOpenEditFunding}
            />
          )}


          {activeTab === 'products' && (
            <ProductList />
          )}

          {activeTab === 'budget' && (
            <BudgetDashboard
              refreshTrigger={expensesHistory}
              availableFunds={totals.treasury}
            />
          )}
        </div>
      </main>

      <InstallPWA />

      <SalesModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onSubmit={handleSubmitSale}
        onDelete={async (id) => {
          if (window.confirm("Voulez-vous vraiment supprimer cette vente ?")) {
            await handleDeleteSale(id);
            setIsSaleModalOpen(false);
          }
        }}
        editingSaleId={editingSaleId}
        initialData={initialSaleData}
      />

      <ExpensesModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmit={handleSubmitExpense}
        onDelete={async (id) => {
          if (window.confirm("Voulez-vous vraiment supprimer cette dépense ?")) {
            await handleDeleteExpense(id);
            setIsExpenseModalOpen(false);
          }
        }}
        editingExpenseId={editingExpenseId}
        initialData={initialExpenseData}
        categories={categories}
      />

      <FundingModal
        isOpen={isFundingModalOpen}
        onClose={() => setIsFundingModalOpen(false)}
        onSuccess={() => fetchData()}
        initialData={initialFundingData}
        fundingId={editingFundingId}
        onUpdate={handleUpdateFunding}
        onDelete={handleDeleteFunding}
      />
    </div>
  );
};