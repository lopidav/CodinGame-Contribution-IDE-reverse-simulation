// ==UserScript==
// @name         CodinGame Contribution IDE reverse simulation
// @namespace    https://lopidav.com/
// @version      0.1
// @description  Removes statement/constraint/input/output description from contribution testing IDE of reverse CoC puzzles
// @author       lopidav
// @match        https://www.codingame.com/*
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

var currentQuestion;

(function() {
    $(document).on('DOMNodeInserted', checkForReportLoad);

    function checkForReportLoad(event) {
        if (
            window.location.pathname.includes('ide/demo')
            && $(event.target).is(`div.cg-ide-contributor`)
            && currentQuestion
            && currentQuestion.contribution
            && currentQuestion.contribution.type == "CLASHOFCODE"
        ) {
            fetch('services/Contribution/findContribution', {method: 'POST', body: `[${currentQuestion.contribution.publicHandle},true]`})
                .then(r => r.json())
                .then(contribution => {
                let data = contribution.lastVersion.data;
                if(data.reverse) {
                    $(`div.cg-statement`).hide();
                    $(`div.statement-bloc`).append(`<div> <div class="reverse-explanation" translate="cgIde.reverseExplainations">The game mode is <mode>REVERSE</mode>: You do not have access to the statement. You have to guess what to do by observing the following set of tests:</div> <div class="cg-ide-testcases-details-reverse">  </div> </div>`);
                    let testContainer = $(`div.cg-ide-testcases-details-reverse`);
                    let testCounter = 1;
                    data.testCases.forEach(testCase => {
                        if (testCase.isTest) {
                            testContainer.append(`<div class="testcase open"> <div class="testcase-header"> <div class="testcase-number">${testCounter.toString().padStart(2,0)}</div>  <h3 class="testcase-name" translate="ideTestcasesDetailReverse.test" translate-values="{index: $index+1}">Test ${testCounter}</h3> </div> <div class="testcase-content"> <div class="testcase-content-texts"> <div class="testcase-text-title" translate="ideTestcasesDetailReverse.input">Input</div> <div class="testcase-text-title testcase-text-title-out" translate="ideTestcasesDetailReverse.output">Expected output</div> </div> <div class="testcase-content-texts"> <pre class="testcase-text testcase-in">${testCase.testIn}</pre> <pre class="testcase-text testcase-out" ng-if="testcase.output" ng-bind="testcase.output">${testCase.testOut}</pre> </div> </div> </div>`);
                            testCounter++;
                        }
                    });
                }
            });
        }
    }
})();


(function(XHR) {
    const {open, send} = XHR;
    XHR.open = function(method, url) {
        this.addEventListener('readystatechange', () => {
            if(this.readyState == 4 && this.responseURL.includes('startTestSession')) {
                let data = JSON.parse(this.response);
                currentQuestion = data.currentQuestion.question;
            }
        });
        open.apply(this, arguments);
    }
})(XMLHttpRequest.prototype);