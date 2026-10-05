const form = document.querySelector("form")
const noRepeat = document.querySelector("#no-repeat")
const addAcert = document.querySelector(".form-acert");
const addError = document.querySelector(".form-error");
const template = document.getElementById("number-template")
const contentNumber = document.querySelector(".content-number")
const result = document.querySelector("#result")
const drawAgainBtn = document.getElementById("draw-again");
const resultTitle = document.getElementById("result-title");
const resetBtn = document.querySelector("#reset-draw");
const btnOrganize = document.querySelector(".btnOrganize");


let drawCount = 1;


function formatInput(input) {

    let inputValue = input.value.replace(/\D/g, "");
    input.value = inputValue ? Number(inputValue) : "";
}


[form.quantity, form.minimum, form.maximum].forEach(input => {
    input.addEventListener("input", () => {
        formatInput(input);
        verificarInputs(input);
    });
})

form.addEventListener("submit", (event) => {
    event.preventDefault();
    limparInput()

    drawCount = 1;
    executeDraw();
})

function executeDraw() {
    const qtdNumber = Number(form.quantity.value);
    const min = Number(form.minimum.value);
    const max = Number(form.maximum.value);
    
    try {
        let results;

        if (noRepeat.checked) {
            results = drawNorepeat(qtdNumber, min, max);
            
        } else {
            results = draw(qtdNumber, min, max);
        }

        console.log(results);

        resultTitle.textContent = `${drawCount}º RESULTADO`;
        
        form.hidden = true;
        result.hidden = false;

        renderNumbers(results);

        addAcert.textContent = "Sorteio realizado!";

    } catch (error) {
        addError.textContent = error.message;
    }
    
}

drawAgainBtn.addEventListener("click", () => {
    contentNumber.innerHTML = "";
    drawCount++;
    executeDraw();
 });

resetBtn.addEventListener("click", () => {
    result.hidden = true;
    form.hidden = false;
    drawCount = 1;
    contentNumber.innerHTML = "";

    form.quantity.focus();

})


function draw(qtdNumber, min, max) {
    
    // com repetição (inclusive)
    if (min >= max) {
        throw new Error("Intervalo inválido, o valor mínimo é superior ou igual ao máximo.")      
    }
        
    const results = [];
    
    for (let i = 0; i < qtdNumber; i++) {
        const numberSort = Math.floor(Math.random() * (max - min + 1)) + min; 
        results.push(numberSort);
    }
        
    return results;
}   

function drawNorepeat(qtdNumber, min, max) {

    //inclusive e sem repetição

    if (min >= max) {
        throw new Error ("Intervalo inválido: o valor mínimo é superior ou igual ao máximo.")
    }
           
    if (qtdNumber > (max - min + 1)) {
        throw new Error ("A quantidade de número solicitada é maior que o intervalo disponível")
    }
        
    const results = new Set();
    
    while (results.size < qtdNumber) {
        const numberSort = Math.floor(Math.random() * (max - min + 1)) + min;
        results.add(numberSort); //O Set ignora duplicatas automaticamente.       
    }

    return Array.from(results)
}

function limparInput() {
    addAcert.textContent = "";
    addError.textContent = "";
}

function verificarInputs(input) {
    if (input.value.trim() === "") {
        limparInput();
    }
}

function renderNumbers(results) {
    contentNumber.innerHTML = "";
    btnOrganize.hidden = true;
    drawAgainBtn.classList.remove("fadeInBtn", "animation");
    addAcert.hidden = true;
    let currentIndex = 0;


    function showNextNumber() {
        // Verifica se já mostramos todos os números
        if (currentIndex >= results.length) {
             const startHeight = result.getBoundingClientRect().height;
             btnOrganize.hidden = false;
             addAcert.hidden = false;
             
             const endHeight = result.getBoundingClientRect().height;

             if (endHeight > startHeight && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                 result.animate(
                    [
                        { height: `${startHeight}px` },
                        { height: `${endHeight}px` }
                    ],
                    { duration: 350, easing: "ease-in-out" }
                );
            }
                
                drawAgainBtn.classList.add("fadeInBtn");
                return;

            // btnOrganize.hidden = false;
            // drawAgainBtn.classList.add("fadeInBtn");
            // addAcert.hidden = false;
            // return;
        }

        const previousPositions = new Map(
            Array.from(contentNumber.children, number => [number, number.getBoundingClientRect()])
        );

        // Clona e prepara o número atual
        const clone = template.content.cloneNode(true);
        const valueSpan = clone.querySelector(".value-number");
        const animationBox = clone.querySelector(".animation-number");
        
        valueSpan.textContent = results[currentIndex];

        // 3. A mágica acontece aqui: escutamos o fim da animação DESTA caixa
        animationBox.addEventListener("animationend", () => {
            currentIndex++;   // Passa para o próximo índice
            showNextNumber(); // Chama a função de novo para colocar a próxima caixa
        }, { once: true }); // { once: true } garante que esse evento dispare só 1 vez por caixa

        // Adiciona a caixa na tela (isso dispara a animação dela no CSS)
        contentNumber.append(clone);

        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            previousPositions.forEach((previousPosition, number) => {
                const currentPosition = number.getBoundingClientRect();
                const offsetX = previousPosition.left - currentPosition.left;
                const offsetY = previousPosition.top - currentPosition.top;

                number.animate(
                    [
                        { transform: `translate(${offsetX}px, ${offsetY}px)` },
                        { transform: "translate(0, 0)" }
                    ],
                    { duration: 500, easing: "ease-in-out" }
                );
            });
        }
    }

    showNextNumber();
}






const caretCanvas = document.createElement("canvas");
const caretContext = caretCanvas.getContext("2d");

function updateInputCaret(input) {
    const caret = input.parentElement.querySelector(".input-caret");
    const styles = getComputedStyle(input);
    const valueBeforeCaret = input.value.slice(0, input.selectionStart ?? input.value.length);

    caretContext.font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;

    const textWidth = caretContext.measureText(input.value).width;
    const valueBeforeCaretWidth = caretContext.measureText(valueBeforeCaret).width;
    const paddingLeft = parseFloat(styles.paddingLeft);
    const paddingRight = parseFloat(styles.paddingRight);
    const contentWidth = input.clientWidth - paddingLeft - paddingRight;
    const contentLeft = input.offsetLeft + input.clientLeft + paddingLeft;
    const textOffset = textWidth <= contentWidth ? (contentWidth - textWidth) / 2 : 0;

    const desiredLeft = contentLeft + textOffset + valueBeforeCaretWidth - input.scrollLeft;

    const minLeft = contentLeft + 1;
    const maxLeft = input.offsetLeft + input.clientLeft + input.clientWidth - paddingRight - 1;

    caret.style.left = `${Math.min(Math.max(desiredLeft, minLeft), maxLeft)}px`;

}

document.querySelectorAll(".number-field input").forEach(input => {
    ["focus", "input", "click", "keyup"].forEach(eventName => {
        input.addEventListener(eventName, () => updateInputCaret(input));
    });
});

document.fonts.ready.then(() => {
    document.querySelectorAll(".number-field input").forEach(updateInputCaret);
});





/* adicionar e iniciar a animação por mouseenter*/ 

try {   

    document.querySelectorAll(".button").forEach(btn => {
        btn.addEventListener("mouseenter", () => {
            btn.classList.add("animation");
        });
        
        btn.addEventListener("animationend", (event) => {
            if (event.target !== btn) return;

            if (event.animationName === "fadeInBtn") {
                btn.classList.remove("fadeInBtn");
            }

            if (event.animationName === "button-animation") {
                btn.classList.remove("animation");
            }
        });
    })
} catch (error) {
    alert("Não foi possível reiniciar a animação")
}
