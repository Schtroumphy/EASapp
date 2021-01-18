import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 

import { HomeRoutingModule } from './home/home-routing.module';
import { NavigationRoutingModule } from './navigation/navigation/navigation-routing.module';
import { DetailRoutingModule } from './detail/detail-routing.module';
import { DriversRoutingModule } from './drivers/drivers-routing.module';
import { PatientsComponent } from './patients/patients.component';
import { CalendarComponent } from './calendar/calendar.component';
import { PlacesComponent } from './places/places.component';
import { AdvancedComponent } from './advanced/advanced.component';
import { UserGuideComponent } from './user-guide/user-guide.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'patients',
    component: PatientsComponent
  },
  {
    path: 'places',
    component: PlacesComponent
  },
  {
    path: 'calendar',
    component: CalendarComponent
  },
  {
    path: 'calendar/:p1',
    component: CalendarComponent
  },
  {
    path: 'advanced',
    component: AdvancedComponent
  },
  {
    path: 'guide',
    component: UserGuideComponent
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    BrowserAnimationsModule,
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
    HomeRoutingModule,
    DetailRoutingModule,
    NavigationRoutingModule,
    DriversRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
