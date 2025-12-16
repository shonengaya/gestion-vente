import { supabase } from './supabase';
import { Product } from '../types';

export const getProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching products:', error);
        throw error;
    }

    return data || [];
};

export const saveProduct = async (product: Partial<Product>): Promise<Product> => {
    const { id, ...rest } = product;

    let query;
    if (id) {
        query = supabase
            .from('products')
            .update(rest) // Update fields, don't update ID
            .eq('id', id)
            .select()
            .single();
    } else {
        query = supabase
            .from('products')
            .insert(rest) // Insert creates new ID
            .select()
            .single();
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error saving product:', error);
        throw error;
    }

    return data;
};

export const deleteProduct = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};
