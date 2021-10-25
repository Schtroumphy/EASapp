import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electron';
import { Observable, of, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Absence } from '../../models/absence.schema';

@Injectable()
export class AbsenceService {
  constructor(private _electronService: ElectronService) {}

  getAllAbsences(): Observable<Absence[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('get-all-absences')
    ).pipe(catchError((error: any) => throwError(error.json)));
  }

  getAllAbsencesByYear(year : string): Observable<Absence[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('get-all-absences-by-year')
    ).pipe(catchError((error: any) => throwError(error.json)));
  }

  addAbsence(absence: Absence): Observable<Absence[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('add-absence', absence)
    ).pipe(catchError((error: any) => throwError(error.json)));
  }

  deleteAbsence(absenceId: number): Observable<Absence[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('delete-absence', absenceId)
    ).pipe(catchError((error: any) => throwError(error.json)));
  }

  updateAbsence(absence: Absence): Observable<Absence[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('update-absence', absence)
    ).pipe(catchError((error: any) => throwError(error.json)));
  }

}