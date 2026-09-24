import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services/auth.service';
import { ImportsService } from '../../../../core/services/imports.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  ValidationPreviewDto,
  ValidationPreviewRowDto,
  CommitImportDto,
} from '../../../../core/models/import.model';
import { ValidationTableComponent } from '../validation-table/validation-table.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-import-file',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ValidationTableComponent,
    TranslatePipe,
  ],
  templateUrl: './import-file.component.html',
  styleUrl: './import-file.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportFileComponent {
  readonly authService = inject(AuthService);
  private readonly importsService = inject(ImportsService);
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);

  readonly file = signal<File | null>(null);
  readonly isValidating = signal<boolean>(false);
  readonly isUploading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly previewData = signal<ValidationPreviewDto | null>(null);
  readonly isDragging = signal<boolean>(false);

  readonly canValidate = computed<boolean>(() => {
    return this.file() !== null && !this.isValidating() && !this.isUploading() && this.authService.isAdmin();
  });

  triggerFilePicker(input: HTMLInputElement): void {
    if (!this.isValidating() && !this.isUploading()) {
      input.click();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isValidating() && !this.isUploading()) {
      this.isDragging.set(true);
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (this.isValidating() || this.isUploading()) return;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      await this.processIncomingFile(files[0]);
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      await this.processIncomingFile(input.files[0]);
      input.value = ''; // Reset input so same file can be re-selected if removed
    }
  }

  /**
   * Client-side validation for extension, size, and magic numbers.
   */
  async processIncomingFile(file: File): Promise<void> {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    // 1. Extension & MIME-type Check
    const isExtensionExcel = file.name.match(/\.(xlsx|xls)$/i);
    const validMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      '',
    ];
    if (!isExtensionExcel || (file.type && !validMimes.includes(file.type))) {
      this.errorMessage.set(
        `"${file.name}": Formato de archivo rechazado. Solo se permiten hojas de cálculo en formato Excel (.xlsx, .xls).`,
      );
      this.file.set(null);
      return;
    }

    // 2. File Size Constraint (Max 8 MB)
    const MAX_SIZE_BYTES = 8 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      this.errorMessage.set(
        `"${file.name}": El archivo excede el límite máximo de 8 MB (${this.formatBytes(file.size)}).`,
      );
      this.file.set(null);
      return;
    }

    // 3. Magic Number (Binary Signature) Check
    const hasValidSignature = await this.importsService.verifyFileMagicNumber(file);
    if (!hasValidSignature) {
      this.errorMessage.set(
        `"${file.name}": Firma binaria inválida. El archivo no corresponde a un documento Excel auténtico o contiene datos ejecutables. Transmisión bloqueada.`,
      );
      this.file.set(null);
      return;
    }

    this.file.set(file);
  }

  removeSelectedFile(): void {
    this.file.set(null);
    this.errorMessage.set(null);
  }

  clearError(): void {
    this.errorMessage.set(null);
  }

  clearSuccess(): void {
    this.successMessage.set(null);
  }

  /**
   * Calls preview endpoint to validate structure and check DB duplicate records.
   */
  validateFileOnServer(): void {
    const currentFile = this.file();
    if (!currentFile || !this.canValidate()) return;

    this.isValidating.set(true);
    this.errorMessage.set(null);

    this.importsService.previewFile(currentFile).subscribe({
      next: (previewResult) => {
        this.isValidating.set(false);
        this.previewData.set(previewResult);
      },
      error: (err) => {
        this.isValidating.set(false);
        const msg =
          err?.error?.message ||
          err?.message ||
          'Error al validar el archivo en el servidor. Verifica las columnas requeridas y tu conexión.';
        this.errorMessage.set(msg);
      },
    });
  }

  /**
   * Commit validated records to database.
   */
  onCommitRecords(rowsToCommit: ValidationPreviewRowDto[]): void {
    const preview = this.previewData();
    if (!preview || rowsToCommit.length === 0) return;

    this.isUploading.set(true);
    this.errorMessage.set(null);

    const payload: CommitImportDto = {
      category: preview.category,
      rows: rowsToCommit.map((r) => ({
        seasonCode: r.seasonCode,
        startYear: r.startYear,
        endYear: r.endYear,
        playerName: r.playerName,
        playerSlug: r.playerSlug,
        teamRaw: r.teamRaw,
        category: r.category,
        statValue: r.statValue,
        extraAttributes: r.extraAttributes,
      })),
    };

    this.importsService.commitImport(payload).subscribe({
      next: (result) => {
        this.isUploading.set(false);
        this.previewData.set(null);
        this.file.set(null);
        const localizedMsg = this.translate.instant('IMPORT_EXCEL.MODAL.SUCCESS_MESSAGE', {
          total: result.totalProcessed,
          inserted: result.insertedCount,
          updated: result.updatedCount,
        });
        this.successMessage.set(localizedMsg || result.message);

        this.dialog.open(ConfirmationModalComponent, {
          width: '520px',
          maxWidth: '95vw',
          panelClass: 'confirmation-dialog-panel',
          autoFocus: false,
          data: result,
        });
      },
      error: (err) => {
        this.isUploading.set(false);
        const msg =
          err?.error?.message ||
          err?.message ||
          'Error durante la confirmación en la base de datos. Se revirtió la transacción.';
        this.errorMessage.set(msg);

        this.dialog.open(ConfirmationModalComponent, {
          width: '520px',
          maxWidth: '95vw',
          panelClass: 'confirmation-dialog-panel',
          autoFocus: false,
          data: {
            success: false,
            totalProcessed: 0,
            insertedCount: 0,
            updatedCount: 0,
            message: msg,
          },
        });
      },
    });
  }

  onDiscardPreview(): void {
    this.previewData.set(null);
    this.errorMessage.set(null);
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
