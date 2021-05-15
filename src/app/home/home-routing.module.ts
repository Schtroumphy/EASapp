import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { AdvancedComponent } from '../advanced/advanced.component';
import { CalendarComponent } from '../calendar/calendar.component';
import { PatientsComponent } from '../patients/patients.component';
import { PlacesComponent } from '../places/places.component';
import { UserGuideComponent } from '../user-guide/user-guide.component';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';
import { DriversComponent } from '../drivers/drivers.component';

const routes: Routes = [
  {
    path: 'bottom-nav',
    component: BottomNavComponent, // this is the component with the <router-outlet> in the template
    children: [
      {
        path: '',
        redirectTo : 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'patients',
        component: PatientsComponent
      },
      {
        path: 'drivers',
        component: DriversComponent
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
      }
    ],
  },
];


@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
