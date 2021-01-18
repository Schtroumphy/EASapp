import { Injectable } from '@angular/core';

import { Patient } from '../../models/patient.schema';

import { ElectronService } from 'ngx-electron';
import { Observable, of, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class PatientService {
  constructor(private _electronService: ElectronService) {}

  getPatients(): Observable<Patient[]> {
    return of(this._electronService.ipcRenderer.sendSync('get-patients')).pipe(
      catchError((error: any) => throwError(error.json))
    );
  }

  getPatientById(patientId : number): Observable<Patient> {
    return of(this._electronService.ipcRenderer.sendSync('get-patient-by-id', patientId)).pipe(
      catchError((error: any) => throwError(error.json))
    );
  }

  addPatient(patient: Patient): Observable<Patient[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('add-patient', patient)
    ).pipe(catchError((error: any) => throwError(error.json)));
  }
  deletePatient(patient: Patient): Observable<Patient[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('delete-patient', patient)
    ).pipe(catchError((error: any) => throwError(error.json)));
  }

  updatePatient(patient: Patient): Observable<Patient[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('update-patient', patient)
    ).pipe(catchError((error: any) => throwError(error.json)));
  }
}