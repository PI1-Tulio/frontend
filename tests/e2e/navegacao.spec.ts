import { test, expect } from '@playwright/test';


test.describe('Navegação e integração', () => {
  test('Aplicação carrega corretamente e exibe interface inicial', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('banner')).toBeVisible();

    await expect(page.getByText('Insira as Instruções')).toBeVisible();

    await expect(page.getByText('As instruções aparecem aqui!')).toBeVisible();
  });

  test('Botões de ação estão presentes e funcionais', async ({ page }) => {
    await page.goto('/');

    const addButton = page.getByRole('button', { name: 'Adicionar' });
    const confirmButton = page.getByRole('button', { name: 'Confirmar' });
    const cancelButton = page.getByRole('button', { name: 'Cancelar' });

    await expect(addButton).toBeVisible();
    await expect(confirmButton).toBeVisible();
    await expect(cancelButton).toBeVisible();

    await expect(addButton).toBeEnabled();
  });

  test('Adicionar múltiplas instruções e verificar ordem', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Adicionar' }).click();
    await expect(page.getByText('Instrução 1')).toBeVisible();

    await page.getByRole('button', { name: 'Adicionar' }).click();
    await expect(page.getByText('Instrução 2')).toBeVisible();

    await page.getByRole('button', { name: 'Adicionar' }).click();
    await expect(page.getByText('Instrução 3')).toBeVisible();

    const instructions = page.getByText(/Instrução \d+/);
    await expect(instructions).toHaveCount(3);
  });

  test('Fluxo completo: adicionar, editar valores e enviar instruções', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Adicionar' }).click();

    const select = page.getByRole('combobox').first();
    await select.selectOption('move');
    await expect(select).toHaveValue('move');

    await page.getByRole('button', { name: 'Adicionar' }).click();
    const secondSelect = page.getByRole('combobox').nth(1);
    await secondSelect.selectOption('turn');
    await expect(secondSelect).toHaveValue('turn');

    const confirmButton = page.getByRole('button', { name: 'Confirmar' });
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    await expect(confirmButton).toBeDisabled();
  });

  test('Cancelar instruções limpa a lista', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Adicionar' }).click();
    await page.getByRole('button', { name: 'Adicionar' }).click();
    await page.getByRole('button', { name: 'Adicionar' }).click();

    await expect(page.getByText('Instrução 1')).toBeVisible();
    await expect(page.getByText('Instrução 2')).toBeVisible();
    await expect(page.getByText('Instrução 3')).toBeVisible();

    await page.getByRole('button', { name: 'Cancelar' }).click();

    await expect(page.getByText('As instruções aparecem aqui!')).toBeVisible();

    await expect(page.getByText('Instrução 1')).not.toBeVisible();
  });
});
