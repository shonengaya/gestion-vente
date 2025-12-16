import React, { useEffect, useState } from 'react';
import { getProducts, saveProduct, deleteProduct } from '../../services/productService';
import { Product } from '../../types';
import { ProductForm } from './ProductForm';
import { Card } from '../ui/Card';
import { formatAriary } from '../../constants';

export const ProductList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);

    const fetchProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
        try {
            await deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            alert('Erreur lors de la suppression');
        }
    };

    const handleSave = async (data: Partial<Product>) => {
        setIsSaving(true);
        try {
            await saveProduct(data);
            setIsModalOpen(false);
            setEditingProduct(undefined);
            fetchProducts(); // Refresh list
        } catch (error) {
            alert("Erreur lors de l'enregistrement");
        } finally {
            setIsSaving(false);
        }
    };

    // Icons (inline for simplicity, or import)
    const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>;
    const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152.05a16,16,0,0,0-4.69,11.31v44.69A16,16,0,0,0,48,224H92.69a16,16,0,0,0,11.31-4.69L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path></svg>;
    const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path></svg>;

    if (loading) return <div className="text-center p-8">Chargement des produits...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Mes Produits & Services</h2>
                <button
                    onClick={() => { setEditingProduct(undefined); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
                >
                    <PlusIcon />
                    <span className="hidden sm:inline">Nouveau Produit</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                    <Card key={product.id} className="relative group hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-gray-900">{product.name}</h3>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${product.type === 'ART' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                                    {product.type === 'ART' ? 'Article' : 'Service'}
                                </span>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(product)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full hover:text-brand-600">
                                    <EditIcon />
                                </button>
                                <button onClick={() => handleDelete(product.id)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full hover:text-red-600">
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                            <div>
                                <p className="text-xs text-gray-500">Prix unitaire</p>
                                <p className="text-lg font-bold text-brand-600">{formatAriary(product.price)}</p>
                            </div>
                            {product.type === 'ART' && (
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Stock</p>
                                    <p className={`font-bold ${product.stock === 0 ? 'text-red-500' : product.stock < 5 ? 'text-orange-500' : 'text-gray-900'}`}>
                                        {product.stock}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                ))}

                {products.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                        <p>Aucun produit enregistré.</p>
                        <p className="text-sm">Commencez par ajouter vos produits ou services.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>
                        <ProductForm
                            initialData={editingProduct}
                            onSubmit={handleSave}
                            onCancel={() => setIsModalOpen(false)}
                            isLoading={isSaving}
                        />
                    </Card>
                </div>
            )}
        </div>
    );
};
