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
import { NavigationComponent } from './navigation/navigation/navigation.component';
import { DriversComponent } from './drivers/drivers.component';
import { PatientsComponent } from './patients/patients.component';


import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms'
import {MatDialogModule} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatRadioModule} from '@angular/material/radio';

//Ng Bootstrap modules
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

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
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CommonModule } from '@angular/common';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { FlatpickrModule } from 'angularx-flatpickr';

//Services
import { DriverService } from '../app/core/services/app/driver.service'
import { PatientService } from '../app/core/services/app/patient.service'
import { PlaceService } from '../app/core/services/app/place.service'
import { ElectronService } from 'ngx-electron';
import { CalendarComponent } from './calendar/calendar.component';
import { EventService } from './core/services/app/event.service';
import { PlacesComponent } from './places/places.component';
import { EventComponent } from './event/event.component';
import { AdvancedComponent } from './advanced/advanced.component';
import { DatePipe } from '@angular/common';
import { UserGuideComponent } from './user-guide/user-guide.component';
import { AngularCalendarComponent } from './angular-calendar/angular-calendar.component';
import { ModuleWithProviders } from '@angular/core';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin, bootstrapPlugin, listPlugin,timeGridPlugin,interactionPlugin
]);



@NgModule({
  declarations: [AppComponent, NavigationComponent, DriversComponent, PatientsComponent, CalendarComponent, PlacesComponent, EventComponent, AdvancedComponent, UserGuideComponent, AngularCalendarComponent],
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
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatTableModule, MatInputModule, MatPaginatorModule, MatSortModule, MatProgressSpinnerModule,
    ReactiveFormsModule,
    FullCalendarModule,
    NgbModule,
    MatDialogModule,MatExpansionModule,MatRadioModule,
    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    CommonModule,
    NgbModalModule

  ],
  providers: [DriverService, ElectronService, PatientService, EventService, PlaceService, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule {
  
}
declare module "@angular/core" {
  interface ModuleWithProviders<T = any> {
    ngModule: Type<T>;
    providers?: Provider[];
  }
}


