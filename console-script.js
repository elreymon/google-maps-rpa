//=======================================================================================================================
// console-script.js
//
// v1.0
//=======================================================================================================================

//=======================================================================================================================
// Espera hasta que el texto indicado aparece en pantalla (por defecot dentro de un div)
// v1.0
//=======================================================================================================================
async function waitForTextToAppear(text, elementType = 'div') {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const element = Array.from(document.querySelectorAll(elementType))
                    .find(el => el.textContent === text);
      if (element) {
        clearInterval(interval);
        resolve();
        return;
      }
    }, 100);
  });
}

//=======================================================================================================================
// Espera hasta que el texto indicado DESAPAREZCA de la pantalla (por defecot dentro de un div)
// v1.0
//=======================================================================================================================
async function waitForTextToDisappear(text, elementType = 'div') {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const element = Array.from(document.querySelectorAll(elementType))
                    .find(el => el.textContent === text);
      if (!element) {
        clearInterval(interval);
        resolve();
        return;
      }
    }, 100);
  });
}

//=======================================================================================================================
// Simple delay en milisegundos
// v1.0
//=======================================================================================================================
async function delay(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

//=======================================================================================================================
// Pulsa sobre el botón de Guardar
// v1.0
//=======================================================================================================================
function clickSaveButton() {
  const saveButton = document.querySelector('[data-value*="Save"]');
  if (!saveButton) {
    console.log('Save button not found');
    return;
  }

  console.log('Found save button:', saveButton);

  saveButton.click();
  console.log('Clicked save button');
}

//=======================================================================================================================
// Procesa un elemento (POI) que le llega por parámetro
// v1.0
//=======================================================================================================================
async function processOnePlace(place) {
  console.log('Processing place:', place);

  const button = place.parentElement.parentElement.previousSibling;
  if (!button) {
    console.log('Button not found');
    return;
  }

  console.log('Found button:', button);

  const categorySpan = button.querySelector('.fontBodyMedium > div:last-child > div:last-child span:last-child');   // CLAVE
  if (!categorySpan) {
    console.log('Category span not found');
    return;
  }

  console.log('Found category span:', categorySpan);

  const placeNameElement = button.querySelector('.fontHeadlineSmall');
  if (!placeNameElement) {
    console.log('Place name element not found');
    return;
  }

  console.log('Found sitio name element:', placeNameElement);

  button.click();
  console.log('Clicked button');
  await delay(250);

  const placeName = placeNameElement.textContent;
  console.log('Nombre del sitio:', placeName);

  await waitForTextToAppear(placeName, 'h1');
  console.log('H1 element found');
  await delay(250);

  clickSaveButton();
  await delay(250);

  const wantToGoElement = Array.from(document.querySelectorAll('[aria-checked="true"] div'))
                    .find(el => el.textContent === 'Want to go');
  if (wantToGoElement) {
    console.log('Found "Want to go" element:', wantToGoElement);

    wantToGoElement.parentElement.click();
    console.log('Clicked "Want to go" element');
    await delay(250);

    await waitForTextToAppear('Removing…');
    console.log('Removing…');
    await delay(250);

    await waitForTextToDisappear('Removing…');
    console.log('Removed from Want to go');
    await delay(250);
  }

  const category = categorySpan.textContent.trim().replace('· ', '');
  console.log('Category:', category);

  const targetCategories = {
    'Cafe': 'Coffee',
    'Coffee shop': 'Coffee', 
    'Coffee': 'Coffee',
    'Espresso bar': 'Coffee',
    'Tea house': 'Tea',
    'Tea shop': 'Tea',
    'Tea store': 'Tea',
    'Chinese tea house': 'Tea',
    'Bakery': 'Bakery',
    'Pastry shop': 'Bakery',
    'Dessert': 'Dessert',
    'Dessert shop': 'Dessert',
    'Dessert restaurant': 'Dessert',
    'Japanese sweets restaurant': 'Dessert',
  };

  const targetCategory = targetCategories[category] || 'Food';
  console.log('Target category:', targetCategory);

  if(!category.includes('closed')) {
    clickSaveButton();
    await delay(250);

    const targetElement = Array.from(document.querySelectorAll('[aria-checked="false"] div'))
                      .find(el => el.textContent === targetCategory);
    if (!targetElement) {
      console.log('Target element not found');
      return;
    }

    console.log('Found target element:', targetElement);

    targetElement.parentElement.click();
    console.log(`Clicked ${targetCategory}`);  // OJO es ` no '
    await delay(250);

    await waitForTextToAppear('Saving…');
    console.log('Saving…');
    await delay(250);

    await waitForTextToDisappear('Saving…');
    console.log(`Saved to ${targetCategory}`);
  }
  await delay(250);
}

//=======================================================================================================================
// Actúa, por ejemplo sobre: https://www.google.com/maps/@40.8172061,-51.0604378,4z/data=!4m6!1m2!10m1!1e1!11m2!2sg0aA0LC8-ib4cIPcj3amUorBIS3sKA!3e3?hl=es&entry=ttu&g_ep=EgoyMDI1MDkyOS4wIKXMDSoASAFQAw%3D%3D
// v1.0
//=======================================================================================================================
async function processPlaces() {
  // const restaurants = document.querySelectorAll('[aria-label="Add note"]');
  const places = document.querySelectorAll('[aria-label="Añadir nota"]');  //obtenemos array de sitios
  console.log('Lugares encontrados:', places.length);

  // parentElement= <div class="j3fM2b ">
  // parentElement.parentElement= <div class="R6tTO" aria-hidden="false">
  // Sibling= hermano. PreviousSibling= Hermano mayor. De los que están a su mismo nivel (hermanos) devuelve el anterior.
  // parentElement.parentElement.previousSibling= <button class="SMP2wb fHEb6e"
  // TEST= console.log( document.querySelectorAll('[aria-label="Añadir nota"]').parentElement.parentElement.previousSibling.querySelectorAll('img') )
  for (const place of places) {
    const isBroken = Array.from(place.parentElement.parentElement.previousSibling.querySelectorAll('img')) // busca imágenes dentro del elemento <button>
    .some(img => img.src === 'https://maps.gstatic.com/tactile/pane/result-no-thumbnail-2x.png');

    if (isBroken) {
      continue; // si está roto no hacemos nada, lo obviamos y continuamos
    } else {
      await processOnePlace(place);
      break;
    }// else
  }// for

  processPlaces();
}

processPlaces();
