import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electron';
import { Observable, of, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Evenement } from '../../models/evenement.schema';

@Injectable()
export class EventService {
  constructor(private _electronService: ElectronService) {}


  getEvents(): Observable<Evenement[]> {
    return of(this._electronService.ipcRenderer.sendSync('get-events')).pipe(
      catchError((error: any) => throwError(error.json))
    );
  }

  addEvent(event: Evenement): Observable<Evenement[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('add-event', event)
    ).pipe(catchError((error: any) => throwError(error.json)));
  }

  deleteEvent(event: Evenement): Observable<Evenement[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('delete-event', event)
    ).pipe(catchError((error: any) => throwError(error.json)));
  }

  updateEvent(event: Evenement): Observable<Evenement[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('update-event', event)
    ).pipe(catchError((error: any) => throwError(error.json)));
  }
}