import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ValidationPreviewDto,
  CommitImportDto,
  CommitResultDto,
} from '../models/import.model';

@Injectable({
  providedIn: 'root',
})
export class ImportsService {
  private readonly http = inject(HttpClient);

  /**
   * Client-side binary signature (magic number) verification.
   * Reads first 4 bytes from file header to confirm genuine XLSX (50 4B 03 04)
   * or legacy XLS (D0 CF 11 E0) format before uploading.
   */
  async verifyFileMagicNumber(file: File): Promise<boolean> {
    if (!file || file.size < 4) {
      return false;
    }

    try {
      const slice = file.slice(0, 4);
      const arrayBuffer = await slice.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Check ZIP / XLSX: 50 4B 03 04 ('PK\x03\x04')
      const isZip =
        bytes[0] === 0x50 &&
        bytes[1] === 0x4b &&
        bytes[2] === 0x03 &&
        bytes[3] === 0x04;

      // Check OLE2 / XLS: D0 CF 11 E0
      const isOls =
        bytes[0] === 0xd0 &&
        bytes[1] === 0xcf &&
        bytes[2] === 0x11 &&
        bytes[3] === 0xe0;

      return isZip || isOls;
    } catch {
      return false;
    }
  }

  /**
   * Upload an Excel workbook to the dry-run preview endpoint.
   * Checks database for duplicates and returns structured row validation results.
   */
  previewFile(file: File): Observable<ValidationPreviewDto> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<ValidationPreviewDto>('v1/imports/preview', formData);
  }

  /**
   * Commit validated rows into the database inside an atomic transaction.
   */
  commitImport(dto: CommitImportDto): Observable<CommitResultDto> {
    return this.http.post<CommitResultDto>('v1/imports/commit', dto);
  }
}
