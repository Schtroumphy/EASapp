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

  addAbsence(absence: Absence): Observable<Absence[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('add-absence', absence)
    ).pipe(catchError((error: any) => throwError(error.json)));
  }

}