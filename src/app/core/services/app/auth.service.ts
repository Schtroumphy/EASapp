import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electron';
import { Observable, of, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Authentification } from '../../models/auth.schema';

@Injectable()
export class AuthentificationService {
  constructor(private _electronService: ElectronService) {}

  getAuthByIdentifiant(identifiant : string): Observable<Authentification> {
    return of(this._electronService.ipcRenderer.sendSync('get-auth-by-identifiant', identifiant)).pipe(
      catchError((error: any) => throwError(error.json))
    );
  }
    
  addAuthentification(authentification: Authentification): Observable<Authentification[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('add-authentification', authentification)
    ).pipe(catchError((error: any) => 
      throwError("AUTH ERROR : ", error.json)
    ));
  }
 
}