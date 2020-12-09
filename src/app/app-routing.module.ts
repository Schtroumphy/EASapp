import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 

import { HomeRoutingModule } from './home/home-routing.module';
import { NavigationRoutingModule } from './navigation/navigation/navigation-routing.module';
import { DetailRoutingModule } from './detail/detail-routing.module';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
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
    NavigationRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
