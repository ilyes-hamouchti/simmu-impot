7// ===== ÉTAT =====
let periode = 'mensuel';

function setPeriode(p) {
    periode = p;
    document.getElementById('btn-mensuel').classList.toggle('actif', p === 'mensuel');
    document.getElementById('btn-annuel').classList.toggle('actif', p === 'annuel');
    document.getElementById('label-salaire').innerHTML =
        p === 'mensuel'
            ? 'Salaire mensuel brut <span>(€)</span>'
            : 'Salaire annuel brut <span>(€)</span>';
    document.getElementById('salaire').placeholder =
        p === 'mensuel' ? 'ex : 2 500' : 'ex : 30 000';
}

function changerPart(delta) {
    const input = document.getElementById('parts');
    let val = parseFloat(input.value) + delta;
    if (val < 1) val = 1;
    if (val > 10) val = 10;
    input.value = val;
}

// ===== BARÈME PROGRESSIF  (tranches sur 1 part) =====
function calcImpot1Part(qi) {
    // Tranches 
    const tranches = [
        { limite: 11294, taux: 0 },
        { limite: 28797, taux: 0.11 },
        { limite: 82341, taux: 0.30 },
        { limite: 177106, taux: 0.41 },
        { limite: Infinity, taux: 0.45 },
    ];
    let impot = 0;
    let precedent = 0;
    for (const t of tranches) {
        if (qi <= precedent) break;
        const imposable = Math.min(qi, t.limite) - precedent;
        impot += imposable * t.taux;
        precedent = t.limite;
    }
    return impot;
}

function formater(n) {
    return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

// ===== SIMULATION =====
function simuler() {
    const salaireSaisi = parseFloat(document.getElementById('salaire').value);
    const parts = parseFloat(document.getElementById('parts').value);

    if (isNaN(salaireSaisi) || salaireSaisi <= 0) {
        alert('Veuillez saisir un salaire valide.');
        return;
    }

    // Revenu brut annuel
    const brut = periode === 'mensuel' ? salaireSaisi * 12 : salaireSaisi;

    // Abattement forfaitaire 10 % (min 495 €, max 14171 €)
    let abattement = brut * 0.10;
    abattement = Math.max(495, Math.min(14171, abattement));

    // Net imposable
    const net = brut - abattement;

    // Quotient familial
    const quotient = net / parts;

    // Impôt sur 1 part
    const impot1part = calcImpot1Part(quotient);

    // Impôt total
    const impotTotal = impot1part * parts;

    // Taux effectif
    const taux = brut > 0 ? (impotTotal / brut) * 100 : 0;

    // Affichage
    document.getElementById('res-brut').textContent = formater(brut);
    document.getElementById('res-abattement').textContent = '− ' + formater(abattement);
    document.getElementById('res-net').textContent = formater(net);
    document.getElementById('res-quotient').textContent = formater(quotient);
    document.getElementById('res-impot1part').textContent = formater(impot1part);
    document.getElementById('res-parts').textContent = parts + ' part' + (parts > 1 ? 's' : '');
    document.getElementById('res-total').textContent = formater(impotTotal);
    document.getElementById('res-impot').textContent = formater(impotTotal);
    document.getElementById('res-taux').textContent = taux.toFixed(1) + ' %';

    // Barre de taux
    const pct = Math.min(taux * 2.2, 100); // max visuel à 45%
    document.getElementById('barre-taux').style.width = pct + '%';

    // Afficher le bloc résultats
    const bloc = document.getElementById('resultats');
    bloc.style.display = 'block';
    bloc.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
