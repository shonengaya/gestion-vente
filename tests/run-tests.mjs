import fs from 'fs';

// ========================
// FONCTIONS À TESTER
// ========================

const getNormalizedStartDate = (selectedDate, periodType) => {
    const d = new Date(selectedDate);

    // Helper to format date as YYYY-MM-DD in local timezone
    const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    if (periodType === 'day') {
        return formatLocalDate(d);
    } else if (periodType === 'week') {
        const day = d.getDay() || 7;
        const diff = d.getDate() - day + 1;
        const startD = new Date(d);
        startD.setDate(diff);
        return formatLocalDate(startD);
    } else if (periodType === 'month') {
        return formatLocalDate(new Date(d.getFullYear(), d.getMonth(), 1));
    } else if (periodType === 'quarter') {
        const quarter = Math.floor(d.getMonth() / 3);
        return formatLocalDate(new Date(d.getFullYear(), quarter * 3, 1));
    } else if (periodType === 'semester') {
        const semester = d.getMonth() < 6 ? 0 : 6;
        return formatLocalDate(new Date(d.getFullYear(), semester, 1));
    } else if (periodType === 'year') {
        return formatLocalDate(new Date(d.getFullYear(), 0, 1));
    }
    return formatLocalDate(d);
};

const calculatePercentage = (spent, planned) => {
    if (planned <= 0) return 0;
    return Math.round((spent / planned) * 100 * 100) / 100; // Round to 2 decimals
};

const getBudgetStatusColor = (percentage) => {
    if (percentage > 100) return 'red';
    if (percentage >= 80) return 'orange'; // Fixed: >= instead of >
    return 'green';
};

// ========================
// FRAMEWORK DE TEST
// ========================

let testsPassed = 0;
let testsFailed = 0;
const failedTests = [];
let output = '';

function log(message) {
    console.log(message);
    output += message + '\n';
}

function test(description, fn) {
    try {
        fn();
        log(`✅ PASS: ${description}`);
        testsPassed++;
    } catch (error) {
        log(`❌ FAIL: ${description}`);
        log(`   Error: ${error.message}`);
        testsFailed++;
        failedTests.push({ description, error: error.message });
    }
}

function assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}. ${message}`);
    }
}

function describe(suiteName, fn) {
    log(`\n📦 ${suiteName}`);
    log('─'.repeat(50));
    fn();
}

// ========================
// TESTS
// ========================

log('🧪 EXÉCUTION DES TESTS UNITAIRES - MODULE BUDGET');
log('═'.repeat(60));
log(`Heure de début: ${new Date().toLocaleString('fr-FR')}`);
log('');

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

describe('Budget - Scénarios réels', () => {
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

log('\n');
log('═'.repeat(60));
log('📊 RÉSUMÉ DES TESTS');
log('═'.repeat(60));
log(`✅ Tests réussis: ${testsPassed}`);
log(`❌ Tests échoués: ${testsFailed}`);
log(`📈 Taux de réussite: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

if (failedTests.length > 0) {
    log('\n❌ TESTS ÉCHOUÉS:');
    failedTests.forEach(({ description, error }) => {
        log(`   • ${description}`);
        log(`     ${error}`);
    });
} else {
    log('\n🎉 TOUS LES TESTS ONT RÉUSSI !');
}

log('═'.repeat(60));
log(`Heure de fin: ${new Date().toLocaleString('fr-FR')}`);

// Écrire dans un fichier
fs.writeFileSync('test-output.txt', output, 'utf8');
log('\n✅ Résultats écrits dans test-output.txt');

process.exit(testsFailed > 0 ? 1 : 0);
