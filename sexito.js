document.addEventListener('DOMContentLoaded', function() {
    // Inicializar partículas
    particlesJS.load('particles-js', 'particles.json', function() {
        console.log('Partículas cargadas');
    });

    // Configuración de pestañas
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remover clase active de todos los botones y contenidos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Agregar clase active al botón y contenido seleccionado
            button.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Botones de atajos de teclado
    const shortcutButtons = document.querySelectorAll('.shortcut-btn');
    const integralInput = document.getElementById('integral-input');

    shortcutButtons.forEach(button => {
        button.addEventListener('click', () => {
            const textToInsert = button.getAttribute('data-insert');
            const startPos = integralInput.selectionStart;
            const endPos = integralInput.selectionEnd;
            const currentValue = integralInput.value;
            
            integralInput.value = currentValue.substring(0, startPos) + textToInsert + currentValue.substring(endPos);
            integralInput.focus();
            integralInput.selectionStart = integralInput.selectionEnd = startPos + textToInsert.length;
            
            // Animación del botón
            button.style.transform = 'scale(0.9)';
            setTimeout(() => {
                button.style.transform = '';
            }, 200);
        });
    });

    // Botón de limpiar
    document.getElementById('clear-btn').addEventListener('click', () => {
        integralInput.value = '';
        document.getElementById('result-content').style.display = 'none';
        document.getElementById('steps-content').style.display = 'none';
        document.getElementById('graph-content').style.display = 'none';
        document.querySelector('.result-placeholder').style.display = 'flex';
        document.querySelector('.steps-placeholder').style.display = 'flex';
        document.querySelector('.graph-placeholder').style.display = 'flex';
        
        if (window.functionChart) {
            window.functionChart.destroy();
        }
    });

    // Botón de calcular
    document.getElementById('calculate-btn').addEventListener('click', calculateIntegral);

    // Permitir calcular con Enter
    integralInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            calculateIntegral();
        }
    });

    // Función principal para calcular la integral
    function calculateIntegral() {
        const functionText = integralInput.value.trim();
        
        if (!functionText) {
            showError('Por favor ingresa una función para integrar');
            return;
        }

        try {
            // Mostrar animación de carga
            const calculateBtn = document.getElementById('calculate-btn');
            const originalText = calculateBtn.innerHTML;
            calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculando...';
            calculateBtn.disabled = true;

            // Procesar la función y calcular la integral
            setTimeout(() => {
                try {
                    const result = integrateFunction(functionText);
                    displayResults(functionText, result);
                } catch (error) {
                    showError(error.message);
                }
                
                // Restaurar el botón
                calculateBtn.innerHTML = originalText;
                calculateBtn.disabled = false;
            }, 300);
        } catch (error) {
            showError('Error al calcular la integral: ' + error.message);
            document.getElementById('calculate-btn').innerHTML = '<i class="fas fa-calculator"></i> Calcular Integral';
            document.getElementById('calculate-btn').disabled = false;
        }
    }

    // Sistema de integración completo
    function integrateFunction(func) {
        try {
            // Preprocesar la función
            const processedFunc = preprocessFunction(func);
            const parsed = math.parse(processedFunc);
            
            // Verificar si la función es válida
            if (!parsed || !parsed.isNode) {
                throw new Error('Función no válida');
            }
            
            // Calcular la integral
            const result = integrate(parsed);
            
            // Simplificar el resultado
            const simplified = math.simplify(result);
            
            // Generar pasos de solución
            const steps = generateSolutionSteps(parsed, simplified);
            
            return {
                result: simplified.toString(),
                steps: steps
            };
        } catch (error) {
            throw new Error('No se pudo calcular la integral: ' + error.message);
        }
    }

    // Función principal de integración
    function integrate(node, variable = 'x') {
        // Regla de la constante
        if (node.isConstantNode) {
            return math.parse(`${node.value}*${variable}`);
        }
        
        // Regla de la variable
        if (node.isSymbolNode && node.name === variable) {
            return math.parse(`(1/2)*${variable}^2`);
        }
        
        // Regla de la potencia
        if (node.isOperatorNode && node.op === '^' && 
            node.args[0].isSymbolNode && node.args[0].name === variable &&
            node.args[1].isConstantNode) {
            
            const exponent = node.args[1].value;
            const newExponent = exponent + 1;
            return math.parse(`(1/${newExponent})*${variable}^${newExponent}`);
        }
        
        // Regla de la suma
        if (node.isOperatorNode && node.op === '+') {
            return math.parse(`(${integrate(node.args[0]).toString()}) + (${integrate(node.args[1]).toString()})`);
        }
        
        // Regla de la resta
        if (node.isOperatorNode && node.op === '-') {
            return math.parse(`(${integrate(node.args[0]).toString()}) - (${integrate(node.args[1]).toString()})`);
        }
        
        // Regla de la multiplicación por constante
        if (node.isOperatorNode && node.op === '*' && 
            (node.args[0].isConstantNode || node.args[1].isConstantNode)) {
            
            if (node.args[0].isConstantNode) {
                return math.parse(`${node.args[0].value}*(${integrate(node.args[1]).toString()})`);
            } else {
                return math.parse(`${node.args[1].value}*(${integrate(node.args[0]).toString()})`);
            }
        }
        
        // Funciones trigonométricas
        if (node.isFunctionNode) {
            // Seno
            if (node.name === 'sin' && node.args[0].isSymbolNode && node.args[0].name === variable) {
                return math.parse(`-cos(${variable})`);
            }
            
            // Coseno
            if (node.name === 'cos' && node.args[0].isSymbolNode && node.args[0].name === variable) {
                return math.parse(`sin(${variable})`);
            }
            
            // Tangente
            if (node.name === 'tan' && node.args[0].isSymbolNode && node.args[0].name === variable) {
                return math.parse(`-ln|cos(${variable})|`);
            }
            
            // Logaritmo natural
            if (node.name === 'log' && node.args[0].isSymbolNode && node.args[0].name === variable) {
                return math.parse(`${variable}*log(${variable}) - ${variable}`);
            }
            
            // Exponencial
            if (node.name === 'exp' && node.args[0].isSymbolNode && node.args[0].name === variable) {
                return math.parse(`exp(${variable})`);
            }
        }
        
        // Función inversa (1/x)
        if (node.isOperatorNode && node.op === '/' && 
            node.args[0].isConstantNode && node.args[0].value === 1 &&
            node.args[1].isSymbolNode && node.args[1].name === variable) {
            return math.parse(`log(${variable})`);
        }
        
        // Si no se reconoce el patrón, lanzar error
        throw new Error(`No se pudo integrar: ${node.toString()}`);
    }

    // Preprocesar la función para hacerla compatible con math.js
    function preprocessFunction(func) {
        // Reemplazar ^ con ** para exponentes
        func = func.replace(/\^/g, '**');
        
        // Reemplazar funciones trigonométricas
        func = func.replace(/sin/g, 'sin');
        func = func.replace(/cos/g, 'cos');
        func = func.replace(/tan/g, 'tan');
        func = func.replace(/ln/g, 'log');
        
        // Reemplazar π y e
        func = func.replace(/π/g, 'pi');
        func = func.replace(/e/g, 'exp(1)');
        
        // Reemplazar √ con sqrt
        func = func.replace(/√/g, 'sqrt');
        
        // Asegurar que la multiplicación implícita sea explícita
        func = func.replace(/(\d)([a-zA-Z])/g, '$1*$2');
        func = func.replace(/([a-zA-Z])(\d)/g, '$1*$2');
        func = func.replace(/(\))(\()/g, '$1*$2');
        
        return func;
    }

    // Generar pasos de solución
    function generateSolutionSteps(originalFunc, result) {
        const steps = [];
        
        // Paso 1: Mostrar la función original
        steps.push(`Función a integrar: ∫ ${originalFunc.toString()} dx`);
        
        // Paso 2: Identificar el tipo de función
        if (originalFunc.isSymbolNode && originalFunc.name === 'x') {
            steps.push('Identificamos que es una función lineal (x)');
            steps.push('Aplicamos la regla de la potencia para n=1: ∫x dx = (1/2)x² + C');
        }
        else if (originalFunc.isOperatorNode && originalFunc.op === '^' && 
                 originalFunc.args[0].isSymbolNode && originalFunc.args[0].name === 'x' &&
                 originalFunc.args[1].isConstantNode) {
            const exponent = originalFunc.args[1].value;
            steps.push(`Identificamos que es una función potencia (x^${exponent})`);
            steps.push(`Aplicamos la regla de la potencia: ∫x^n dx = x^(n+1)/(n+1) + C`);
            steps.push(`Para n=${exponent}: ∫x^${exponent} dx = x^${exponent+1}/${exponent+1} + C`);
        }
        else if (originalFunc.isFunctionNode && originalFunc.name === 'sin' && 
                 originalFunc.args[0].isSymbolNode && originalFunc.args[0].name === 'x') {
            steps.push('Identificamos que es la función seno (sin(x))');
            steps.push('Aplicamos la regla de integración: ∫sin(x) dx = -cos(x) + C');
        }
        else if (originalFunc.isFunctionNode && originalFunc.name === 'cos' && 
                 originalFunc.args[0].isSymbolNode && originalFunc.args[0].name === 'x') {
            steps.push('Identificamos que es la función coseno (cos(x))');
            steps.push('Aplicamos la regla de integración: ∫cos(x) dx = sin(x) + C');
        }
        else if (originalFunc.isFunctionNode && originalFunc.name === 'tan' && 
                 originalFunc.args[0].isSymbolNode && originalFunc.args[0].name === 'x') {
            steps.push('Identificamos que es la función tangente (tan(x))');
            steps.push('Aplicamos la regla de integración: ∫tan(x) dx = -ln|cos(x)| + C');
        }
        else if (originalFunc.isFunctionNode && originalFunc.name === 'log' && 
                 originalFunc.args[0].isSymbolNode && originalFunc.args[0].name === 'x') {
            steps.push('Identificamos que es la función logaritmo natural (ln(x))');
            steps.push('Aplicamos la regla de integración: ∫ln(x) dx = x*ln(x) - x + C');
        }
        else if (originalFunc.isOperatorNode && originalFunc.op === '/' && 
                 originalFunc.args[0].isConstantNode && originalFunc.args[0].value === 1 &&
                 originalFunc.args[1].isSymbolNode && originalFunc.args[1].name === 'x') {
            steps.push('Identificamos que es la función inversa (1/x)');
            steps.push('Aplicamos la regla de integración: ∫1/x dx = ln|x| + C');
        }
        else if (originalFunc.isFunctionNode && originalFunc.name === 'exp' && 
                 originalFunc.args[0].isSymbolNode && originalFunc.args[0].name === 'x') {
            steps.push('Identificamos que es la función exponencial (e^x)');
            steps.push('Aplicamos la regla de integración: ∫e^x dx = e^x + C');
        }
        else if (originalFunc.isOperatorNode && (originalFunc.op === '+' || originalFunc.op === '-')) {
            steps.push('Identificamos que es una suma/resta de funciones');
            steps.push('Aplicamos la linealidad de la integral: ∫(f ± g) dx = ∫f dx ± ∫g dx');
        }
        else if (originalFunc.isOperatorNode && originalFunc.op === '*' && 
                 (originalFunc.args[0].isConstantNode || originalFunc.args[1].isConstantNode)) {
            steps.push('Identificamos que es una multiplicación por constante');
            steps.push('Aplicamos la linealidad de la integral: ∫k*f dx = k*∫f dx');
        }
        else {
            steps.push('Aplicamos reglas generales de integración');
        }
        
        // Paso final: Mostrar el resultado
        steps.push(`Resultado final después de simplificar: ${result.toString()} + C`);
        
        return steps;
    }

    // Mostrar resultados
    function displayResults(originalFunc, result) {
        // Mostrar el resultado principal
        document.getElementById('original-function').textContent = `∫ ${originalFunc} dx`;
        document.getElementById('integral-result').textContent = result.result + ' + C';
        document.getElementById('result-content').style.display = 'block';
        document.querySelector('.result-placeholder').style.display = 'none';
        
        // Mostrar pasos
        const stepsList = document.getElementById('solution-steps');
        stepsList.innerHTML = '';
        result.steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            stepsList.appendChild(li);
        });
        document.getElementById('steps-content').style.display = 'block';
        document.querySelector('.steps-placeholder').style.display = 'none';
        
        // Mostrar gráfico
        document.getElementById('graph-content').style.display = 'block';
        document.querySelector('.graph-placeholder').style.display = 'none';
        renderGraph(originalFunc);
        
        // Renderizar con MathJax
        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    }

    // Mostrar errores
    function showError(message) {
        const resultContent = document.getElementById('result-content');
        resultContent.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
        resultContent.style.display = 'block';
        document.querySelector('.result-placeholder').style.display = 'none';
        
        // Ocultar otros contenidos
        document.getElementById('steps-content').style.display = 'none';
        document.getElementById('graph-content').style.display = 'none';
        document.querySelector('.steps-placeholder').style.display = 'flex';
        document.querySelector('.graph-placeholder').style.display = 'flex';
    }

    // Renderizar gráfico de la función
    function renderGraph(func) {
        try {
            const ctx = document.getElementById('function-graph').getContext('2d');
            
            // Limpiar gráfico anterior si existe
            if (window.functionChart) {
                window.functionChart.destroy();
            }
            
            // Preprocesar la función para math.js
            const processedFunc = preprocessFunction(func);
            const fn = math.parse(processedFunc).compile();
            
            // Generar datos para el gráfico
            const labels = [];
            const data = [];
            for (let x = -10; x <= 10; x += 0.1) {
                try {
                    const y = fn.evaluate({x: x});
                    labels.push(x);
                    data.push(y);
                } catch (e) {
                    // Ignorar puntos donde la función no está definida
                    labels.push(x);
                    data.push(null);
                }
            }
            
            // Crear el gráfico
            window.functionChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `f(x) = ${func}`,
                        data: data,
                        borderColor: 'rgba(58, 123, 213, 1)',
                        backgroundColor: 'rgba(58, 123, 213, 0.1)',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'x'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'f(x)'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: 'white'
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error al renderizar el gráfico:', error);
            document.getElementById('graph-content').innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>No se pudo generar el gráfico para esta función.</p>
                </div>
            `;
        }
    }
});

const particlesConfig = {
    "particles": {
        "number": {
            "value": 80,
            "density": {
                "enable": true,
                "value_area": 800
            }
        },
        "color": {
            "value": "#ffffff"
        },
        "shape": {
            "type": "circle",
            "stroke": {
                "width": 0,
                "color": "#000000"
            },
            "polygon": {
                "nb_sides": 5
            }
        },
        "opacity": {
            "value": 0.3,
            "random": false,
            "anim": {
                "enable": false,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
            }
        },
        "size": {
            "value": 3,
            "random": true,
            "anim": {
                "enable": false,
                "speed": 40,
                "size_min": 0.1,
                "sync": false
            }
        },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#ffffff",
            "opacity": 0.2,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 2,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": false,
                "rotateX": 600,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": true,
                "mode": "grab"
            },
            "onclick": {
                "enable": true,
                "mode": "push"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 140,
                "line_linked": {
                    "opacity": 1
                }
            },
            "bubble": {
                "distance": 400,
                "size": 40,
                "duration": 2,
                "opacity": 8,
                "speed": 3
            },
            "repulse": {
                "distance": 200,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 4
            },
            "remove": {
                "particles_nb": 2
            }
        }
    },
    "retina_detect": true
};

// Inicializar partículas
particlesJS('particles-js', particlesConfig);