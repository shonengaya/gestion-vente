import React, { useState, useEffect } from 'react';

interface TutorialStep {
    title: string;
    description: string;
    targetId?: string; // ID de l'élément à mettre en évidence
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface BudgetTutorialProps {
    isOpen: boolean;
    onClose: () => void;
}

const tutorialSteps: TutorialStep[] = [
    {
        title: "🎯 Bienvenue dans la Gestion Budgétaire !",
        description: "Ce module vous permet de planifier vos dépenses par catégorie et par période (jour, semaine, mois, etc.). Suivez ce guide pour comprendre comment l'utiliser. Cliquez sur 'Suivant' pour commencer."
    },
    {
        title: "📂 Étape 1: Créer des Catégories",
        description: "Commencez par créer des catégories pour organiser vos dépenses. Par exemple: 'Nourriture', 'Transport', 'Loyer', etc. Cliquez sur le bouton 'Gérer Catégories' pour ajouter vos catégories.",
        targetId: "btn-manage-categories"
    },
    {
        title: "📅 Étape 2: Choisir une Période",
        description: "Sélectionnez la période pour laquelle vous voulez budgéter. Vous pouvez budgéter par Jour, Semaine, Mois, Trimestre, Semestre ou Année. Chaque période est indépendante.",
        targetId: "period-tabs"
    },
    {
        title: "💰 Étape 3: Définir un Budget",
        description: "Cliquez sur 'Nouveau Budget' ou sur le bouton '+' pour définir le montant maximum que vous souhaitez dépenser dans une catégorie pour la période sélectionnée.",
        targetId: "btn-new-budget"
    },
    {
        title: "🛒 Étape 4: Ajouter des Dépenses",
        description: "Allez dans l'onglet 'Dépenses' (sidebar) et ajoutez vos dépenses en sélectionnant une catégorie. Le budget se mettra à jour automatiquement !",
    },
    {
        title: "📊 Étape 5: Suivre votre Budget",
        description: "Revenez sur 'Budgets' pour voir vos cartes de suivi. Les barres de progression vous montrent:\n• Vert: Moins de 80% utilisé\n• Orange: 80-100% utilisé\n• Rouge: Dépassement de budget",
        targetId: "budget-cards"
    },
    {
        title: "🔄 Étape 6: Navigation Temporelle",
        description: "Utilisez les flèches pour naviguer entre différentes périodes (exemple: mois précédent/suivant). Vos budgets sont enregistrés pour chaque période.",
        targetId: "date-navigation"
    },
    {
        title: "✅ C'est Tout !",
        description: "Vous savez maintenant tout ! Conseils:\n• Créez d'abord toutes vos catégories\n• Définissez des budgets réalistes\n• Ajoutez vos dépenses régulièrement\n• Consultez vos stats pour ajuster\n\nBonne gestion 🚀"
    }
];

export const BudgetTutorial: React.FC<BudgetTutorialProps> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

    const step = tutorialSteps[currentStep];
    const isLastStep = currentStep === tutorialSteps.length - 1;
    const isFirstStep = currentStep === 0;

    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(0);
            setHighlightedElement(null);
            return;
        }

        // Mettre en évidence l'élément cible
        if (step.targetId) {
            const element = document.getElementById(step.targetId);
            if (element) {
                setHighlightedElement(element);
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            setHighlightedElement(null);
        }
    }, [currentStep, isOpen, step.targetId]);

    if (!isOpen) return null;

    const handleNext = () => {
        if (isLastStep) {
            onClose();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (!isFirstStep) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        onClose();
    };

    return (
        <>
            {/* Overlay sombre */}
            <div
                className="fixed inset-0 bg-black/60 z-[100] transition-opacity"
                onClick={onClose}
            />

            {/* Highlight de l'élément ciblé */}
            {highlightedElement && (
                <div
                    className="fixed z-[101] pointer-events-none"
                    style={{
                        top: highlightedElement.getBoundingClientRect().top - 8,
                        left: highlightedElement.getBoundingClientRect().left - 8,
                        width: highlightedElement.getBoundingClientRect().width + 16,
                        height: highlightedElement.getBoundingClientRect().height + 16,
                        border: '3px solid #3b82f6',
                        borderRadius: '12px',
                        boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.5)',
                        animation: 'pulse 2s infinite'
                    }}
                />
            )}

            {/* Modal du tutoriel */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[102] w-full max-w-lg p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
                    {/* Progress bar */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase">
                                Étape {currentStep + 1} sur {tutorialSteps.length}
                            </span>
                            <button
                                onClick={handleSkip}
                                className="text-xs text-gray-400 hover:text-gray-600 font-medium"
                            >
                                Passer le tutoriel
                            </button>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500 rounded-full"
                                style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Contenu */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {step.title}
                        </h2>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {step.description}
                        </p>
                    </div>

                    {/* Boutons de navigation */}
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={handlePrevious}
                            disabled={isFirstStep}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${isFirstStep
                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            ← Précédent
                        </button>

                        <button
                            onClick={handleNext}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
                        >
                            {isLastStep ? '🎉 Terminer' : 'Suivant →'}
                        </button>
                    </div>

                    {/* Indicateurs de points */}
                    <div className="flex justify-center gap-2 mt-6">
                        {tutorialSteps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentStep(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentStep
                                        ? 'bg-blue-600 w-6'
                                        : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Animation CSS */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
            `}</style>
        </>
    );
};
