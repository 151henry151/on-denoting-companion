(function() {
    var descriptionFacts = {
        'present king of france': { type: 'none' },
        'author of waverley': { type: 'one', entity: 'scott' },
        'father of charles ii': { type: 'one', entity: 'charles i' }
    };

    var entityFacts = {
        scott: ['man', 'a man', 'human', 'male'],
        'charles i': ['executed', 'a man', 'man']
    };

    function normalizeSpace(text) {
        return text.replace(/\s+/g, ' ').trim();
    }

    function stripFinalPeriod(text) {
        return text.replace(/[.]+$/g, '').trim();
    }

    function normalizeKey(text) {
        return normalizeSpace(stripFinalPeriod(String(text || '').toLowerCase())).replace(/[^a-z0-9\s]/g, '');
    }

    function normalizePredicate(text) {
        return normalizeKey(text).replace(/^(a|an|the)\s+/, '');
    }

    function cap(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    function renderMath(elementId, latexExpression) {
        var el = document.getElementById(elementId);
        el.setAttribute('data-latex', latexExpression);
        if (window.katex) {
            window.katex.render(latexExpression, el, { throwOnError: false });
        } else {
            el.textContent = latexExpression;
        }
    }

    function rerenderAllMath() {
        if (!window.katex) return;
        document.querySelectorAll('[data-latex]').forEach(function(el) {
            var latexExpression = el.getAttribute('data-latex') || '';
            window.katex.render(latexExpression, el, { throwOnError: false });
        });
    }

    function setBadge(id, truth) {
        var cls;
        if (truth === 'true') cls = 'true';
        else if (truth === 'false') cls = 'false';
        else if (truth === 'contradiction') cls = 'contradiction';
        else cls = 'undefined';
        document.getElementById(id).innerHTML = '<span class="badge ' + cls + '">' + truth.toUpperCase() + '</span>';
    }

    function parseDefiniteSentence(text) {
        var sentence = stripFinalPeriod(normalizeSpace(String(text || '')));
        var match = sentence.match(/^the\s+(.+?)\s+(is|are|was|were)\s+(not\s+)?(.+)$/i);
        if (!match) return null;
        return {
            raw: sentence,
            description: normalizeSpace(match[1]),
            copula: match[2].toLowerCase(),
            negated: !!match[3],
            predicate: normalizeSpace(match[4])
        };
    }

    function parseWishedSentence(text) {
        var sentence = stripFinalPeriod(normalizeSpace(String(text || '')));
        var match = sentence.match(/^(.+?)\s+wished\s+to\s+know\s+whether\s+the\s+(.+?)\s+(is|are|was|were)\s+(.+)$/i);
        if (!match) return null;
        return {
            raw: sentence,
            asker: normalizeSpace(match[1]),
            description: normalizeSpace(match[2]),
            copula: match[3].toLowerCase(),
            predicate: normalizeSpace(match[4])
        };
    }

    function resolveDescription(description) {
        var key = normalizeKey(description);
        return descriptionFacts[key] || { type: 'unknown' };
    }

    function predicateHolds(entity, predicate) {
        var factList = entityFacts[entity] || [];
        var normalized = normalizePredicate(predicate);
        return factList.some(function(item) {
            return normalizePredicate(item) === normalized;
        });
    }

    function initTabs() {
        document.querySelectorAll('.tabs button').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var t = this.getAttribute('data-tab');
                document.querySelectorAll('.tabs button').forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active'); });
                document.getElementById(t).classList.add('active');
                rerenderAllMath();
            });
        });
    }

    var examples = [
        { form: 'the', noun: 'present King of France', pred: 'is bald' },
        { form: 'the', noun: 'father of Charles II', pred: 'was executed' },
        { form: 'the', noun: 'author of Waverley', pred: 'was a man' },
        { form: 'all', noun: 'men', pred: 'are mortal' },
        { form: 'no', noun: 'man', pred: 'is immortal' },
        { form: 'a', noun: 'dragon', pred: 'breathes fire' }
    ];
    var exampleIndex = 0;

    function Cx(pred) {
        return 'x ' + pred.trim();
    }

    function runExpansion() {
        var form = document.getElementById('phraseForm').value;
        var noun = document.getElementById('nounInput').value.trim() || 'thing';
        var pred = document.getElementById('predicateInput').value.trim() || 'has property C';
        var stepByStep = document.getElementById('stepByStep').checked;
        var cleanedNoun = noun.replace(/^the\s+/i, '');

        var natural = '';
        var russell = '';
        var symbolicLatex = '';

        if (form === 'a' || form === 'some') {
            natural = cap(form === 'a' ? 'A ' + noun : 'Some ' + noun) + ' ' + pred + '.';
            russell = '"' + Cx(pred) + ' and x is ' + cleanedNoun + '" is not always false.';
            symbolicLatex = '\\exists x\\,(F(x) \\land C(x))';
        } else if (form === 'all' || form === 'every') {
            natural = 'All ' + noun + ' ' + pred + '.';
            russell = '"If x is ' + cleanedNoun + ', then ' + Cx(pred) + '" is always true.';
            symbolicLatex = '\\forall x\\,(F(x) \\to C(x))';
        } else if (form === 'no') {
            natural = 'No ' + noun + ' ' + pred + '.';
            russell = '"If x is ' + cleanedNoun + ', then ' + Cx(pred) + ' is false" is always true.';
            symbolicLatex = '\\forall x\\,(F(x) \\to \\neg C(x))';
        } else {
            natural = 'The ' + cleanedNoun + ' ' + pred + '.';
            russell = 'Existence: There is at least one x such that x is ' + cleanedNoun + '. ';
            russell += 'Uniqueness: For any y, if y is ' + cleanedNoun + ', then y = x. ';
            russell += 'Predication: That x ' + pred + '.';
            symbolicLatex = '\\exists x\\,(F(x) \\land \\forall y\\,(F(y) \\to y=x) \\land C(x))';
        }

        document.getElementById('naturalOutput').textContent = natural;
        renderMath('symbolicOutput', symbolicLatex);

        var stepContainer = document.getElementById('stepByStepContainer');
        stepContainer.innerHTML = '';
        if (stepByStep && form === 'the') {
            var steps = [
                { text: 'There is at least one x such that x is ' + cleanedNoun + '.', ann: 'Step 1: Assert existence' },
                { text: 'For any y, if y is ' + cleanedNoun + ', then y is identical with x.', ann: 'Step 2: Assert uniqueness' },
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

    function analyzeComparator() {
        var input = document.getElementById('comparatorProposition').value;
        var parsed = parseDefiniteSentence(input);
        var errorEl = document.getElementById('comparatorError');
        errorEl.textContent = '';

        if (!parsed) {
            errorEl.textContent = 'Enter a proposition in the form: The [description] is/was [predicate] (optionally with "not").';
            return;
        }

        var resolution = resolveDescription(parsed.description);
        var russell;
        var frege;
        var meinong;
        var summary;

        if (resolution.type === 'one') {
            var trueForEntity = predicateHolds(resolution.entity, parsed.predicate);
            var sentenceTruth = parsed.negated ? !trueForEntity : trueForEntity;
            var truthText = sentenceTruth ? 'true' : 'false';

            russell = {
                interp: 'Description resolves to one individual (' + cap(resolution.entity) + ').',
                truth: truthText,
                explain: 'Existence and uniqueness are satisfied, so truth depends on whether the predicate applies to that individual.'
            };
            frege = {
                interp: 'The phrase denotes one object, and the proposition is evaluated of that denotation.',
                truth: truthText,
                explain: 'When denotation succeeds, Frege and Russell agree on truth-value.'
            };
            meinong = {
                interp: 'The phrase denotes an object in a straightforward way.',
                truth: truthText,
                explain: 'When reference succeeds, the three views converge in this companion.'
            };
            summary = 'Reference succeeds, so the three comparisons align on the evaluated truth-value.';
        } else if (resolution.type === 'none') {
            russell = parsed.negated ? {
                interp: 'Secondary reading: negate the whole definite-description claim.',
                truth: 'true',
                explain: 'There is no unique satisfier, so "not (there exists exactly one such x that is P)" is true.'
            } : {
                interp: 'No constituent object corresponds to the phrase after expansion.',
                truth: 'false',
                explain: 'The existence-and-uniqueness condition fails, so the proposition is false.'
            };
            frege = {
                interp: 'The phrase has sense but lacks denotation.',
                truth: 'undefined',
                explain: 'In Fregean treatments, empty denotation introduces a truth-value gap unless a convention is imposed.'
            };
            meinong = {
                interp: 'The phrase is treated as denoting a non-subsistent object.',
                truth: 'contradiction',
                explain: 'That move risks assigning incompatible properties to objects that do not subsist.'
            };
            summary = 'With empty descriptions, Russell preserves consistency via quantifier scope, Frege yields a gap, and Meinong invites contradiction.';
        } else {
            russell = {
                interp: 'The sentence has definite-description form, but no background fact is loaded for this description.',
                truth: 'undefined',
                explain: 'Add world facts (who/what satisfies the description) to complete evaluation.'
            };
            frege = {
                interp: 'Denotation status is not fixed in the current knowledge base.',
                truth: 'undefined',
                explain: 'Without denotation facts, no determinate value is produced by this companion.'
            };
            meinong = {
                interp: 'The sentence is grammatically meaningful, but this companion does not assign an object-model here.',
                truth: 'undefined',
                explain: 'A fuller ontology would be required to continue the Meinongian comparison.'
            };
            summary = 'This proposition is syntactically valid; add supporting facts for the description to get determinate truth comparisons.';
        }

        ['russell', 'frege', 'meinong'].forEach(function(name) {
            var data = name === 'russell' ? russell : name === 'frege' ? frege : meinong;
            document.getElementById(name + 'Interp').textContent = data.interp;
            setBadge(name + 'Truth', data.truth);
            document.getElementById(name + 'Explain').textContent = data.explain;
        });
        document.getElementById('comparatorSummary').textContent = summary;
    }

    function analyzeOccurrence() {
        var input = document.getElementById('occurrenceProposition').value;
        var errorEl = document.getElementById('occurrenceError');
        errorEl.textContent = '';

        var parsedNegation = parseDefiniteSentence(input);
        var parsedWished = parseWishedSentence(input);

        if (parsedNegation && parsedNegation.negated) {
            var resolution = resolveDescription(parsedNegation.description);
            var primaryTruth = 'undefined';
            var secondaryTruth = 'undefined';

            if (resolution.type === 'none') {
                primaryTruth = 'false';
                secondaryTruth = 'true';
            } else if (resolution.type === 'one') {
                var holds = predicateHolds(resolution.entity, parsedNegation.predicate);
                primaryTruth = holds ? 'false' : 'true';
                secondaryTruth = holds ? 'false' : 'true';
            }

            var primaryLatex = '\\exists x\\,(D(x) \\land \\forall y\\,(D(y) \\to y=x) \\land \\neg P(x))';
            var secondaryLatex = '\\neg\\exists x\\,(D(x) \\land \\forall y\\,(D(y) \\to y=x) \\land P(x))';

            renderMath('primaryForm', primaryLatex);
            renderMath('secondaryForm', secondaryLatex);
            setBadge('primaryTruth', primaryTruth);
            setBadge('secondaryTruth', secondaryTruth);
            document.getElementById('primaryParaphrase').textContent = 'There is exactly one ' + parsedNegation.description + ', and it is not ' + parsedNegation.predicate + '.';
            document.getElementById('secondaryParaphrase').textContent = 'It is not the case that there is exactly one ' + parsedNegation.description + ' that is ' + parsedNegation.predicate + '.';
            document.getElementById('occurrenceSummary').textContent = 'For negated definite descriptions, primary and secondary scope can diverge when the description fails to denote.';
            return;
        }

        if (parsedWished) {
            var askerKey = normalizeKey(parsedWished.asker);
            var descriptionKey = normalizeKey(parsedWished.description);
            var predicateKey = normalizePredicate(parsedWished.predicate);
            var knownGeorgeCase = askerKey === 'george iv' && descriptionKey === 'author of waverley' && predicateKey === 'scott';

            var primaryLatexWished = '\\exists x\\,(D(x) \\land \\forall y\\,(D(y) \\to y=x) \\land W_{' + askerKey.replace(/\s+/g, '') + '}(x=P))';
            var secondaryLatexWished = 'W_{' + askerKey.replace(/\s+/g, '') + '}\\!\\left(\\exists x\\,(D(x) \\land \\forall y\\,(D(y) \\to y=x) \\land x=P)\\right)';

            renderMath('primaryForm', primaryLatexWished);
            renderMath('secondaryForm', secondaryLatexWished);

            setBadge('primaryTruth', knownGeorgeCase ? 'true' : 'undefined');
            setBadge('secondaryTruth', knownGeorgeCase ? 'undefined' : 'undefined');
            document.getElementById('primaryParaphrase').textContent = parsedWished.asker + ' wished to know, concerning the uniquely described individual, whether that individual was ' + parsedWished.predicate + '.';
            document.getElementById('secondaryParaphrase').textContent = parsedWished.asker + ' wished to know whether the entire definite-description proposition was true.';
            document.getElementById('occurrenceSummary').textContent = knownGeorgeCase
                ? 'This matches Russell\'s George IV example: the primary reading can be true while the secondary reading depends on what proposition was being considered.'
                : 'For attitude reports ("wished to know whether..."), primary and secondary scope differ by where the denoting phrase is eliminated.';
            return;
        }

        errorEl.textContent = 'Enter either: "The [description] is/was not [predicate]" or "[Name] wished to know whether the [description] is/was [predicate]".';
    }

    initTabs();

    document.getElementById('exampleBtn').addEventListener('click', function() {
        var ex = examples[exampleIndex % examples.length];
        document.getElementById('phraseForm').value = ex.form;
        document.getElementById('nounInput').value = ex.noun;
        document.getElementById('predicateInput').value = ex.pred;
        exampleIndex++;
        runExpansion();
    });

    document.getElementById('phraseForm').addEventListener('change', runExpansion);
    document.getElementById('nounInput').addEventListener('input', runExpansion);
    document.getElementById('predicateInput').addEventListener('input', runExpansion);
    document.getElementById('stepByStep').addEventListener('change', runExpansion);

    document.getElementById('comparatorAnalyzeBtn').addEventListener('click', analyzeComparator);
    document.getElementById('comparatorProposition').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') analyzeComparator();
    });

    document.getElementById('occurrenceAnalyzeBtn').addEventListener('click', analyzeOccurrence);
    document.getElementById('occurrenceProposition').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') analyzeOccurrence();
    });

    runExpansion();
    analyzeComparator();
    analyzeOccurrence();

    var katexRetry = 0;
    (function retryMathRender() {
        if (window.katex) {
            rerenderAllMath();
            return;
        }
        if (katexRetry < 20) {
            katexRetry++;
            setTimeout(retryMathRender, 150);
        }
    })();
})();
