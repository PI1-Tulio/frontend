import { test, expect } from '@playwright/test';


test.describe('Fluxo de instruções', () => {
  test('Usuário pode adicionar, editar, remover e enviar instruções', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Insira as Instruções')).toBeVisible();

    await page.getByRole('button', { name: 'Adicionar' }).click();
    await expect(page.getByText('Instrução 1')).toBeVisible();

    const actionSelect = page.getByRole('combobox').first();
    await actionSelect.selectOption('turn');
    await expect(actionSelect).toHaveValue('turn');

    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByText('As instruções aparecem aqui!')).toBeVisible();

    await page.getByRole('button', { name: 'Adicionar' }).click();
    await page.getByRole('button', { name: 'Confirmar' }).click();
    await expect(page.getByRole('button', { name: 'Confirmar' })).toBeDisabled();
  });
});
