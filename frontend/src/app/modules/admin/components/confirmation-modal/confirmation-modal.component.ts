import {
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { CommitResultDto } from '../../../../core/models/import.model';

export type ConfirmationModalData = Partial<CommitResultDto> & {
  success: boolean;
  message: string;
};

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
  ],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationModalComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmationModalComponent>);
  readonly data = inject<ConfirmationModalData>(MAT_DIALOG_DATA);

  onClose(): void {
    this.dialogRef.close(this.data.success);
  }
}
