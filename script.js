'use strict';

// Selectmenu
const selectElements = document.querySelectorAll('select');
selectElements.forEach(selectElement => {
  const selectmenu = new SelectMenu(selectElement);
});
