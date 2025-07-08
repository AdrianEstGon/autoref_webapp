import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Selecciona una opción de un campo Autocomplete de MUI.
 * 
 * @param labelRegex - El `label` visible del campo (expresión regular para flexibilidad).
 * @param textoOpcion - El texto exacto de la opción que deseas seleccionar.
 */
export async function seleccionarOpcionAutocomplete(labelRegex: RegExp, textoOpcion: string) {
  const user = userEvent.setup();

  const input = await screen.findByLabelText(labelRegex);

  // Click para abrir el Autocomplete
  await user.click(input);

  // Esperar y hacer click en la opción deseada
  const option = await screen.findByText(textoOpcion);
  await user.click(option);
}
/**
 * Selecciona una opción de un campo Autocomplete de MUI usando su testId.
 * 
 * @param testId - El `data-testid` del campo Autocomplete.
 * @param textoOpcion - El texto exacto de la opción que deseas seleccionar.
 */

export async function seleccionarOpcionAutocompleteByTestId(testId: string, textoOpcion: string) {
  const user = userEvent.setup();
  const input = await screen.findByTestId(testId);

  // Forzar apertura del menú del Autocomplete
  await user.click(input);
  await user.keyboard('{arrowdown}');

  // Esperar a que aparezcan las opciones
  await waitFor(() => {
    const options = document.body.querySelectorAll('[role="option"]');
    expect(options.length).toBeGreaterThan(0);
  });

  // Buscar la opción
  const allOptions = Array.from(document.body.querySelectorAll('[role="option"]'));
  const option = allOptions.find(
    (opt) => opt.textContent?.trim() === textoOpcion
  );

  if (!option) {
    throw new Error(`No se encontró la opción "${textoOpcion}" en el Autocomplete con testId "${testId}".`);
  }

  await user.click(option);
}
