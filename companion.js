(function() {
    document.querySelectorAll('.tabs button').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var t = this.getAttribute('data-tab');
            document.querySelectorAll('.tabs button').forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
            document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active'); });
            document.getElementById(t).classList.add('active');
        });
    });

    var examples = [
        { form: 'the', noun: 'present King of France', pred: 'is bald' },
        { form: 'the', noun: 'father of Charles II', pred: 'was executed' },
        { form: 'the', noun: 'author of Waverley', pred: 'was a man' },
        { form: 'all', noun: 'men', pred: 'are mortal' },
        { form: 'no', noun: 'man', pred: 'is immortal' },
        { form: 'a', noun: 'dragon', pred: 'breathes fire' }
    ];
    var exampleIndex = 0;
    document.getElementById('exampleBtn').addEventListener('click', function() {
        var ex = examples[exampleIndex % examples.length];
        document.getElementById('phraseForm').value = ex.form;
        document.getElementById('nounInput').value = ex.noun;
        document.getElementById('predicateInput').value = ex.pred;
        exampleIndex++;
        runExpansion();
    });

    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    function Fx(noun) { return 'x is ' + noun.replace(/^the\s+/, ''); }
    function Cx(pred) {
        var p = pred.trim();
        if (/^(is|are|was|were)\s/.test(p)) return 'x ' + p;
        return 'x ' + p;
    }

    function runExpansion() {
        var form = document.getElementById('phraseForm').value;
        var noun = document.getElementById('nounInput').value.trim() || 'thing';
        var pred = document.getElementById('predicateInput').value.trim() || 'C';
        var stepByStep = document.getElementById('stepByStep').checked;

        var natural = '', russell = '', symbolic = '';
        var F = noun.replace(/^the\s+/, '');

        if (form === 'a' || form === 'some') {
            natural = cap(form === 'a' ? 'A ' + noun : 'Some ' + noun) + ' ' + pred + '.';
            russell = '"' + Cx(pred) + ' and x is ' + F + '" is not always false.';
            symbolic = '\u2203x (F(x) \u2227 C(x))';
        } else if (form === 'all' || form === 'every') {
            natural = 'All ' + noun + ' ' + pred + '.';
            russell = '"If x is ' + F + ', then ' + Cx(pred) + '" is always true.';
            symbolic = '\u2200x (F(x) \u2192 C(x))';
        } else if (form === 'no') {
            natural = 'No ' + noun + ' ' + pred + '.';
            russell = '"If x is ' + F + ', then ' + Cx(pred) + ' is false" is always true.';
            symbolic = '\u2200x (F(x) \u2192 \u00ACC(x))';
        } else if (form === 'the') {
            natural = 'The ' + noun + ' ' + pred + '.';
            russell = 'Existence: There is at least one x such that x is ' + F + '. ';
            russell += 'Uniqueness: For any y, if y is ' + F + ', then y = x. ';
            russell += 'Predication: That x ' + pred + '.';
            symbolic = '\u2203x (F(x) \u2227 \u2200y(F(y) \u2192 y = x) \u2227 C(x))';
        }

        document.getElementById('naturalOutput').textContent = natural;
        document.getElementById('symbolicOutput').textContent = symbolic;

        var stepContainer = document.getElementById('stepByStepContainer');
        stepContainer.innerHTML = '';
        if (stepByStep && form === 'the') {
            var steps = [
                { text: 'There is at least one x such that x is ' + F + '.', ann: 'Step 1: Assert existence' },
                { text: 'For any y, if y is ' + F + ', then y is identical with x.', ann: 'Step 2: Assert uniqueness' },
                { text: 'That x ' + pred + '.', ann: 'Step 3: Apply predicate' }
            ];
            steps.forEach(function(s) {
                var div = document.createElement('div');
                div.className = 'step-item hidden';
                div.innerHTML = '<div class="content">' + s.text + '</div><div class="step-annotation">' + s.ann + '</div>';
                stepContainer.appendChild(div);
            });
            document.getElementById('russellOutput').textContent = '';
            var idx = 0;
            function showNext() {
                if (idx < stepContainer.children.length) {
                    stepContainer.children[idx].classList.remove('hidden');
                    stepContainer.children[idx].classList.add('visible');
                    idx++;
                    setTimeout(showNext, 800);
                }
            }
            setTimeout(showNext, 300);
        } else {
            document.getElementById('russellOutput').textContent = russell;
        }
    }

    document.getElementById('phraseForm').addEventListener('change', runExpansion);
    document.getElementById('nounInput').addEventListener('input', runExpansion);
    document.getElementById('predicateInput').addEventListener('input', runExpansion);
    document.getElementById('stepByStep').addEventListener('change', runExpansion);
    runExpansion();

    var comparatorData = {
        'king-bald': {
            russell: { interp: 'No constituent "the present King of France"; expansion yields false.', truth: 'false', explain: 'There is no unique present King of France, so the proposition is false.' },
            frege: { interp: 'Phrase has meaning but no denotation; conventional denotation (e.g. null).', truth: 'false', explain: 'By convention, such statements are false or truth-valueless.' },
            meinong: { interp: 'The phrase denotes a non-subsistent object that is bald.', truth: 'contradiction', explain: 'The object both exists (as object of thought) and does not exist.' }
        },
        'king-not-bald': {
            russell: { interp: 'Secondary reading: it is not the case that there is a unique King who is bald.', truth: 'true', explain: 'Under secondary occurrence the denial is true.' },
            frege: { interp: 'Convention for negations of empty reference.', truth: 'undefined', explain: 'Frege must stipulate how negation interacts with empty reference.' },
            meinong: { interp: 'The non-subsistent King has the property of not being bald.', truth: 'contradiction', explain: 'Same contradiction as above.' }
        },
        'waverley': {
            russell: { interp: 'Exactly one entity wrote Waverley, and that one was a man.', truth: 'true', explain: 'Scott satisfies the description.' },
            frege: { interp: 'The denotation (Scott) is a man.', truth: 'true', explain: 'Proposition is true of the denoted individual.' },
            meinong: { interp: 'The denoted object is a man.', truth: 'true', explain: 'When reference succeeds, theories converge.' }
        },
        'charles': {
            russell: { interp: 'Exactly one x was father of Charles II and was executed.', truth: 'true', explain: 'Charles I satisfies the description.' },
            frege: { interp: 'The denotation (Charles I) was executed.', truth: 'true', explain: 'True of the denoted individual.' },
            meinong: { interp: 'The denoted individual was executed.', truth: 'true', explain: 'Convergence when reference succeeds.' }
        }
    };

    function updateComparator() {
        var key = document.getElementById('comparatorProposition').value;
        var d = comparatorData[key];
        ['russell', 'frege', 'meinong'].forEach(function(name) {
            var c = d[name];
            document.getElementById(name + 'Interp').textContent = c.interp;
            var cls = c.truth === 'true' ? 'true' : c.truth === 'false' ? 'false' : c.truth === 'contradiction' ? 'contradiction' : 'undefined';
            document.getElementById(name + 'Truth').innerHTML = '<span class="badge ' + cls + '">' + c.truth.toUpperCase() + '</span>';
            document.getElementById(name + 'Explain').textContent = c.explain;
        });
        document.getElementById('comparatorSummary').textContent = 'With non-referring "the" phrases, Meinong produces contradiction. Frege avoids it by convention but artificially. Russell yields a clean false (or true for the denial under secondary occurrence) without non-subsistent objects.';
    }
    document.getElementById('comparatorProposition').addEventListener('change', updateComparator);
    updateComparator();

    var occurrenceData = {
        'king-not-bald': {
            primary: { form: '\u2203x (K(x) \u2227 \u2200y(K(y)\u2192y=x) \u2227 \u00ACB(x))', truth: 'FALSE', paraphrase: 'There is an entity which is now King of France and is not bald.' },
            secondary: { form: '\u00AC(\u2203x (K(x) \u2227 \u2200y(K(y)\u2192y=x) \u2227 B(x)))', truth: 'TRUE', paraphrase: 'It is not the case that there is a unique King of France who is bald.' }
        },
        'george-waverley': {
            primary: { form: 'One author of Waverley, and George IV wished to know whether he was Scott.', truth: 'TRUE', paraphrase: 'George IV wished to know, concerning the man who wrote Waverley, whether he was Scott.' },
            secondary: { form: 'George IV wished to know whether (exactly one man wrote Waverley and Scott was that man).', truth: 'TRUE/FALSE', paraphrase: 'George IV wondered whether Scott was the author (opaque reading).' }
        }
    };

    function updateOccurrence() {
        var key = document.getElementById('occurrenceProposition').value;
        var d = occurrenceData[key];
        document.getElementById('primaryForm').textContent = d.primary.form;
        document.getElementById('primaryTruth').innerHTML = '<span class="badge ' + (d.primary.truth === 'TRUE' ? 'true' : 'false') + '">' + d.primary.truth + '</span>';
        document.getElementById('primaryParaphrase').textContent = d.primary.paraphrase;
        document.getElementById('secondaryForm').textContent = d.secondary.form;
        document.getElementById('secondaryTruth').innerHTML = '<span class="badge ' + (d.secondary.truth.indexOf('TRUE') !== -1 ? 'true' : 'false') + '">' + d.secondary.truth + '</span>';
        document.getElementById('secondaryParaphrase').textContent = d.secondary.paraphrase;
        document.getElementById('occurrenceSummary').textContent = 'This distinction lets Russell avoid the conclusion that the King of France wears a wig: the denial can be true (secondary occurrence). Primary reading is false (there is no such King).';
    }
    document.getElementById('occurrenceProposition').addEventListener('change', updateOccurrence);
    updateOccurrence();

    document.getElementById('p1Substitute').addEventListener('click', function() {
        document.getElementById('p1Result').innerHTML = 'After substitution: <em>George IV wished to know whether Scott was Scott.</em> That is absurd.';
        document.getElementById('p1Solution').textContent = "Russell's solution: The proposition does not contain a constituent 'the author of Waverley' for which we can substitute 'Scott'. The phrase is eliminated in the full expansion.";
    });

    document.getElementById('p2Joke').textContent = 'Hegelians, who love a synthesis, will probably conclude that he wears a wig.';
    document.getElementById('p2Solution').textContent = "Russell's solution: Under secondary occurrence, 'the present King of France is not bald' means 'It is false that there is a unique King of France who is bald' - which is true.";

    function p3Update() {
        var a = document.getElementById('p3A').value.trim() || 'A';
        var b = document.getElementById('p3B').value.trim() || 'B';
        var same = a === b;
        document.getElementById('p3Denotation').textContent = same ? 'denotes nothing (A = B).' : 'denotes the difference between ' + a + ' and ' + b + '.';
        document.getElementById('p3Solution').textContent = same
            ? "When A = B, 'the difference between A and B' does not denote; the proposition is false for any predicate. No non-entity as subject."
            : "When A and B differ, there is exactly one entity that is the difference.";
    }
    document.getElementById('p3A').addEventListener('input', p3Update);
    document.getElementById('p3B').addEventListener('input', p3Update);
    p3Update();

    var acquaintanceItems = ['Objects of perception', 'Abstract logical objects', 'Sense-data'];
    var descriptionItems = ['The centre of mass of the Solar System', "Other people's minds", 'Physical matter', 'The present King of France'];

    function renderAcquaintance() {
        var aList = document.getElementById('acquaintanceList');
        var dList = document.getElementById('descriptionList');
        aList.innerHTML = acquaintanceItems.map(function(item) {
            return '<div class="acquaintance-item" draggable="true" data-item="' + item.replace(/"/g, '&quot;') + '">' + item + '</div>';
        }).join('');
        dList.innerHTML = descriptionItems.map(function(item) {
            return '<div class="acquaintance-item" draggable="true" data-item="' + item.replace(/"/g, '&quot;') + '">' + item + '</div>';
        }).join('');
        aList.querySelectorAll('.acquaintance-item').forEach(function(el) {
            el.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text', e.target.getAttribute('data-item'));
                e.target.classList.add('dragging');
            });
        });
        dList.querySelectorAll('.acquaintance-item').forEach(function(el) {
            el.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text', e.target.getAttribute('data-item'));
                e.target.classList.add('dragging');
            });
        });
        [aList, dList].forEach(function(container) {
            container.addEventListener('dragover', function(e) { e.preventDefault(); });
            container.addEventListener('drop', function(e) {
                e.preventDefault();
                var item = e.dataTransfer.getData('text');
                if (!item) return;
                var fromA = acquaintanceItems.indexOf(item) !== -1;
                if (fromA) {
                    acquaintanceItems.splice(acquaintanceItems.indexOf(item), 1);
                    descriptionItems.push(item);
                } else {
                    descriptionItems.splice(descriptionItems.indexOf(item), 1);
                    acquaintanceItems.push(item);
                }
                renderAcquaintance();
            });
        });
    }
    document.addEventListener('dragend', function(e) {
        if (e.target.classList) e.target.classList.remove('dragging');
    });
    renderAcquaintance();
})();
