/**
 * Tests unitaires simplifiés pour Budget (exécutables directement avec Node)
 * Usage: node tests/budget-simple.test.mjs
 */

// ========================
// FONCTIONS À TESTER
// ========================

const getNormalizedStartDate = (selectedDate, periodType) => {
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

const calculatePercentage = (spent, planned) => {
    if (planned <= 0) return 0;
    return (spent / planned) * 100;
};

const getBudgetStatusColor = (percentage) => {
    if (percentage > 100) return 'red';
    if (percentage > 80) return 'orange';
    return 'green';
};

// ========================
// FRAMEWORK DE TEST SIMPLE
// ========================

let testsPassed = 0;
let testsFailed = 0;
const failedTests = [];

function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

function assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}. ${message}`);
    }
}

function test(description, fn) {
    try {
        fn();
        console.log(`✅ PASS: ${description}`);
        testsPassed++;
    } catch (error) {
        console.log(`❌ FAIL: ${description}`);
        console.log(`   Error: ${error.message}`);
        testsFailed++;
        failedTests.push({ description, error: error.message });
    }
}

function describe(suiteName, fn) {
    console.log(`\n📦 ${suiteName}`);
    console.log('─'.repeat(50));
    fn();
}

// ========================
// TESTS
// ========================

describe('Budget - Normalisation des dates', () => {
    test('Journalier: devrait retourner la même date', () => {
        const result = getNormalizedStartDate(new Date('2025-12-17'), 'day');
        assertEqual(result, '2025-12-17');
    });

    test('Mensuel: devrait retourner le 1er du mois', () => {
        const result = getNormalizedStartDate(new Date('2025-12-17'), 'month');
        assertEqual(result, '2025-12-01', 'Le 17 décembre devrait donner le 1er décembre');
    });

    test('Annuel: devrait retourner le 1er janvier', () => {
        const result = getNormalizedStartDate(new Date('2025-12-17'), 'year');
        assertEqual(result, '2025-01-01');
    });

    test('Trimestriel: Q4 2025 devrait commencer au 1er octobre', () => {
        const result = getNormalizedStartDate(new Date('2025-12-17'), 'quarter');
        assertEqual(result, '2025-10-01');
    });

    test('Semestriel (2e semestre): devrait commencer au 1er juillet', () => {
        const result = getNormalizedStartDate(new Date('2025-12-17'), 'semester');
        assertEqual(result, '2025-07-01');
    });

    test('Semestriel (1er semestre): devrait commencer au 1er janvier', () => {
        const result = getNormalizedStartDate(new Date('2025-03-15'), 'semester');
        assertEqual(result, '2025-01-01');
    });
});

describe('Budget - Calculs de pourcentages', () => {
    test('25k dépensé sur 100k budget = 25%', () => {
        const result = calculatePercentage(25000, 100000);
        assertEqual(result, 25);
    });

    test('180k dépensé sur 200k budget = 90%', () => {
        const result = calculatePercentage(180000, 200000);
        assertEqual(result, 90);
    });

    test('Dépassement: 55k sur 50k = 110%', () => {
        const result = calculatePercentage(55000, 50000);
        assertEqual(result, 110);
    });

    test('Budget zéro devrait retourner 0%', () => {
        const result = calculatePercentage(1000, 0);
        assertEqual(result, 0);
    });

    test('Rien dépensé devrait retourner 0%', () => {
        const result = calculatePercentage(0, 100000);
        assertEqual(result, 0);
    });
});

describe('Budget - Couleurs de statut', () => {
    test('0-79% devrait être vert', () => {
        assertEqual(getBudgetStatusColor(0), 'green');
        assertEqual(getBudgetStatusColor(50), 'green');
        assertEqual(getBudgetStatusColor(79), 'green');
    });

    test('80-100% devrait être orange', () => {
        assertEqual(getBudgetStatusColor(80), 'orange');
        assertEqual(getBudgetStatusColor(90), 'orange');
        assertEqual(getBudgetStatusColor(100), 'orange');
    });

    test('>100% devrait être rouge', () => {
        assertEqual(getBudgetStatusColor(101), 'red');
        assertEqual(getBudgetStatusColor(150), 'red');
    });
});

describe('Budget - Scénario réel de test', () => {
    test('Scénario Nourriture: 100k budget, 25k dépensé', () => {
        const planned = 100000;
        const spent = 25000;
        const percentage = calculatePercentage(spent, planned);
        const color = getBudgetStatusColor(percentage);

        assertEqual(percentage, 25, 'Pourcentage devrait être 25%');
        assertEqual(color, 'green', 'Couleur devrait être verte');
    });

    test('Scénario Logement: 200k budget, 180k dépensé (alerte)', () => {
        const planned = 200000;
        const spent = 180000;
        const percentage = calculatePercentage(spent, planned);
        const color = getBudgetStatusColor(percentage);

        assertEqual(percentage, 90, 'Pourcentage devrait être 90%');
        assertEqual(color, 'orange', 'Couleur devrait être orange (alerte)');
    });

    test('Scénario Transport: Dépassement 55k/50k', () => {
        const planned = 50000;
        const spent = 55000;
        const percentage = calculatePercentage(spent, planned);
        const color = getBudgetStatusColor(percentage);
        const remaining = planned - spent;

        assertEqual(percentage, 110, 'Pourcentage devrait être 110%');
        assertEqual(color, 'red', 'Couleur devrait être rouge (dépassement)');
        assertEqual(remaining, -5000, 'Devrait montrer -5000 Ar restant');
    });
});

// ========================
// RÉSULTATS
// ========================

console.log('\n');
console.log('═'.repeat(60));
console.log('📊 RÉSUMÉ DES TESTS');
console.log('═'.repeat(60));
console.log(`✅ Tests réussis: ${testsPassed}`);
console.log(`❌ Tests échoués: ${testsFailed}`);
console.log(`📈 Taux de réussite: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

if (failedTests.length > 0) {
    console.log('\n❌ TESTS ÉCHOUÉS:');
    failedTests.forEach(({ description, error }) => {
        console.log(`   • ${description}`);
        console.log(`     ${error}`);
    });
}

console.log('═'.repeat(60));

// Sortir avec code d'erreur si des tests ont échoué
process.exit(testsFailed > 0 ? 1 : 0);
