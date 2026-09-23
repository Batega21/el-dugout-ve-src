// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationModalComponent, ConfirmationModalData } from './confirmation-modal.component';

describe('ConfirmationModalComponent', () => {
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    dialogRefMock = {
      close: vi.fn(),
    };
  });

  function createComponent(data: ConfirmationModalData): ConfirmationModalComponent {
    const injector = Injector.create({
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });

    return runInInjectionContext(injector, () => new ConfirmationModalComponent());
  }

  it('should create with success data', () => {
    const successData: ConfirmationModalData = {
      success: true,
      totalProcessed: 81,
      insertedCount: 81,
      updatedCount: 0,
      message: 'Successfully committed 81 records (81 inserted, 0 updated).',
    };

    const component = createComponent(successData);
    expect(component).toBeTruthy();
    expect(component.data.success).toBe(true);
    expect(component.data.totalProcessed).toBe(81);
    expect(component.data.insertedCount).toBe(81);
    expect(component.data.updatedCount).toBe(0);
    expect(component.data.message).toBe('Successfully committed 81 records (81 inserted, 0 updated).');
  });

  it('should create with failure data', () => {
    const failureData: ConfirmationModalData = {
      success: false,
      totalProcessed: 0,
      insertedCount: 0,
      updatedCount: 0,
      message: 'Database transaction rolled back due to duplicate key error.',
    };

    const component = createComponent(failureData);
    expect(component).toBeTruthy();
    expect(component.data.success).toBe(false);
    expect(component.data.message).toContain('Database transaction rolled back');
  });

  it('should close dialog with success boolean when onClose is triggered', () => {
    const successData: ConfirmationModalData = {
      success: true,
      totalProcessed: 81,
      insertedCount: 81,
      updatedCount: 0,
      message: 'Committed successfully.',
    };

    const component = createComponent(successData);
    component.onClose();

    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('should close dialog with false when onClose is triggered on failure', () => {
    const failureData: ConfirmationModalData = {
      success: false,
      message: 'Network error occurred.',
    };

    const component = createComponent(failureData);
    component.onClose();

    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });
});
