import { NgModule } from '@angular/core';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { AdvancedComponent } from '../advanced/advanced.component';
import { CalendarComponent } from '../calendar/calendar.component';
import { DriversComponent } from '../drivers/drivers.component';
import { EventComponent } from '../event/event.component';
import { PatientsComponent } from '../patients/patients.component';
import { PlacesComponent } from '../places/places.component';
import { UserGuideComponent } from '../user-guide/user-guide.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core';
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { RandomcolorModule } from 'angular-randomcolor';
import { MatTabsModule } from '@angular/material/tabs';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { ChartsModule } from 'ng2-charts';

import { DriverService } from '../core/services/app/driver.service';
import { EventService } from '../core/services/app/event.service';
import { PatientService } from '../core/services/app/patient.service';
import { PlaceService } from '../core/services/app/place.service';
import { AbsenceService } from 'app/core/services/app/absence.service';

import { ReportComponent } from 'app/report/report.component';
import { AbsenceComponent } from 'app/absence/absence.component';
import { DataComponent } from 'app/data/data.component';
import { AbsenceTabsComponent } from 'app/absence-tabs/absence-tabs.component';
import { AbsenceInputComponent } from 'app/absence-input/absence-input.component';
import { AbsenceStatsComponent } from 'app/absence-stats/absence-stats.component';
import { AbsenceRecapComponent } from 'app/absence-recap/absence-recap.component';

@NgModule({
  declarations: [HomeComponent, BottomNavComponent, DriversComponent, PatientsComponent, CalendarComponent, PlacesComponent, EventComponent, AdvancedComponent, UserGuideComponent, ReportComponent,
    AbsenceComponent, DataComponent, AbsenceTabsComponent, AbsenceInputComponent, AbsenceStatsComponent, AbsenceRecapComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,

    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatDatepickerModule,MatNativeDateModule, MatMomentDateModule,
    MatListModule,
    MatTableModule, 
    MatInputModule,
    MatPaginatorModule, 
    MatSortModule, 
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
    FullCalendarModule,
    MatDialogModule,
    MatExpansionModule,MatRadioModule,
    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    NgSelectModule,
    RandomcolorModule,
    MatTabsModule,
    DragDropModule,
    NgbModule,
    ScrollingModule,
    ChartsModule
  ],
  providers: [DriverService, PatientService, EventService, PlaceService, AbsenceService, DatePipe],

  exports: [ReactiveFormsModule]
})
export class HomeModule {}
