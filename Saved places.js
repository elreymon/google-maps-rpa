//==================================================================
// Google Collections Automation Script
// Automatiza la adición de elementos de [SEP] QI Turismo a [AST] QI Turismo
// v1.1 - Fixed: No espera carga en primera iteración + Control de parada
//==================================================================

//==================================================================
// VARIABLES DE CONTROL GLOBAL
//==================================================================

// Variable global para controlar la ejecución del script
let STOP_AUTOMATION = false;

// Función para detener el script
function stopAutomation() {
    STOP_AUTOMATION = true;
    console.log('🛑 STOP solicitado. El script se detendrá después de la iteración actual.');
    console.log('💡 Para reanudar, ejecuta: resumeAutomation()');
}

// Función para reanudar el script
function resumeAutomation() {
    STOP_AUTOMATION = false;
    console.log('▶️ Automatización reanudada.');
}

// Función para verificar si se debe detener
function shouldStop() {
    return STOP_AUTOMATION;
}

//==================================================================
// FUNCIONES AUXILIARES BASADAS EN EL SCRIPT ORIGINAL
//==================================================================

// Simple delay en milisegundos
async function delay(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
}

// Espera hasta que el texto indicado aparece en pantalla
async function waitForTextToAppear(text, elementType = 'div', timeout = 10000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            // Verificar si se solicitó parar
            if (shouldStop()) {
                clearInterval(interval);
                reject(new Error('Script detenido por el usuario'));
                return;
            }
            
            if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                reject(new Error(`Timeout: El texto "${text}" no apareció después de ${timeout}ms`));
                return;
            }
            
            const element = Array.from(document.querySelectorAll(elementType))
                .find(el => el.textContent.trim() === text);
            if (element) {
                clearInterval(interval);
                resolve(element);
                return;
            }
        }, 100);
    });
}

// Espera hasta que aparezca un elemento con el selector dado
async function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            // Verificar si se solicitó parar
            if (shouldStop()) {
                clearInterval(interval);
                reject(new Error('Script detenido por el usuario'));
                return;
            }
            
            if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                reject(new Error(`Timeout: Elemento con selector "${selector}" no encontrado después de ${timeout}ms`));
                return;
            }
            
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                resolve(element);
                return;
            }
        }, 100);
    });
}

// Espera hasta que un elemento sea clickeable
async function waitForClickableElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            // Verificar si se solicitó parar
            if (shouldStop()) {
                clearInterval(interval);
                reject(new Error('Script detenido por el usuario'));
                return;
            }
            
            if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                reject(new Error(`Timeout: Elemento clickeable "${selector}" no encontrado después de ${timeout}ms`));
                return;
            }
            
            const element = document.querySelector(selector);
            if (element && element.offsetParent !== null && !element.disabled) {
                clearInterval(interval);
                resolve(element);
                return;
            }
        }, 100);
    });
}

// Busca texto que contenga una cadena específica
async function waitForTextToAppearContains(text, elementType = '*', timeout = 10000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            // Verificar si se solicitó parar
            if (shouldStop()) {
                clearInterval(interval);
                reject(new Error('Script detenido por el usuario'));
                return;
            }
            
            if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                reject(new Error(`Timeout: El texto que contiene "${text}" no apareció después de ${timeout}ms`));
                return;
            }
            
            const element = Array.from(document.querySelectorAll(elementType))
                .find(el => el.textContent.trim().includes(text));
            if (element) {
                clearInterval(interval);
                resolve(element);
                return;
            }
        }, 100);
    });
}

//==================================================================
// FUNCIONES PRINCIPALES DE AUTOMATIZACIÓN
//==================================================================

// Espera a que la página esté completamente cargada (SOLO SI NO ESTÁ LISTA)
async function waitForPageLoadIfNeeded(timeout = 5000) {
    console.log('🔍 Verificando si la página está lista...');
    
    // Verificar inmediatamente si ya está lista
    if (document.readyState === 'complete' && 
        document.querySelectorAll('div[data-list-item]').length > 0) {
        console.log('✅ La página ya está cargada y lista');
        return;
    }
    
    console.log('⏳ Esperando que la página termine de cargar...');
    
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkLoaded = () => {
            // Verificar si se solicitó parar
            if (shouldStop()) {
                reject(new Error('Script detenido por el usuario'));
                return;
            }
            
            if (Date.now() - startTime > timeout) {
                reject(new Error(`Timeout: La página no terminó de cargar después de ${timeout}ms`));
                return;
            }
            
            if (document.readyState === 'complete' && 
                document.querySelectorAll('div[data-list-item]').length > 0) {
                console.log('✅ Página cargada completamente');
                resolve();
            } else {
                setTimeout(checkLoaded, 200);
            }
        };
        
        checkLoaded();
    });
}

// Obtiene el primer elemento de la lista
async function getFirstListItem() {
    console.log('🔍 Buscando el primer elemento de la lista...');
    
    // Esperar a que haya elementos en la lista
    await waitForElement('div[data-list-item]', 5000);
    
    const firstItem = document.querySelector('div[data-list-item]');
    if (!firstItem) {
        throw new Error('No se encontró el primer elemento de la lista');
    }
    
    const itemName = firstItem.querySelector('div[role="button"] > div:first-child')?.textContent?.trim();
    console.log(`✅ Primer elemento encontrado: ${itemName || 'Sin nombre'}`);
    
    return firstItem;
}

// Encuentra y hace clic en el botón de tres puntos del primer elemento
async function clickThreeDotsButton(listItem) {
    console.log('🔍 Buscando el botón de tres puntos...');
    
    // Buscar el botón de tres puntos dentro del elemento de la lista
    const threeDotsButton = listItem.querySelector('button[aria-label*="Más"], button[data-value="menu"], button[aria-haspopup="menu"]');
    
    if (!threeDotsButton) {
        throw new Error('No se encontró el botón de tres puntos');
    }
    
    console.log('✅ Botón de tres puntos encontrado');
    console.log('🖱️ Haciendo clic en el botón de tres puntos...');
    
    threeDotsButton.click();
    await delay(500); // Esperar a que aparezca el menú
    
    console.log('✅ Clic realizado en el botón de tres puntos');
}

// Espera a que aparezca el menú y hace clic en "Añadir a una colección"
async function clickAddToCollection() {
    console.log('⏳ Esperando que aparezca el menú emergente...');
    
    // Esperar a que aparezca la opción "Añadir a una colección"
    const addToCollectionOption = await waitForTextToAppear('Añadir a una colección', '*', 5000);
    
    console.log('✅ Opción "Añadir a una colección" encontrada');
    console.log('🖱️ Haciendo clic en "Añadir a una colección"...');
    
    addToCollectionOption.click();
    await delay(500); // Esperar a que aparezca el popup de colecciones
    
    console.log('✅ Clic realizado en "Añadir a una colección"');
}

// Espera al popup de colecciones y hace clic en "[AST] QI Turismo"
async function selectASTCollection() {
    console.log('⏳ Esperando que aparezca el popup de colecciones...');
    
    // Esperar a que aparezca la colección "[AST] QI Turismo"
    const astCollection = await waitForTextToAppear('[AST] QI Turismo', '*', 8000);
    
    console.log('✅ Colección "[AST] QI Turismo" encontrada');
    console.log('🖱️ Haciendo clic en "[AST] QI Turismo"...');
    
    astCollection.click();
    await delay(500); // Esperar a que se procese la acción
    
    console.log('✅ Clic realizado en "[AST] QI Turismo"');
}

// Espera al toast de confirmación y lo registra
async function waitForConfirmationToast() {
    console.log('⏳ Esperando el mensaje de confirmación...');
    
    try {
        const toast = await waitForTextToAppearContains('Añadido a [AST] QI Turismo', '*', 10000);
        
        console.log('🎉 ¡ÉXITO! Toast de confirmación detectado:');
        console.log(`📨 Mensaje: "${toast.textContent.trim()}"`);
        
        // Esperar un poco para que el toast sea visible
        await delay(2000);
        
        return true;
    } catch (error) {
        console.warn('⚠️ No se detectó el toast de confirmación, pero es posible que la operación haya sido exitosa');
        return false;
    }
}

//==================================================================
// FUNCIÓN PRINCIPAL DE PROCESAMIENTO
//==================================================================

// Procesa un elemento individual
async function processOneItem(iteration, isFirstIteration = false) {
    console.log(`\n🔄 ======== ITERACIÓN ${iteration} ========`);
    
    // Verificar si se solicitó parar
    if (shouldStop()) {
        console.log('🛑 Script detenido por el usuario');
        throw new Error('Script detenido por el usuario');
    }
    
    try {
        // Paso 1: Esperar a que la página esté lista (solo si no es la primera iteración)
        if (isFirstIteration) {
            console.log('ℹ️ Primera iteración - omitiendo espera de carga de página');
            await waitForPageLoadIfNeeded(2000); // Timeout corto solo para verificar
        } else {
            await waitForPageLoadIfNeeded();
        }
        await delay(1000);
        
        // Verificar si se solicitó parar antes de continuar
        if (shouldStop()) {
            throw new Error('Script detenido por el usuario');
        }
        
        // Paso 2: Obtener el primer elemento de la lista
        const firstItem = await getFirstListItem();
        await delay(500);
        
        // Paso 3: Hacer clic en los tres puntos
        await clickThreeDotsButton(firstItem);
        await delay(1000);
        
        // Paso 4: Hacer clic en "Añadir a una colección"
        await clickAddToCollection();
        await delay(1500);
        
        // Paso 5: Seleccionar "[AST] QI Turismo"
        await selectASTCollection();
        await delay(2000);
        
        // Paso 6: Esperar confirmación
        await waitForConfirmationToast();
        
        console.log(`✅ ======== ITERACIÓN ${iteration} COMPLETADA ========\n`);
        
        // Esperar antes de la siguiente iteración para que la lista se actualice
        await delay(3000);
        
        return true;
        
    } catch (error) {
        if (error.message.includes('Script detenido por el usuario')) {
            throw error; // Propagar el error de parada
        }
        
        console.error(`❌ Error en la iteración ${iteration}:`, error.message);
        console.log(`⚠️ Continuando con la siguiente iteración después de una pausa...`);
        
        // Esperar un poco más si hay error
        await delay(5000);
        
        return false;
    }
}

//==================================================================
// FUNCIÓN PRINCIPAL DEL SCRIPT
//==================================================================

// Función principal que ejecuta el bucle completo
async function automateGoogleCollections() {
    console.log('🚀 ======== INICIANDO AUTOMATIZACIÓN ========');
    console.log('📋 Procesando 5 elementos de [SEP] QI Turismo hacia [AST] QI Turismo');
    console.log('💡 Para detener el script en cualquier momento, ejecuta: stopAutomation()\n');
    
    // Resetear la variable de parada al inicio
    STOP_AUTOMATION = false;
    
    const totalIterations = 5;
    let successfulIterations = 0;
    let failedIterations = 0;
    
    try {
        for (let i = 1; i <= totalIterations; i++) {
            // Verificar si se solicitó parar
            if (shouldStop()) {
                console.log('🛑 Automatización detenida por el usuario');
                break;
            }
            
            const isFirstIteration = (i === 1);
            const success = await processOneItem(i, isFirstIteration);
            
            if (success) {
                successfulIterations++;
            } else {
                failedIterations++;
            }
            
            // Pequeña pausa entre iteraciones
            if (i < totalIterations && !shouldStop()) {
                console.log(`⏸️ Pausa entre iteraciones... (${i}/${totalIterations})`);
                await delay(2000);
            }
        }
    } catch (error) {
        if (error.message.includes('Script detenido por el usuario')) {
            console.log('🛑 Script detenido por solicitud del usuario');
        } else {
            console.error('❌ Error crítico en la automatización:', error.message);
        }
    }
    
    console.log('\n🏁 ======== AUTOMATIZACIÓN COMPLETADA ========');
    console.log(`📊 Resumen:`);
    console.log(`   ✅ Exitosas: ${successfulIterations}/${totalIterations}`);
    console.log(`   ❌ Fallidas: ${failedIterations}/${totalIterations}`);
    
    if (totalIterations > 0) {
        console.log(`   📈 Tasa de éxito: ${Math.round((successfulIterations/totalIterations) * 100)}%`);
    }
    
    if (successfulIterations === totalIterations) {
        console.log('🎉 ¡Todas las operaciones completadas exitosamente!');
    } else if (shouldStop()) {
        console.log('⏸️ Automatización detenida antes de completar todas las iteraciones');
    } else {
        console.log('⚠️ Algunas operaciones fallaron. Revisa los logs anteriores.');
    }
    
    // Resetear variable de parada al final
    STOP_AUTOMATION = false;
}

//==================================================================
// FUNCIONES DE UTILIDAD PARA DEPURACIÓN
//==================================================================

// Función para inspeccionar la estructura actual de la página
function debugPageStructure() {
    console.log('🔍 ======== DEPURACIÓN DE ESTRUCTURA ========');
    
    const listItems = document.querySelectorAll('div[data-list-item]');
    console.log(`📝 Elementos de lista encontrados: ${listItems.length}`);
    
    if (listItems.length > 0) {
        const firstItem = listItems[0];
        console.log('🔍 Primer elemento:', firstItem);
        
        const threeDotsButtons = firstItem.querySelectorAll('button');
        console.log(`🔘 Botones encontrados en el primer elemento: ${threeDotsButtons.length}`);
        
        threeDotsButtons.forEach((btn, index) => {
            console.log(`   Botón ${index + 1}:`, {
                ariaLabel: btn.getAttribute('aria-label'),
                dataValue: btn.getAttribute('data-value'),
                ariaHaspopup: btn.getAttribute('aria-haspopup'),
                textContent: btn.textContent.trim()
            });
        });
    }
    
    console.log('🏁 ======== FIN DEPURACIÓN ========');
}

// Función de test para verificar selectores
async function testSelectors() {
    console.log('🧪 ======== PRUEBA DE SELECTORES ========');
    
    try {
        console.log('1️⃣ Probando carga de página...');
        await waitForPageLoadIfNeeded();
        console.log('✅ Página verificada');
        
        console.log('2️⃣ Probando obtención del primer elemento...');
        const firstItem = await getFirstListItem();
        console.log('✅ Primer elemento obtenido');
        
        console.log('3️⃣ Probando localización del botón de tres puntos...');
        const threeDotsButton = firstItem.querySelector('button[aria-label*="Más"], button[data-value="menu"], button[aria-haspopup="menu"]');
        if (threeDotsButton) {
            console.log('✅ Botón de tres puntos encontrado');
        } else {
            console.log('❌ Botón de tres puntos NO encontrado');
            debugPageStructure();
        }
        
        console.log('🏁 Prueba de selectores completada');
        
    } catch (error) {
        console.error('❌ Error en la prueba de selectores:', error.message);
    }
}

//==================================================================
// INSTRUCCIONES DE USO Y CONTROL
//==================================================================

console.log(`
🚀 SCRIPT DE AUTOMATIZACIÓN DE GOOGLE COLLECTIONS v1.1
======================================================

INSTRUCCIONES DE USO:

1. Navega a: https://www.google.com/interests/saved/list/g0aA0LC8-ib4cIPcj3amUorBIS3sKA
2. Asegúrate de estar logueado en tu cuenta de Google
3. Espera a que la página cargue completamente
4. Ejecuta en la consola: automateGoogleCollections()

FUNCIONES DISPONIBLES:
- automateGoogleCollections()     → Ejecuta el proceso completo
- stopAutomation()               → ⛔ DETIENE el script inmediatamente
- resumeAutomation()             → ▶️ Reanuda si fue detenido
- testSelectors()                → Prueba los selectores
- debugPageStructure()           → Inspecciona la estructura
- processOneItem(n)              → Procesa un solo elemento

CONTROL DE EJECUCIÓN:
🛑 Para PARAR el script: stopAutomation()
▶️ Para REANUDAR: resumeAutomation()

MEJORAS v1.1:
✅ No espera carga innecesaria en primera iteración
✅ Control completo de parada/reanudación
✅ Verificaciones de parada en todos los bucles

¡Listo para usar! 🎯
`);