import { describe, it, expect } from 'vitest';

/**
 * Tests unitaires pour les fonctions utilitaires du module Budget
 */

describe('Budget - Calcul de dates normalisées', () => {
    // Fonction utilitaire à tester (copiée de BudgetDashboard)
    const getNormalizedStartDate = (selectedDate: Date, periodType: string): string => {
        const d = new Date(selectedDate);
        if (periodType === 'day') {
            return d.toISOString().split('T')[0];
        } else if (periodType === 'week') {
            const day = d.getDay() || 7;
            const diff = d.getDate() - day + 1;
            const startD = new Date(d);
            startD.setDate(diff);
            return startD.toISOString().split('T')[0];
        } else if (periodType === 'month') {
            return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
        } else if (periodType === 'quarter') {
            const quarter = Math.floor(d.getMonth() / 3);
            return new Date(d.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
        } else if (periodType === 'semester') {
            const semester = d.getMonth() < 6 ? 0 : 6;
            return new Date(d.getFullYear(), semester, 1).toISOString().split('T')[0];
        } else if (periodType === 'year') {
            return new Date(d.getFullYear(), 0, 1).toISOString().split('T')[0];
        }
        return d.toISOString().split('T')[0];
    };

    it('should normalize daily period to same date', () => {
        const testDate = new Date('2025-12-17');
        const result = getNormalizedStartDate(testDate, 'day');
        expect(result).toBe('2025-12-17');
    });

    it('should normalize monthly period to first day of month', () => {
        const testDate = new Date('2025-12-17'); // 17 décembre
        const result = getNormalizedStartDate(testDate, 'month');
        expect(result).toBe('2025-12-01'); // Doit retourner le 1er décembre
    });

    it('should normalize weekly period to Monday', () => {
        const testDate = new Date('2025-12-17'); // Mercredi
        const result = getNormalizedStartDate(testDate, 'week');
        expect(result).toBe('2025-12-15'); // Lundi de cette semaine
    });

    it('should normalize yearly period to January 1st', () => {
        const testDate = new Date('2025-12-17');
        const result = getNormalizedStartDate(testDate, 'year');
        expect(result).toBe('2025-01-01');
    });

    it('should normalize quarterly period to first month of quarter', () => {
        // Q4 2025 (Oct-Nov-Dec)
        const testDate = new Date('2025-12-17');
        const result = getNormalizedStartDate(testDate, 'quarter');
        expect(result).toBe('2025-10-01');
    });

    it('should normalize semester period correctly', () => {
        // Second semester (July-Dec)
        const testDate = new Date('2025-12-17');
        const result = getNormalizedStartDate(testDate, 'semester');
        expect(result).toBe('2025-07-01');

        // First semester (Jan-June)
        const testDate2 = new Date('2025-03-15');
        const result2 = getNormalizedStartDate(testDate2, 'semester');
        expect(result2).toBe('2025-01-01');
    });

    it('should handle edge cases - end of month', () => {
        const testDate = new Date('2025-01-31'); // Last day of January
        const result = getNormalizedStartDate(testDate, 'month');
        expect(result).toBe('2025-01-01');
    });

    it('should handle edge cases - leap year', () => {
        const testDate = new Date('2024-02-29'); // Leap year
        const result = getNormalizedStartDate(testDate, 'month');
        expect(result).toBe('2024-02-01');
    });
});

describe('Budget - Calculs de pourcentages', () => {
    const calculatePercentage = (spent: number, planned: number): number => {
        if (planned <= 0) return 0;
        return (spent / planned) * 100;
    };

    it('should calculate 25% when 25k spent on 100k budget', () => {
        const result = calculatePercentage(25000, 100000);
        expect(result).toBe(25);
    });

    it('should calculate 90% when 180k spent on 200k budget', () => {
        const result = calculatePercentage(180000, 200000);
        expect(result).toBe(90);
    });

    it('should handle overspending (110%)', () => {
        const result = calculatePercentage(55000, 50000);
        expect(result).toBe(110);
    });

    it('should return 0% when no budget is set', () => {
        const result = calculatePercentage(1000, 0);
        expect(result).toBe(0);
    });

    it('should return 0% when nothing is spent', () => {
        const result = calculatePercentage(0, 100000);
        expect(result).toBe(0);
    });

    it('should handle decimal values correctly', () => {
        const result = calculatePercentage(33333, 100000);
        expect(result).toBeCloseTo(33.333, 2);
    });
});

describe('Budget - Détermination de couleur de statut', () => {
    const getBudgetStatusColor = (percentage: number): string => {
        if (percentage > 100) return 'red';
        if (percentage > 80) return 'orange';
        return 'green';
    };

    it('should return green for 0-79%', () => {
        expect(getBudgetStatusColor(0)).toBe('green');
        expect(getBudgetStatusColor(25)).toBe('green');
        expect(getBudgetStatusColor(79)).toBe('green');
    });

    it('should return orange for 80-100%', () => {
        expect(getBudgetStatusColor(80)).toBe('orange');
        expect(getBudgetStatusColor(90)).toBe('orange');
        expect(getBudgetStatusColor(100)).toBe('orange');
    });

    it('should return red for >100%', () => {
        expect(getBudgetStatusColor(101)).toBe('red');
        expect(getBudgetStatusColor(150)).toBe('red');
        expect(getBudgetStatusColor(200)).toBe('red');
    });
});

describe('Budget - Calcul du montant restant', () => {
    const calculateRemaining = (planned: number, spent: number): number => {
        return planned - spent;
    };

    it('should calculate positive remaining', () => {
        expect(calculateRemaining(100000, 25000)).toBe(75000);
    });

    it('should calculate zero remaining when exact budget', () => {
        expect(calculateRemaining(50000, 50000)).toBe(0);
    });

    it('should calculate negative remaining when overspent', () => {
        expect(calculateRemaining(50000, 55000)).toBe(-5000);
    });
});

describe('Budget - Validation des montants', () => {
    const isValidBudgetAmount = (amount: number): boolean => {
        return amount > 0 && amount < Number.MAX_SAFE_INTEGER && !isNaN(amount);
    };

    it('should accept valid positive amounts', () => {
        expect(isValidBudgetAmount(1000)).toBe(true);
        expect(isValidBudgetAmount(100000)).toBe(true);
        expect(isValidBudgetAmount(1000000)).toBe(true);
    });

    it('should reject zero', () => {
        expect(isValidBudgetAmount(0)).toBe(false);
    });

    it('should reject negative amounts', () => {
        expect(isValidBudgetAmount(-100)).toBe(false);
        expect(isValidBudgetAmount(-1000)).toBe(false);
    });

    it('should reject NaN', () => {
        expect(isValidBudgetAmount(NaN)).toBe(false);
    });

    it('should reject too large numbers', () => {
        expect(isValidBudgetAmount(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
    });
});

describe('Budget - Formatage Ariary', () => {
    // Fonction de formatage (simplifiée)
    const formatAriary = (amount: number): string => {
        return `${amount.toLocaleString('fr-FR')} Ar`;
    };

    it('should format thousands correctly', () => {
        expect(formatAriary(1000)).toContain('1');
        expect(formatAriary(1000)).toContain('Ar');
    });

    it('should format large numbers with separators', () => {
        const result = formatAriary(1000000);
        expect(result).toContain('Ar');
        expect(result.length).toBeGreaterThan(5); // Au moins séparateurs + Ar
    });

    it('should handle zero', () => {
        expect(formatAriary(0)).toBe('0 Ar');
    });
});

describe('Budget - Agrégation de totaux', () => {
    interface BudgetSummary {
        planned_amount: number;
        spent_amount: number;
    }

    const aggregateTotals = (summaries: BudgetSummary[]) => {
        return summaries.reduce(
            (acc, curr) => ({
                totalPlanned: acc.totalPlanned + curr.planned_amount,
                totalSpent: acc.totalSpent + curr.spent_amount,
            }),
            { totalPlanned: 0, totalSpent: 0 }
        );
    };

    it('should aggregate multiple budgets correctly', () => {
        const budgets: BudgetSummary[] = [
            { planned_amount: 100000, spent_amount: 25000 },
            { planned_amount: 50000, spent_amount: 15000 },
            { planned_amount: 200000, spent_amount: 180000 },
        ];

        const result = aggregateTotals(budgets);
        expect(result.totalPlanned).toBe(350000);
        expect(result.totalSpent).toBe(220000);
    });

    it('should handle empty budget list', () => {
        const result = aggregateTotals([]);
        expect(result.totalPlanned).toBe(0);
        expect(result.totalSpent).toBe(0);
    });

    it('should handle single budget', () => {
        const budgets: BudgetSummary[] = [{ planned_amount: 50000, spent_amount: 10000 }];
        const result = aggregateTotals(budgets);
        expect(result.totalPlanned).toBe(50000);
        expect(result.totalSpent).toBe(10000);
    });
});
