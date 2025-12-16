// Configuration Supabase
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://sodgatozuqvcndcmwudd.supabase.co";

// WARNING: In a real production app, ensure you are using the ANON key here.
// The service role key should NEVER be exposed in the frontend.
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZGdhdG96dXF2Y25kY213dWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDI5MzksImV4cCI6MjA4MDk3ODkzOX0.hXHBWAKcddXkf_dLycGXi573MSVc3ITrV-vsNr57SgQ";

// Currency Formatter
export const formatAriary = (amount: number): string => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const PAYMENT_METHODS = ['Orange Money', 'Telma MVola', 'Cash', 'Cheque', 'Virement'];
