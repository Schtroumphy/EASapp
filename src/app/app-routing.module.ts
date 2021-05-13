import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { AuthComponent } from './auth/auth.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth', 
    pathMatch: 'full' 
  },
  {
    path: 'auth',
    component : AuthComponent
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    BrowserAnimationsModule,
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy', enableTracing:true, useHash: true}),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
