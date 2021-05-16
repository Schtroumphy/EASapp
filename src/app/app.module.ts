import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { HomeModule } from './home/home.module';

import { AppComponent } from './app.component';

import { LayoutModule } from '@angular/cdk/layout';

//Full calendar
import { FullCalendarModule } from '@fullcalendar/angular'; // the main connector. must go first
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import bootstrapPlugin from '@fullcalendar/bootstrap';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin
]);

// Angular Calendar
import { CommonModule, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr);

//Services
import { DriverService } from '../app/core/services/app/driver.service'
import { PatientService } from '../app/core/services/app/patient.service'
import { PlaceService } from '../app/core/services/app/place.service'
import { ElectronService } from 'ngx-electron';
import { EventService } from './core/services/app/event.service';
import { DatePipe } from '@angular/common';
import { AuthComponent } from './auth/auth.component';
import { AuthentificationService } from './core/services/app/auth.service';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin, bootstrapPlugin, listPlugin,timeGridPlugin,interactionPlugin
]);

@NgModule({
  declarations: [AppComponent, AuthComponent],
  imports: [
    BrowserModule, BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    HomeModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    LayoutModule,
    
    CommonModule
  ],
  providers: [AuthentificationService, ElectronService, DatePipe],
  bootstrap: [AppComponent],
  entryComponents: [ ]
})
export class AppModule {}
