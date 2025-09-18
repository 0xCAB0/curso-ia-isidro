document.addEventListener('DOMContentLoaded',
    () => {
    
        // --- Mobile Menu Functionality ---
        const menuToggle = document.getElementById('menu-toggle');
        const closeMenu = document.getElementById('close-menu');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
    
        const openMenu = () => {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
        };
    
        const closeMenuFunc = () => {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        };
    
        menuToggle.addEventListener('click', openMenu);
        closeMenu.addEventListener('click', closeMenuFunc);
        overlay.addEventListener('click', closeMenuFunc);
    
        // Close menu when a link is clicked
        document.querySelectorAll('#sidebar nav a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 1024) { // lg breakpoint
                    closeMenuFunc();
                }
            });
        });
    
        // --- Active Nav Link on Scroll ---
        const sections = document.querySelectorAll('article[id]');
        const navLinks = document.querySelectorAll('.nav-link');
    
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href').substring(1) === entry.target.id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { rootMargin: '-30% 0px -70% 0px' });
    
        sections.forEach(section => observer.observe(section));
    
    
        // --- Prompt Tabs Functionality ---
        const promptBtns = document.querySelectorAll('.prompt-btn');
        const promptPanels = document.querySelectorAll('.prompt-panel');
    
        promptBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                promptBtns.forEach(pBtn => pBtn.classList.remove('active'));
                btn.classList.add('active');
    
                const targetId = btn.dataset.target;
                promptPanels.forEach(panel => {
                    if (panel.id === targetId) {
                        panel.classList.remove('hidden');
                    } else {
                        panel.classList.add('hidden');
                    }
                });
            });
        });
    
        // --- Gemini Prompt Analyzer ---
        const analyzeBtn = document.getElementById('analyze-prompt-btn');
        const userPromptTextarea = document.getElementById('user-prompt');
        const expertPromptContainer = document.getElementById('expert-prompt-container');
        const expertPromptEl = document.getElementById('expert-prompt');
        const errorMessageEl = document.getElementById('error-message');
        const spinner = document.getElementById('loading-spinner');
        const buttonText = document.getElementById('button-text');
    
        analyzeBtn.addEventListener('click', async () => {
            const userPrompt = userPromptTextarea.value.trim();
            if (!userPrompt) {
                errorMessageEl.textContent = "Por favor, introduce un prompt para analizar.";
                errorMessageEl.classList.remove('hidden');
                return;
            }
    
            spinner.classList.remove('hidden');
            buttonText.textContent = "Analizando...";
            analyzeBtn.disabled = true;
            errorMessageEl.classList.add('hidden');
            expertPromptContainer.classList.add('hidden');
    
            const systemPrompt = `Actúa como un experto mundial en "Prompt Engineering" especializado en el campo médico y académico. Tu tarea es transformar un prompt simple de un usuario en un prompt de nivel experto, estructurado y detallado que genere resultados de alta calidad de un LLM como Gemini.
            
            El prompt mejorado debe seguir esta estructura:
            1.  **ROL (Persona):** Asigna un rol específico y con autoridad a la IA (Ej: "Actúa como un Catedrático de Cirugía Vascular especializado en docencia...").
            2.  **TAREA:** Describe la tarea de forma clara y concisa (Ej: "Tu tarea es generar el esquema para una presentación...").
            3.  **CONTEXTO:** Proporciona el contexto necesario (Ej: "La presentación durará 15 minutos...").
            4.  **PÚBLICO OBJETIVO:** Define claramente a quién va dirigido el contenido (Ej: "...dirigida a residentes de cirugía vascular de 3er año.").
            5.  **FORMATO DE SALIDA:** Especifica exactamente cómo quieres la respuesta (Ej: "Genera el esquema en formato de lista numerada con 5 puntos principales. Cada punto debe tener 3 sub-puntos.").
            6.  **RESTRICCIONES/TONO:** Añade cualquier restricción o guía de estilo (Ej: "Utiliza un tono formal pero didáctico. Evita la jerga excesivamente compleja. Basa tus respuestas en evidencia científica actualizada hasta 2023.").
    
            Transforma el siguiente prompt del usuario en un prompt experto siguiendo esta estructura. Devuelve únicamente el prompt mejorado, sin explicaciones adicionales.`;
    
            try {
                const apiKey = ""; // API key is handled by the environment
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
                
                const payload = {
                    contents: [{ parts: [{ text: userPrompt }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                };
    
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
    
                if (!response.ok) {
                    throw new Error(`Error de la API: ${response.statusText}`);
                }
    
                const result = await response.json();
                const improvedPrompt = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
                if (improvedPrompt) {
                    expertPromptEl.textContent = improvedPrompt;
                    expertPromptContainer.classList.remove('hidden');
                } else {
                    throw new Error("No se recibió un prompt mejorado en la respuesta.");
                }
    
            } catch (error) {
                console.error("Error:", error);
                errorMessageEl.textContent = "Lo siento, ha ocurrido un error al contactar con Gemini. Por favor, inténtalo de nuevo más tarde.";
                errorMessageEl.classList.remove('hidden');
            } finally {
                spinner.classList.add('hidden');
                buttonText.textContent = "Analizar y Mejorar Prompt";
                analyzeBtn.disabled = false;
            }
        });
    
        // --- Quiz Functionality ---
        const quizQuestions = document.querySelectorAll('.quiz-question');
        const quizResultsContainer = document.getElementById('quiz-results');
        const quizScoreEl = document.getElementById('quiz-score');
        let score = 0;
        let questionsAnswered = 0;
    
        quizQuestions.forEach(question => {
            const options = question.querySelectorAll('.quiz-option');
            const feedback = question.querySelector('.quiz-feedback');
            
            options.forEach(option => {
                option.addEventListener('click', () => {
                    // Prevent re-answering
                    if (question.dataset.answered) return;
                    question.dataset.answered = 'true';
                    questionsAnswered++;
    
                    const isCorrect = option.dataset.correct === 'true';
    
                    if (isCorrect) {
                        option.classList.add('correct');
                        feedback.textContent = "¡Correcto! Excelente trabajo.";
                        feedback.classList.add('text-green-600');
                        score++;
                    } else {
                        option.classList.add('incorrect');
                        const correctOption = question.querySelector('[data-correct="true"]');
                        correctOption.classList.add('correct');
                        feedback.textContent = "No es del todo correcto. La respuesta correcta está resaltada en verde.";
                        feedback.classList.add('text-red-600');
                    }
                    
                    feedback.classList.remove('hidden');
                    options.forEach(btn => btn.disabled = true);
    
                    if (questionsAnswered === quizQuestions.length) {
                        showResults();
                    }
                });
            });
        });
    
        function showResults() {
            quizScoreEl.textContent = `Has acertado ${score} de ${quizQuestions.length} preguntas.`;
            quizResultsContainer.classList.remove('hidden');
        }
    
        // --- Star Rating Functionality ---
        const ratingInputs = document.querySelectorAll('.star-rating input');
        const ratingFeedback = document.getElementById('rating-feedback');
        const feedbackMessages = {
            1: "Gracias, tomaré nota para mejorar.",
            2: "Aprecio tus comentarios.",
            3: "¡Me alegra que te haya sido útil!",
            4: "¡Excelente! Gracias por tu valoración.",
            5: "¡Fantástico! Me alegro de haber cumplido tus expectativas."
        };
    
        ratingInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const value = e.target.value;
                ratingFeedback.textContent = feedbackMessages[value] || "";
            });
        });
    
        // --- Nano Banano Image Generator ---
        const generateImageBtn = document.getElementById('generate-image-btn');
        const imagePromptTextarea = document.getElementById('image-prompt');
        const imageOutputDiv = document.getElementById('image-output');
        const imageErrorMessageEl = document.getElementById('image-error-message');
        const imageSpinner = document.getElementById('image-spinner');
        const imageButtonText = document.getElementById('image-button-text');
    
        // Pre-fill with an example prompt
        imagePromptTextarea.value = "Diagrama esquemático y limpio de una fístula arteriovenosa para hemodiálisis, mostrando la arteria, la vena y la anastomosis. Estilo infografía moderna, con etiquetas claras para 'Flujo arterial', 'Anastomosis' y 'Vena arterializada'. Aislado sobre fondo blanco.";
    
        generateImageBtn.addEventListener('click', async () => {
            const userPrompt = imagePromptTextarea.value.trim();
            if (!userPrompt) {
                imageErrorMessageEl.textContent = "Por favor, introduce una descripción para generar la imagen.";
                imageErrorMessageEl.classList.remove('hidden');
                return;
            }
    
            imageSpinner.classList.remove('hidden');
            imageButtonText.textContent = "Generando...";
            generateImageBtn.disabled = true;
            imageErrorMessageEl.classList.add('hidden');
            imageOutputDiv.innerHTML = '<div class="spinner animate-spin mx-auto"></div>';
    
            try {
                const apiKey = ""; // API key is handled by the environment
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
                
                const payload = {
                    instances: [{ prompt: userPrompt }],
                    parameters: { "sampleCount": 1 }
                };
    
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
    
                if (!response.ok) {
                    throw new Error(`Error de la API: ${response.status} ${response.statusText}`);
                }
    
                const result = await response.json();
                const base64Data = result.predictions?.[0]?.bytesBase64Encoded;
    
                if (base64Data) {
                    const imageUrl = `data:image/png;base64,${base64Data}`;
                    imageOutputDiv.innerHTML = `<img src="${imageUrl}" alt="Imagen generada por IA" class="w-full h-auto rounded-lg shadow-md">`;
                } else {
                    throw new Error("No se recibió una imagen en la respuesta.");
                }
    
            } catch (error) {
                console.error("Error al generar imagen:", error);
                imageErrorMessageEl.textContent = "Lo siento, ha ocurrido un error al generar la imagen. Por favor, revisa el prompt o inténtalo de nuevo más tarde.";
                imageErrorMessageEl.classList.remove('hidden');
                imageOutputDiv.innerHTML = '<p class="placeholder-text">Error al generar. Tu imagen aparecería aquí...</p>';
            } finally {
                imageSpinner.classList.add('hidden');
                imageButtonText.textContent = "Generar Imagen";
                generateImageBtn.disabled = false;
            }
        });
    
    });